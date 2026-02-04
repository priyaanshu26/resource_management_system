import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/resources - List all resources with filters
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const resourceTypeId = searchParams.get('resourceTypeId');
        const buildingId = searchParams.get('buildingId');
        const search = searchParams.get('search');

        const where: any = {};

        if (resourceTypeId) {
            where.resourceTypeId = parseInt(resourceTypeId);
        }

        if (buildingId) {
            where.buildingId = parseInt(buildingId);
        }

        if (search) {
            where.resourceName = {
                contains: search,
                mode: 'insensitive'
            };
        }

        const resources = await prisma.resource.findMany({
            where,
            include: {
                resourceType: {
                    select: { typeName: true }
                },
                building: {
                    select: { buildingName: true, buildingNumber: true }
                },
                _count: {
                    select: {
                        facilities: true,
                        cupboards: true,
                        bookings: true
                    }
                }
            },
            orderBy: { resourceName: 'asc' }
        });

        return NextResponse.json({ resources });
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resources' },
            { status: 500 }
        );
    }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { resourceName, resourceTypeId, buildingId, floorNumber, description } = body;

        if (!resourceName || !resourceTypeId || !buildingId || floorNumber === undefined) {
            return NextResponse.json(
                { error: 'All required fields must be provided' },
                { status: 400 }
            );
        }

        // Validate floor number against building's total floors
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

        const resource = await prisma.resource.create({
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

        return NextResponse.json({ resource }, { status: 201 });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json(
            { error: 'Failed to create resource' },
            { status: 500 }
        );
    }
}
