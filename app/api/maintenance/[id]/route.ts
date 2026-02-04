import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PUT /api/maintenance/[id] - Update maintenance
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
        const body = await request.json();
        const { maintenanceType, scheduledDate, status, notes } = body;

        const maintenance = await prisma.maintenance.update({
            where: { id },
            data: {
                maintenanceType: maintenanceType?.trim(),
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
                status,
                notes: notes?.trim()
            }
        });

        return NextResponse.json({ maintenance });
    } catch (error) {
        console.error('Error updating maintenance:', error);
        return NextResponse.json({ error: 'Failed to update maintenance' }, { status: 500 });
    }
}

// DELETE /api/maintenance/[id] - Delete maintenance
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
        await prisma.maintenance.delete({ where: { id } });

        return NextResponse.json({ message: 'Maintenance deleted successfully' });
    } catch (error) {
        console.error('Error deleting maintenance:', error);
        return NextResponse.json({ error: 'Failed to delete maintenance' }, { status: 500 });
    }
}
