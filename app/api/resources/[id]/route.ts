import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/resources/[id] - Get resource with all details
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
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const resource = await prisma.resource.findUnique({
            where: { id },
            include: {
                resourceType: true,
                building: true,
                facilities: true,
                cupboards: {
                    include: {
                        shelves: true
                    }
                },
                bookings: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                maintenance: {
                    take: 10,
                    orderBy: { scheduledDate: 'desc' }
                }
            }
        });

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json({ resource });
    } catch (error) {
        console.error('Error fetching resource:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resource' },
            { status: 500 }
        );
    }
}

// PUT /api/resources/[id] - Update resource
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
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        const { resourceName, resourceTypeId, buildingId, floorNumber, description } = body;

        if (!resourceName || !resourceTypeId || !buildingId || floorNumber === undefined) {
            return NextResponse.json(
                { error: 'All required fields must be provided' },
                { status: 400 }
            );
        }

        // Validate floor number
        const building = await prisma.building.findUnique({
            where: { id: parseInt(buildingId) }
        });

        if (!building) {
            return NextResponse.json(
                { error: 'Building not found' },
                { status: 404 }
            );
        }

        if (floorNumber < 0 || floorNumber > building.totalFloors) {
            return NextResponse.json(
                { error: `Floor number must be between 0 and ${building.totalFloors}` },
                { status: 400 }
            );
        }

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                resourceName: resourceName.trim(),
                resourceTypeId: parseInt(resourceTypeId),
                buildingId: parseInt(buildingId),
                floorNumber: parseInt(floorNumber),
                description: description?.trim() || null
            },
            include: {
                resourceType: true,
                building: true
            }
        });

        return NextResponse.json({ resource });
    } catch (error) {
        console.error('Error updating resource:', error);
        return NextResponse.json(
            { error: 'Failed to update resource' },
            { status: 500 }
        );
    }
}

// DELETE /api/resources/[id] - Delete resource
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
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const resource = await prisma.resource.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        bookings: true,
                        facilities: true,
                        cupboards: true,
                        maintenance: true
                    }
                }
            }
        });

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // Check for active bookings
        const activeBookings = await prisma.booking.count({
            where: {
                resourceId: id,
                status: { in: ['PENDING', 'APPROVED'] },
                endDatetime: { gte: new Date() }
            }
        });

        if (activeBookings > 0) {
            return NextResponse.json(
                { error: `Cannot delete resource with ${activeBookings} active bookings` },
                { status: 400 }
            );
        }

        await prisma.resource.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json(
            { error: 'Failed to delete resource' },
            { status: 500 }
        );
    }
}
