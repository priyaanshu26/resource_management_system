import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PUT /api/facilities/[id] - Update facility
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
        await prisma.facility.delete({ where: { id } });

        return NextResponse.json({ message: 'Facility deleted successfully' });
    } catch (error) {
        console.error('Error deleting facility:', error);
        return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 });
    }
}
