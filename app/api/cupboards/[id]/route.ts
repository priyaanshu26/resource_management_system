import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PUT - Update cupboard
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
        await prisma.cupboard.delete({ where: { id } });

        return NextResponse.json({ message: 'Cupboard deleted successfully' });
    } catch (error) {
        console.error('Error deleting cupboard:', error);
        return NextResponse.json({ error: 'Failed to delete cupboard' }, { status: 500 });
    }
}
