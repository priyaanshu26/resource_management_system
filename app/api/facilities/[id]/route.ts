import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getAuthUser } from '@/lib/auth';

// PUT /api/facilities/[id] - Update facility
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
        const { facilityName, details } = body;

        const facility = await prisma.facility.update({
            where: { id },
            data: {
                facilityName: facilityName.trim(),
                details: details?.trim() || null
            }
        });

        return NextResponse.json({ facility });
    } catch (error) {
        console.error('Error updating facility:', error);
        return NextResponse.json({ error: 'Failed to update facility' }, { status: 500 });
    }
}

// DELETE /api/facilities/[id] - Delete facility
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        await prisma.facility.delete({ where: { id } });

        return NextResponse.json({ message: 'Facility deleted successfully' });
    } catch (error) {
        console.error('Error deleting facility:', error);
        return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 });
    }
}
