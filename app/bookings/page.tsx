'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        try {
            const url = filter ? `/api/bookings?status=${filter}` : '/api/bookings';
            const res = await fetch(url);
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

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELLED' })
            });

            if (res.ok) {
                setSuccessMessage('Booking cancelled successfully');
                fetchBookings();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to cancel booking');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                            <p className="text-gray-600 mt-1">View and manage your resource bookings</p>
                        </div>
                        <Link
                            href="/bookings/new"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Booking</span>
                        </Link>
                    </div>

                    {/* Success message */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    {/* Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Bookings</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {/* Bookings list */}
                    <div className="space-y-4">
                        {bookings.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">No bookings found.</p>
                                <Link
                                    href="/bookings/new"
                                    className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                                >
                                    Create your first booking →
                                </Link>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {booking.resource.resourceName}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                                                <div>
                                                    <p className="font-medium text-gray-700">Resource Details</p>
                                                    <p>Type: {booking.resource.resourceType.typeName}</p>
                                                    <p>Building: {booking.resource.building.buildingName}</p>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-gray-700">Booking Time</p>
                                                    <p>Start: {formatDateTime(booking.startDatetime)}</p>
                                                    <p>End: {formatDateTime(booking.endDatetime)}</p>
                                                </div>
                                            </div>

                                            {booking.purpose && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700">Purpose</p>
                                                    <p className="text-sm text-gray-600">{booking.purpose}</p>
                                                </div>
                                            )}

                                            {booking.approver && (
                                                <p className="text-sm text-gray-500 mt-3">
                                                    Approved by: {booking.approver.name}
                                                </p>
                                            )}
                                        </div>

                                        {['PENDING', 'APPROVED'].includes(booking.status) && (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                className="ml-4 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
