'use client';

import { useEffect, useState } from 'react';

interface Booking {
    id: number;
    startDatetime: string;
    endDatetime: string;
    status: string;
    purpose: string | null;
    resource: {
        resourceName: string;
        resourceType: { typeName: string };
        building: { buildingName: string };
    };
    user: { name: string; email: string };
    approver: { name: string } | null;
    createdAt: string;
}

export default function ApprovalsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchPendingBookings();
    }, []);

    const fetchPendingBookings = async () => {
        try {
            const res = await fetch('/api/bookings?status=PENDING');
            const data = await res.json();
            if (data.bookings) {
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const res = await fetch(`/api/bookings/${id}/approve`, {
                method: 'POST'
            });

            if (res.ok) {
                setSuccessMessage('Booking approved successfully');
                fetchPendingBookings();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to approve booking');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to reject this booking?')) {
            return;
        }

        try {
            const res = await fetch(`/api/bookings/${id}/reject`, {
                method: 'POST'
            });

            if (res.ok) {
                setSuccessMessage('Booking rejected');
                fetchPendingBookings();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to reject booking');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                <p className="text-gray-600 mt-1">Review and approve/reject booking requests</p>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">No pending approvals</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {booking.resource.resourceName}
                                        </h3>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                            PENDING
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                                        <div>
                                            <p className="font-medium text-gray-700">Requested By</p>
                                            <p className="text-gray-600">{booking.user.name}</p>
                                            <p className="text-gray-500">{booking.user.email}</p>
                                        </div>

                                        <div>
                                            <p className="font-medium text-gray-700">Resource Details</p>
                                            <p className="text-gray-600">Type: {booking.resource.resourceType.typeName}</p>
                                            <p className="text-gray-600">Building: {booking.resource.building.buildingName}</p>
                                        </div>

                                        <div>
                                            <p className="font-medium text-gray-700">Booking Time</p>
                                            <p className="text-gray-600">Start: {formatDateTime(booking.startDatetime)}</p>
                                            <p className="text-gray-600">End: {formatDateTime(booking.endDatetime)}</p>
                                        </div>
                                    </div>

                                    {booking.purpose && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700">Purpose</p>
                                            <p className="text-sm text-gray-600">{booking.purpose}</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-3">
                                        Requested on {formatDateTime(booking.createdAt)}
                                    </p>
                                </div>

                                <div className="ml-6 flex flex-col space-y-2">
                                    <button
                                        onClick={() => handleApprove(booking.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(booking.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
