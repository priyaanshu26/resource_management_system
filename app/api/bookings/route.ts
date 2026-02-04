import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/bookings - List bookings (user's own or all for admin)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {};

        // Non-admin users can only see their own bookings
        if (payload.role !== 'ADMIN') {
            where.userId = payload.userId;
        }

        if (status) {
            where.status = status;
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                resource: {
                    include: {
                        resourceType: true,
                        building: true
                    }
                },
                user: {
                    select: { id: true, name: true, email: true }
                },
                approver: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { resourceId, startDatetime, endDatetime, purpose } = body;

        if (!resourceId || !startDatetime || !endDatetime) {
            return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
        }

        const start = new Date(startDatetime);
        const end = new Date(endDatetime);

        if (start >= end) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        if (start < new Date()) {
            return NextResponse.json({ error: 'Cannot book past dates' }, { status: 400 });
        }

        // Check for conflicting bookings
        const conflicts = await prisma.booking.count({
            where: {
                resourceId: parseInt(resourceId),
                status: { in: ['PENDING', 'APPROVED'] },
                OR: [
                    {
                        AND: [
                            { startDatetime: { lte: start } },
                            { endDatetime: { gt: start } }
                        ]
                    },
                    {
                        AND: [
                            { startDatetime: { lt: end } },
                            { endDatetime: { gte: end } }
                        ]
                    },
                    {
                        AND: [
                            { startDatetime: { gte: start } },
                            { endDatetime: { lte: end } }
                        ]
                    }
                ]
            }
        });

        if (conflicts > 0) {
            return NextResponse.json({ error: 'Resource is already booked for this time slot' }, { status: 400 });
        }

        const booking = await prisma.booking.create({
            data: {
                resourceId: parseInt(resourceId),
                userId: payload.userId,
                startDatetime: start,
                endDatetime: end,
                purpose: purpose?.trim() || null,
                status: 'PENDING'
            },
            include: {
                resource: true
            }
        });

        return NextResponse.json({ booking }, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
