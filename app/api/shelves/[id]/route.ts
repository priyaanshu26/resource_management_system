import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PUT /api/shelves/[id] - Update shelf
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();
        const { capacity, description } = body;

        const shelf = await prisma.shelf.update({
            where: { id },
            data: {
                capacity: capacity ? parseInt(capacity) : undefined,
                description: description?.trim() || undefined
            }
        });

        return NextResponse.json({ shelf });
    } catch (error) {
        console.error('Error updating shelf:', error);
        return NextResponse.json({ error: 'Failed to update shelf' }, { status: 500 });
    }
}

// DELETE /api/shelves/[id] - Delete shelf
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id: idParam } = await params;
        const id = parseInt(idParam);

        await prisma.shelf.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Shelf deleted successfully' });
    } catch (error) {
        console.error('Error deleting shelf:', error);
        return NextResponse.json({ error: 'Failed to delete shelf' }, { status: 500 });
    }
}
