import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/maintenance - List all maintenance schedules
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
        const status = searchParams.get('status');
        const resourceId = searchParams.get('resourceId');

        const where: any = {};
        if (status) where.status = status;
        if (resourceId) where.resourceId = parseInt(resourceId);

        const maintenance = await prisma.maintenance.findMany({
            where,
            include: {
                resource: {
                    include: {
                        resourceType: true,
                        building: true
                    }
                }
            },
            orderBy: { scheduledDate: 'asc' }
        });

        return NextResponse.json({ maintenance });
    } catch (error) {
        console.error('Error fetching maintenance:', error);
        return NextResponse.json({ error: 'Failed to fetch maintenance' }, { status: 500 });
    }
}

// POST /api/maintenance - Create maintenance schedule
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { resourceId, maintenanceType, scheduledDate, notes } = body;

        if (!resourceId || !maintenanceType || !scheduledDate) {
            return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
        }

        const maintenance = await prisma.maintenance.create({
            data: {
                resourceId: parseInt(resourceId),
                maintenanceType: maintenanceType.trim(),
                scheduledDate: new Date(scheduledDate),
                notes: notes?.trim() || null,
                status: 'SCHEDULED'
            },
            include: { resource: true }
        });

        return NextResponse.json({ maintenance }, { status: 201 });
    } catch (error) {
        console.error('Error creating maintenance:', error);
        return NextResponse.json({ error: 'Failed to create maintenance' }, { status: 500 });
    }
}
