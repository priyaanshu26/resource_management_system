import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, hashPassword } from '@/lib/auth';
import { Role } from '@prisma/client';

// PUT /api/users/[id] - Update user details
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const payload = await getAuthUser(request);
        
        if (!payload || payload.role !== 'ADMIN') { 
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); 
        }

        const body = await request.json();
        const { name, email, role, password } = body;

        if (!name || !email || !role) {
            return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
        }

        const validRoles: Role[] = ['ADMIN', 'EMPLOYEE', 'STUDENT'];
        if (!validRoles.includes(role as Role)) {
            return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = {
            name: name.trim(),
            email: email.trim(),
            role: role as Role
        };

        // Handle password change if provided
        if (password && password.trim().length >= 6) {
            updateData.password = await hashPassword(password);
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { id } });
        if (!userExists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Perform update
        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ 
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        
        // Handle duplicate email error from Prisma
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
        }
        
        return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
    }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        // Prevent self-deletion
        if (id === payload.userId) {
            return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
    }
}
