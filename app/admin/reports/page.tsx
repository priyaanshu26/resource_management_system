'use client';

import { useEffect, useState } from 'react';

export default function ReportsPage() {
    const [bookingReport, setBookingReport] = useState<any>(null);
    const [resourceReport, setResourceReport] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const [bookings, resources] = await Promise.all([
                fetch(`/api/reports/bookings?${params.toString()}`).then(r => r.json()),
                fetch('/api/reports/resources').then(r => r.json())
            ]);

            if (bookings.report) setBookingReport(bookings.report);
            if (resources.report) setResourceReport(resources.report);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = () => {
        fetchReports();
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
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">View system statistics and insights</p>
            </div>

            {/* Date Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-3">Filter by Date Range</h2>
                <div className="flex items-end space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button
                        onClick={handleFilterChange}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Resource Statistics */}
            {resourceReport && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Resource Statistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600 font-medium">Total Resources</p>
                            <p className="text-3xl font-bold text-blue-900">{resourceReport.totalResources}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600 font-medium">Active Resources</p>
                            <p className="text-3xl font-bold text-green-900">{resourceReport.activeResources}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-purple-600 font-medium">Utilization Rate</p>
                            <p className="text-3xl font-bold text-purple-900">{resourceReport.utilizationRate}%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Resources by Type */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Resources by Type</h3>
                            <div className="space-y-2">
                                {resourceReport.resourcesByType?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">{item.typeName}</span>
                                        <span className="font-semibold text-gray-900">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resources by Building */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Resources by Building</h3>
                            <div className="space-y-2">
                                {resourceReport.resourcesByBuilding?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">{item.buildingName}</span>
                                        <span className="font-semibold text-gray-900">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Statistics */}
            {bookingReport && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Statistics</h2>

                    <div className="mb-6">
                        <div className="bg-indigo-50 rounded-lg p-4 inline-block">
                            <p className="text-sm text-indigo-600 font-medium">Total Bookings</p>
                            <p className="text-3xl font-bold text-indigo-900">{bookingReport.totalBookings}</p>
                        </div>
                    </div>

                    {/* Bookings by Status */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Bookings by Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {bookingReport.bookingsByStatus?.map((item: any, idx: number) => (
                                <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-600">{item.status}</p>
                                    <p className="text-2xl font-bold text-gray-900">{item._count}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bookings by Resource Type */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Bookings by Resource Type</h3>
                        <div className="space-y-2">
                            {Object.entries(bookingReport.bookingsByResourceType || {}).map(([type, count]: [string, any], idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">{type}</span>
                                    <span className="font-semibold text-gray-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Most Booked Resources */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Most Booked Resources</h3>
                        <div className="space-y-2">
                            {bookingReport.mostBookedResources?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.resource?.resourceName}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.resource?.building?.buildingName} - {item.resource?.resourceType?.typeName}
                                        </p>
                                    </div>
                                    <span className="font-semibold text-blue-600">{item.count} bookings</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Bookers */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Top Bookers</h3>
                        <div className="space-y-2">
                            {bookingReport.topBookers?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.user?.name}</p>
                                        <p className="text-sm text-gray-600">{item.user?.email} - {item.user?.role}</p>
                                    </div>
                                    <span className="font-semibold text-green-600">{item.count} bookings</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
