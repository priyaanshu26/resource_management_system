import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/reports/resources - Get resource utilization statistics
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

        // Resources by type
        const resourcesByType = await prisma.resource.groupBy({
            by: ['resourceTypeId'],
            _count: true
        });

        const typeIds = resourcesByType.map(r => r.resourceTypeId);
        const types = await prisma.resourceType.findMany({
            where: { id: { in: typeIds } }
        });

        const typeDistribution = resourcesByType.map(stat => {
            const type = types.find(t => t.id === stat.resourceTypeId);
            return {
                typeName: type?.typeName,
                count: stat._count
            };
        });

        // Resources by building
        const resourcesByBuilding = await prisma.resource.groupBy({
            by: ['buildingId'],
            _count: true
        });

        const buildingIds = resourcesByBuilding.map(r => r.buildingId);
        const buildings = await prisma.building.findMany({
            where: { id: { in: buildingIds } }
        });

        const buildingDistribution = resourcesByBuilding.map(stat => {
            const building = buildings.find(b => b.id === stat.buildingId);
            return {
                buildingName: building?.buildingName,
                count: stat._count
            };
        });

        // Utilization rate (resources with bookings in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const resourcesWithBookings = await prisma.resource.findMany({
            where: {
                bookings: {
                    some: {
                        createdAt: { gte: thirtyDaysAgo }
                    }
                }
            },
            include: {
                _count: {
                    select: { bookings: true }
                }
            }
        });

        const totalResources = await prisma.resource.count();
        const utilizationRate = totalResources > 0
            ? (resourcesWithBookings.length / totalResources) * 100
            : 0;

        // Maintenance statistics
        const maintenanceStats = await prisma.maintenance.groupBy({
            by: ['status'],
            _count: true
        });

        return NextResponse.json({
            report: {
                totalResources,
                resourcesByType: typeDistribution,
                resourcesByBuilding: buildingDistribution,
                utilizationRate: utilizationRate.toFixed(2),
                activeResources: resourcesWithBookings.length,
                maintenanceStats
            }
        });
    } catch (error) {
        console.error('Error generating resource report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
