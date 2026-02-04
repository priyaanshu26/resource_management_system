import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/resource-types - List all resource types
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const resourceTypes = await prisma.resourceType.findMany({
            include: {
                _count: {
                    select: { resources: true }
                }
            },
            orderBy: { typeName: 'asc' }
        });

        return NextResponse.json({ resourceTypes });
    } catch (error) {
        console.error('Error fetching resource types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resource types' },
            { status: 500 }
        );
    }
}

// POST /api/resource-types - Create new resource type
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { typeName } = body;

        if (!typeName || typeName.trim() === '') {
            return NextResponse.json(
                { error: 'Type name is required' },
                { status: 400 }
            );
        }

        // Check if resource type already exists
        const existing = await prisma.resourceType.findUnique({
            where: { typeName: typeName.trim() }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Resource type already exists' },
                { status: 400 }
            );
        }

        const resourceType = await prisma.resourceType.create({
            data: {
                typeName: typeName.trim()
            }
        });

        return NextResponse.json({ resourceType }, { status: 201 });
    } catch (error) {
        console.error('Error creating resource type:', error);
        return NextResponse.json(
            { error: 'Failed to create resource type' },
            { status: 500 }
        );
    }
}
