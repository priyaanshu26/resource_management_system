import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getAuthUser } from '@/lib/auth';

// PUT - Update cupboard
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
        const { cupboardName, totalShelves } = body;

        const cupboard = await prisma.cupboard.update({
            where: { id },
            data: {
                cupboardName: cupboardName.trim(),
                totalShelves: parseInt(totalShelves)
            }
        });

        return NextResponse.json({ cupboard });
    } catch (error) {
        console.error('Error updating cupboard:', error);
        return NextResponse.json({ error: 'Failed to update cupboard' }, { status: 500 });
    }
}

// DELETE - Delete cupboard
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        await prisma.cupboard.delete({ where: { id } });

        return NextResponse.json({ message: 'Cupboard deleted successfully' });
    } catch (error) {
        console.error('Error deleting cupboard:', error);
        return NextResponse.json({ error: 'Failed to delete cupboard' }, { status: 500 });
    }
}
