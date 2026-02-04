import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/dashboard/stats - Get dashboard statistics
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

        // Get stats based on role
        const stats: any = {};

        // Total resources (for all users)
        stats.totalResources = await prisma.resource.count();

        // User's bookings
        stats.myBookings = await prisma.booking.count({
            where: { userId: payload.userId }
        });

        // Admin-only stats
        if (payload.role === 'ADMIN') {
            stats.totalBookings = await prisma.booking.count();
            stats.pendingApprovals = await prisma.booking.count({
                where: { status: 'PENDING' }
            });
            stats.totalUsers = await prisma.user.count();
            stats.totalBuildings = await prisma.building.count();
            stats.totalResourceTypes = await prisma.resourceType.count();

            // Upcoming bookings (next 7 days)
            const now = new Date();
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);

            stats.upcomingBookings = await prisma.booking.count({
                where: {
                    status: 'APPROVED',
                    startDatetime: {
                        gte: now,
                        lte: nextWeek
                    }
                }
            });

            // Recent bookings
            stats.recentBookings = await prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    resource: {
                        select: { resourceName: true }
                    },
                    user: {
                        select: { name: true }
                    }
                }
            });
        } else {
            // User's upcoming bookings
            const now = new Date();
            stats.upcomingBookings = await prisma.booking.findMany({
                where: {
                    userId: payload.userId,
                    status: { in: ['PENDING', 'APPROVED'] },
                    startDatetime: { gte: now }
                },
                take: 5,
                orderBy: { startDatetime: 'asc' },
                include: {
                    resource: {
                        select: { resourceName: true }
                    }
                }
            });
        }

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
