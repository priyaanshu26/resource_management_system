import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - List cupboards for a resource
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
        const cupboards = await prisma.cupboard.findMany({
            where: { resourceId },
            include: { shelves: true }
        });

        return NextResponse.json({ cupboards });
    } catch (error) {
        console.error('Error fetching cupboards:', error);
        return NextResponse.json({ error: 'Failed to fetch cupboards' }, { status: 500 });
    }
}

// POST - Add cupboard to resource
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
        const { cupboardName, totalShelves } = body;

        if (!cupboardName || !totalShelves) {
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });
        }

        const cupboard = await prisma.cupboard.create({
            data: {
                resourceId,
                cupboardName: cupboardName.trim(),
                totalShelves: parseInt(totalShelves)
            }
        });

        return NextResponse.json({ cupboard }, { status: 201 });
    } catch (error) {
        console.error('Error creating cupboard:', error);
        return NextResponse.json({ error: 'Failed to create cupboard' }, { status: 500 });
    }
}
