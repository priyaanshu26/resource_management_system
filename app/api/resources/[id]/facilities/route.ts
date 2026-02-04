import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/resources/[id]/facilities - List facilities for a resource
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resourceId = parseInt(params.id);
        const facilities = await prisma.facility.findMany({
            where: { resourceId },
            orderBy: { facilityName: 'asc' }
        });

        return NextResponse.json({ facilities });
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
    }
}

// POST /api/resources/[id]/facilities - Add facility to resource
export async function POST(
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

        const resourceId = parseInt(params.id);
        const body = await request.json();
        const { facilityName, details } = body;

        if (!facilityName) {
            return NextResponse.json({ error: 'Facility name is required' }, { status: 400 });
        }

        const facility = await prisma.facility.create({
            data: {
                resourceId,
                facilityName: facilityName.trim(),
                details: details?.trim() || null
            }
        });

        return NextResponse.json({ facility }, { status: 201 });
    } catch (error) {
        console.error('Error creating facility:', error);
        return NextResponse.json({ error: 'Failed to create facility' }, { status: 500 });
    }
}
