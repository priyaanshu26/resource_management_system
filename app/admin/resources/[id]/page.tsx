'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Resource {
    id: number;
    resourceName: string;
    floorNumber: number;
    description: string | null;
    resourceType: { id: number; typeName: string };
    building: { id: number; buildingName: string; buildingNumber: string };
    facilities: Array<{ id: number; facilityName: string; details: string | null }>;
    cupboards: Array<{ id: number; cupboardName: string; totalShelves: number; shelves: any[] }>;
    bookings: Array<any>;
    maintenance: Array<any>;
}

export default function ResourceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [resource, setResource] = useState<Resource | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFacilityModal, setShowFacilityModal] = useState(false);
    const [showCupboardModal, setShowCupboardModal] = useState(false);
    const [facilityForm, setFacilityForm] = useState({ facilityName: '', details: '' });
    const [cupboardForm, setCupboardForm] = useState({ cupboardName: '', totalShelves: 1 });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchResource();
        }
    }, [params.id]);

    const fetchResource = async () => {
        try {
            const res = await fetch(`/api/resources/${params.id}`);
            const data = await res.json();
            if (data.resource) {
                setResource(data.resource);
            }
        } catch (err) {
            console.error('Error fetching resource:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFacility = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/resources/${params.id}/facilities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(facilityForm)
            });

            if (res.ok) {
                setSuccessMessage('Facility added successfully');
                setShowFacilityModal(false);
                setFacilityForm({ facilityName: '', details: '' });
                fetchResource();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            alert('Failed to add facility');
        }
    };

    const handleAddCupboard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/resources/${params.id}/cupboards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cupboardForm)
            });

            if (res.ok) {
                setSuccessMessage('Cupboard added successfully');
                setShowCupboardModal(false);
                setCupboardForm({ cupboardName: '', totalShelves: 1 });
                fetchResource();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            alert('Failed to add cupboard');
        }
    };

    const handleDeleteFacility = async (id: number) => {
        if (!confirm('Delete this facility?')) return;

        try {
            const res = await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage('Facility deleted');
                fetchResource();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleDeleteCupboard = async (id: number) => {
        if (!confirm('Delete this cupboard?')) return;

        try {
            const res = await fetch(`/api/cupboards/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage('Cupboard deleted');
                fetchResource();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            alert('Failed to delete');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Resource not found</p>
                <Link href="/admin/resources" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                    ← Back to Resources
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/resources" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
                        ← Back to Resources
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{resource.resourceName}</h1>
                    <p className="text-gray-600 mt-1">{resource.resourceType.typeName} - {resource.building.buildingName}</p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            {/* Resource Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Building</p>
                        <p className="font-medium">{resource.building.buildingName} ({resource.building.buildingNumber})</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Floor</p>
                        <p className="font-medium">Floor {resource.floorNumber}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium">{resource.resourceType.typeName}</p>
                    </div>
                    {resource.description && (
                        <div className="md:col-span-2">
                            <p className="text-gray-600">Description</p>
                            <p className="font-medium">{resource.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Facilities</h2>
                    <button
                        onClick={() => setShowFacilityModal(true)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                        Add Facility
                    </button>
                </div>
                <div className="space-y-2">
                    {resource.facilities.length === 0 ? (
                        <p className="text-gray-500 text-sm">No facilities added</p>
                    ) : (
                        resource.facilities.map((facility) => (
                            <div key={facility.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{facility.facilityName}</p>
                                    {facility.details && <p className="text-sm text-gray-600">{facility.details}</p>}
                                </div>
                                <button
                                    onClick={() => handleDeleteFacility(facility.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Cupboards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Cupboards & Shelves</h2>
                    <button
                        onClick={() => setShowCupboardModal(true)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                        Add Cupboard
                    </button>
                </div>
                <div className="space-y-2">
                    {resource.cupboards.length === 0 ? (
                        <p className="text-gray-500 text-sm">No cupboards added</p>
                    ) : (
                        resource.cupboards.map((cupboard) => (
                            <div key={cupboard.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{cupboard.cupboardName}</p>
                                    <p className="text-sm text-gray-600">{cupboard.totalShelves} shelves</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteCupboard(cupboard.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Facility Modal */}
            {showFacilityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Facility</h2>
                        <form onSubmit={handleAddFacility}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Facility Name</label>
                                    <input
                                        type="text"
                                        value={facilityForm.facilityName}
                                        onChange={(e) => setFacilityForm({ ...facilityForm, facilityName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Details (Optional)</label>
                                    <textarea
                                        value={facilityForm.details}
                                        onChange={(e) => setFacilityForm({ ...facilityForm, details: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowFacilityModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cupboard Modal */}
            {showCupboardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Cupboard</h2>
                        <form onSubmit={handleAddCupboard}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cupboard Name</label>
                                    <input
                                        type="text"
                                        value={cupboardForm.cupboardName}
                                        onChange={(e) => setCupboardForm({ ...cupboardForm, cupboardName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Shelves</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={cupboardForm.totalShelves}
                                        onChange={(e) => setCupboardForm({ ...cupboardForm, totalShelves: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCupboardModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
