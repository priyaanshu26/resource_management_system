import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST /api/bookings/[id]/reject - Reject booking
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

        const id = parseInt(params.id);
        const booking = await prisma.booking.findUnique({
            where: { id }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status !== 'PENDING') {
            return NextResponse.json({ error: 'Can only reject pending bookings' }, { status: 400 });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approverId: payload.userId
            },
            include: {
                resource: true,
                user: true
            }
        });

        // TODO: Send notification to user

        return NextResponse.json({ booking: updated });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 });
    }
}
