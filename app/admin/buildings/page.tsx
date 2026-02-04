'use client';

import { useEffect, useState } from 'react';

interface Building {
    id: number;
    buildingName: string;
    buildingNumber: string;
    totalFloors: number;
    _count: {
        resources: number;
    };
}

export default function BuildingsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
    const [formData, setFormData] = useState({
        buildingName: '',
        buildingNumber: '',
        totalFloors: 1
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        try {
            const res = await fetch('/api/buildings');
            const data = await res.json();
            if (data.buildings) {
                setBuildings(data.buildings);
            }
        } catch (err) {
            console.error('Error fetching buildings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const url = editingBuilding
                ? `/api/buildings/${editingBuilding.id}`
                : '/api/buildings';

            const method = editingBuilding ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to save building');
                return;
            }

            setSuccessMessage(editingBuilding ? 'Building updated successfully' : 'Building created successfully');
            setShowModal(false);
            setFormData({ buildingName: '', buildingNumber: '', totalFloors: 1 });
            setEditingBuilding(null);
            fetchBuildings();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('An error occurred');
        }
    };

    const handleEdit = (building: Building) => {
        setEditingBuilding(building);
        setFormData({
            buildingName: building.buildingName,
            buildingNumber: building.buildingNumber,
            totalFloors: building.totalFloors
        });
        setShowModal(true);
        setError('');
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this building?')) {
            return;
        }

        try {
            const res = await fetch(`/api/buildings/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to delete building');
                return;
            }

            setSuccessMessage('Building deleted successfully');
            fetchBuildings();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert('An error occurred');
        }
    };

    const openCreateModal = () => {
        setEditingBuilding(null);
        setFormData({ buildingName: '', buildingNumber: '', totalFloors: 1 });
        setShowModal(true);
        setError('');
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Buildings</h1>
                    <p className="text-gray-600 mt-1">Manage building information</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Building</span>
                </button>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Building Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Building Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Floors
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resources
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {buildings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No buildings found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            buildings.map((building) => (
                                <tr key={building.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{building.buildingName}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {building.buildingNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {building.totalFloors}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {building._count.resources} resources
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => handleEdit(building)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(building.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingBuilding ? 'Edit Building' : 'Create Building'}
                        </h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Building Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.buildingName}
                                        onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Main Building"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Building Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.buildingNumber}
                                        onChange={(e) => setFormData({ ...formData, buildingNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., A1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Floors
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.totalFloors}
                                        onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingBuilding(null);
                                        setFormData({ buildingName: '', buildingNumber: '', totalFloors: 1 });
                                        setError('');
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingBuilding ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
