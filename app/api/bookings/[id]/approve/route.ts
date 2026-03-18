import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getAuthUser } from '@/lib/auth';

// POST /api/bookings/[id]/approve - Approve booking
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getAuthUser(request);
        if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { resource: true }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status !== 'PENDING') {
            return NextResponse.json({ error: 'Can only approve pending bookings' }, { status: 400 });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approverId: payload.userId
            },
            include: {
                resource: true,
                user: true
            }
        });

        // Automatically create a maintenance alert for the resource
        // This keeps the resource in good condition for the next user
        try {
            await Promise.all([
                prisma.maintenance.create({
                    data: {
                        resourceId: updated.resourceId,
                        maintenanceType: 'Routine Cleaning/Inspection',
                        scheduledDate: updated.endDatetime, // Schedule it for after the booking ends
                        status: 'SCHEDULED',
                        notes: `Automatic maintenance scheduled following booking #${updated.id} by ${updated.user.name}.`
                    }
                })
            ]);
        } catch (mErr) {
            console.error('Failed to create automatic maintenance:', mErr);
            // We don't fail the approval if side effects fail, but we log it
        }

        return NextResponse.json({ booking: updated });
    } catch (error) {
        console.error('Error approving booking:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({
            error: 'Failed to approve booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
