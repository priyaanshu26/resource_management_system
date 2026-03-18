import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getAuthUser } from '@/lib/auth';

// PUT /api/maintenance/[id] - Update maintenance
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        await prisma.maintenance.delete({ where: { id } });

        return NextResponse.json({ message: 'Maintenance deleted successfully' });
    } catch (error) {
        console.error('Error deleting maintenance:', error);
        return NextResponse.json({ error: 'Failed to delete maintenance' }, { status: 500 });
    }
}
