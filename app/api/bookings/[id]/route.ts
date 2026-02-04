import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/bookings/[id] - Get booking details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const id = parseInt(params.id);
        const booking = await prisma.booking.findUnique({
            where: { id },
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
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Check permissions
        if (payload.role !== 'ADMIN' && booking.userId !== payload.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ booking });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
}

// PUT /api/bookings/[id] - Update booking (cancel)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const id = parseInt(params.id);
        const body = await request.json();
        const { status } = body;

        const booking = await prisma.booking.findUnique({
            where: { id }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Only owner can cancel their booking
        if (booking.userId !== payload.userId && payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Can only cancel PENDING or APPROVED bookings
        if (!['PENDING', 'APPROVED'].includes(booking.status)) {
            return NextResponse.json({ error: 'Can only cancel pending or approved bookings' }, { status: 400 });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: { status: status === 'CANCELLED' ? 'CANCELLED' : booking.status }
        });

        return NextResponse.json({ booking: updated });
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}

// DELETE /api/bookings/[id] - Delete booking
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const id = parseInt(params.id);
        const booking = await prisma.booking.findUnique({ where: { id } });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.userId !== payload.userId && payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.booking.delete({ where: { id } });

        return NextResponse.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
