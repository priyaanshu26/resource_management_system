import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getAuthUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const body = await request.json();
        const { role } = body;

        if (!role || !['ADMIN', 'USER'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: parseInt(params.id) },
            data: { role: role as Role }
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
}
