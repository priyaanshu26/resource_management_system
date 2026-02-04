import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/resource-types/[id] - Get single resource type
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

        const resourceType = await prisma.resourceType.findUnique({
            where: { id },
            include: {
                resources: {
                    select: {
                        id: true,
                        resourceName: true,
                        building: {
                            select: {
                                buildingName: true
                            }
                        }
                    }
                }
            }
        });

        if (!resourceType) {
            return NextResponse.json({ error: 'Resource type not found' }, { status: 404 });
        }

        return NextResponse.json({ resourceType });
    } catch (error) {
        console.error('Error fetching resource type:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resource type' },
            { status: 500 }
        );
    }
}

// PUT /api/resource-types/[id] - Update resource type
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
        const { typeName } = body;

        if (!typeName || typeName.trim() === '') {
            return NextResponse.json(
                { error: 'Type name is required' },
                { status: 400 }
            );
        }

        // Check if another resource type with same name exists
        const existing = await prisma.resourceType.findFirst({
            where: {
                typeName: typeName.trim(),
                NOT: { id }
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Resource type with this name already exists' },
                { status: 400 }
            );
        }

        const resourceType = await prisma.resourceType.update({
            where: { id },
            data: {
                typeName: typeName.trim()
            }
        });

        return NextResponse.json({ resourceType });
    } catch (error) {
        console.error('Error updating resource type:', error);
        return NextResponse.json(
            { error: 'Failed to update resource type' },
            { status: 500 }
        );
    }
}

// DELETE /api/resource-types/[id] - Delete resource type
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

        // Check if resource type has associated resources
        const resourceType = await prisma.resourceType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { resources: true }
                }
            }
        });

        if (!resourceType) {
            return NextResponse.json({ error: 'Resource type not found' }, { status: 404 });
        }

        if (resourceType._count.resources > 0) {
            return NextResponse.json(
                { error: `Cannot delete resource type with ${resourceType._count.resources} associated resources` },
                { status: 400 }
            );
        }

        await prisma.resourceType.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Resource type deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource type:', error);
        return NextResponse.json(
            { error: 'Failed to delete resource type' },
            { status: 500 }
        );
    }
}
