'use client';

import { useEffect, useState } from 'react';

interface Maintenance {
    id: number;
    maintenanceType: string;
    scheduledDate: string;
    status: string;
    notes: string | null;
    resource: {
        resourceName: string;
        resourceType: { typeName: string };
        building: { buildingName: string };
    };
}

interface Resource {
    id: number;
    resourceName: string;
}

export default function MaintenancePage() {
    const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Maintenance | null>(null);
    const [formData, setFormData] = useState({
        resourceId: '',
        maintenanceType: '',
        scheduledDate: '',
        notes: ''
    });
    const [filter, setFilter] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchResources();
        fetchMaintenance();
    }, []);

    useEffect(() => {
        fetchMaintenance();
    }, [filter]);

    const fetchMaintenance = async () => {
        try {
            const url = filter ? `/api/maintenance?status=${filter}` : '/api/maintenance';
            const res = await fetch(url);
            const data = await res.json();
            if (data.maintenance) {
                setMaintenance(data.maintenance);
            }
        } catch (err) {
            console.error('Error fetching maintenance:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchResources = async () => {
        const res = await fetch('/api/resources');
        const data = await res.json();
        if (data.resources) {
            setResources(data.resources);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const url = editingItem ? `/api/maintenance/${editingItem.id}` : '/api/maintenance';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to save maintenance');
                return;
            }

            setSuccessMessage(editingItem ? 'Maintenance updated' : 'Maintenance scheduled');
            setShowModal(false);
            resetForm();
            fetchMaintenance();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('An error occurred');
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`/api/maintenance/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setSuccessMessage('Status updated');
                fetchMaintenance();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this maintenance schedule?')) return;

        try {
            const res = await fetch(`/api/maintenance/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage('Maintenance deleted');
                fetchMaintenance();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({ resourceId: '', maintenanceType: '', scheduledDate: '', notes: '' });
        setError('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
                    <p className="text-gray-600 mt-1">Schedule and track resource maintenance</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Schedule Maintenance</span>
                </button>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
                >
                    <option value="">All Status</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* List */}
            <div className="space-y-4">
                {maintenance.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">No maintenance schedules found</p>
                    </div>
                ) : (
                    maintenance.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold">{item.resource.resourceName}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">Type: {item.maintenanceType}</p>
                                    <p className="text-sm text-gray-600">Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}</p>
                                    {item.notes && <p className="text-sm text-gray-600 mt-2">Notes: {item.notes}</p>}
                                </div>
                                <div className="flex flex-col space-y-2">
                                    {item.status === 'SCHEDULED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                        >
                                            Start
                                        </button>
                                    )}
                                    {item.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Complete
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Schedule Maintenance</h2>

                        {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Resource</label>
                                    <select
                                        value={formData.resourceId}
                                        onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                    >
                                        <option value="">Select Resource</option>
                                        {resources.map((r) => (
                                            <option key={r.id} value={r.id}>{r.resourceName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Maintenance Type</label>
                                    <input
                                        type="text"
                                        value={formData.maintenanceType}
                                        onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="e.g., Cleaning, Repair"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Scheduled Date</label>
                                    <input
                                        type="date"
                                        value={formData.scheduledDate}
                                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
