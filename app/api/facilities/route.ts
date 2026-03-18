import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/facilities - List all facilities
export async function GET(request: NextRequest) {
    try {
        const payload = await getAuthUser(request);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const facilities = await prisma.facility.findMany({
            include: {
                resource: {
                    select: { resourceName: true }
                }
            },
            orderBy: { id: 'desc' }
        });

        return NextResponse.json({ facilities });
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
    }
}

// POST /api/facilities - Create a new facility
export async function POST(request: NextRequest) {
    try {
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { facilityName, description, resourceId } = body;

        if (!facilityName || !resourceId) {
            return NextResponse.json({ error: 'Facility name and resource ID are required' }, { status: 400 });
        }

        const facility = await prisma.facility.create({
            data: {
                facilityName,
                details: description,
                resourceId: parseInt(resourceId)
            },
            include: {
                resource: {
                    select: { resourceName: true }
                }
            }
        });

        return NextResponse.json({ facility }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating facility:', error);
        return NextResponse.json({ error: error.message || 'Failed to create facility' }, { status: 500 });
    }
}
