import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/buildings - List all buildings
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

        const buildings = await prisma.building.findMany({
            include: {
                _count: {
                    select: { resources: true }
                }
            },
            orderBy: { buildingName: 'asc' }
        });

        return NextResponse.json({ buildings });
    } catch (error) {
        console.error('Error fetching buildings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch buildings' },
            { status: 500 }
        );
    }
}

// POST /api/buildings - Create new building
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
        const { buildingName, buildingNumber, totalFloors } = body;

        if (!buildingName || !buildingNumber || !totalFloors) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (totalFloors < 1) {
            return NextResponse.json(
                { error: 'Total floors must be at least 1' },
                { status: 400 }
            );
        }

        const building = await prisma.building.create({
            data: {
                buildingName: buildingName.trim(),
                buildingNumber: buildingNumber.trim(),
                totalFloors: parseInt(totalFloors)
            }
        });

        return NextResponse.json({ building }, { status: 201 });
    } catch (error) {
        console.error('Error creating building:', error);
        return NextResponse.json(
            { error: 'Failed to create building' },
            { status: 500 }
        );
    }
}
