import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/reports/bookings - Get booking statistics
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Total bookings by status
        const bookingsByStatus = await prisma.booking.groupBy({
            by: ['status'],
            where,
            _count: true
        });

        // Bookings by resource type
        const bookingsByResourceType = await prisma.booking.groupBy({
            by: ['resourceId'],
            where,
            _count: true
        });

        const resourceIds = bookingsByResourceType.map(b => b.resourceId);
        const resources = await prisma.resource.findMany({
            where: { id: { in: resourceIds } },
            include: { resourceType: true }
        });

        const typeStats: any = {};
        bookingsByResourceType.forEach(stat => {
            const resource = resources.find(r => r.id === stat.resourceId);
            if (resource) {
                const typeName = resource.resourceType.typeName;
                typeStats[typeName] = (typeStats[typeName] || 0) + stat._count;
            }
        });

        // Most booked resources
        const mostBookedResources = await prisma.booking.groupBy({
            by: ['resourceId'],
            where,
            _count: true,
            orderBy: { _count: { resourceId: 'desc' } },
            take: 10
        });

        const topResources = await prisma.resource.findMany({
            where: { id: { in: mostBookedResources.map(r => r.resourceId) } },
            include: { resourceType: true, building: true }
        });

        const mostBooked = mostBookedResources.map(stat => {
            const resource = topResources.find(r => r.id === stat.resourceId);
            return {
                resource: resource,
                count: stat._count
            };
        });

        // User booking statistics
        const userStats = await prisma.booking.groupBy({
            by: ['userId'],
            where,
            _count: true,
            orderBy: { _count: { userId: 'desc' } },
            take: 10
        });

        const topUsers = await prisma.user.findMany({
            where: { id: { in: userStats.map(u => u.userId) } },
            select: { id: true, name: true, email: true, role: true }
        });

        const topBookers = userStats.map(stat => {
            const user = topUsers.find(u => u.id === stat.userId);
            return {
                user,
                count: stat._count
            };
        });

        return NextResponse.json({
            report: {
                bookingsByStatus,
                bookingsByResourceType: typeStats,
                mostBookedResources: mostBooked,
                topBookers,
                totalBookings: await prisma.booking.count({ where })
            }
        });
    } catch (error) {
        console.error('Error generating booking report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
