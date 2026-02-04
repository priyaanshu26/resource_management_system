'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Resource {
    id: number;
    resourceName: string;
    floorNumber: number;
    description: string | null;
    resourceType: { typeName: string };
    building: { buildingName: string; buildingNumber: string };
    _count: {
        facilities: number;
        cupboards: number;
        bookings: number;
    };
}

interface ResourceType {
    id: number;
    typeName: string;
}

interface Building {
    id: number;
    buildingName: string;
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [formData, setFormData] = useState({
        resourceName: '',
        resourceTypeId: '',
        buildingId: '',
        floorNumber: 0,
        description: ''
    });
    const [filters, setFilters] = useState({
        resourceTypeId: '',
        buildingId: '',
        search: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchResourceTypes();
        fetchBuildings();
        fetchResources();
    }, []);

    useEffect(() => {
        fetchResources();
    }, [filters]);

    const fetchResources = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.resourceTypeId) params.append('resourceTypeId', filters.resourceTypeId);
            if (filters.buildingId) params.append('buildingId', filters.buildingId);
            if (filters.search) params.append('search', filters.search);

            const res = await fetch(`/api/resources?${params.toString()}`);
            const data = await res.json();
            if (data.resources) {
                setResources(data.resources);
            }
        } catch (err) {
            console.error('Error fetching resources:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchResourceTypes = async () => {
        const res = await fetch('/api/resource-types');
        const data = await res.json();
        if (data.resourceTypes) {
            setResourceTypes(data.resourceTypes);
        }
    };

    const fetchBuildings = async () => {
        const res = await fetch('/api/buildings');
        const data = await res.json();
        if (data.buildings) {
            setBuildings(data.buildings);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const url = editingResource
                ? `/api/resources/${editingResource.id}`
                : '/api/resources';

            const method = editingResource ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to save resource');
                return;
            }

            setSuccessMessage(editingResource ? 'Resource updated successfully' : 'Resource created successfully');
            setShowModal(false);
            resetForm();
            fetchResources();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('An error occurred');
        }
    };

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        setFormData({
            resourceName: resource.resourceName,
            resourceTypeId: resource.resourceType ? String((resource as any).resourceTypeId) : '',
            buildingId: resource.building ? String((resource as any).buildingId) : '',
            floorNumber: resource.floorNumber,
            description: resource.description || ''
        });
        setShowModal(true);
        setError('');
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this resource?')) {
            return;
        }

        try {
            const res = await fetch(`/api/resources/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to delete resource');
                return;
            }

            setSuccessMessage('Resource deleted successfully');
            fetchResources();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert('An error occurred');
        }
    };

    const resetForm = () => {
        setEditingResource(null);
        setFormData({
            resourceName: '',
            resourceTypeId: '',
            buildingId: '',
            floorNumber: 0,
            description: ''
        });
        setError('');
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
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
                    <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
                    <p className="text-gray-600 mt-1">Manage all organizational resources</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Resource</span>
                </button>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                        <select
                            value={filters.resourceTypeId}
                            onChange={(e) => setFilters({ ...filters, resourceTypeId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Types</option>
                            {resourceTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.typeName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                        <select
                            value={filters.buildingId}
                            onChange={(e) => setFilters({ ...filters, buildingId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Buildings</option>
                            {buildings.map((building) => (
                                <option key={building.id} value={building.id}>{building.buildingName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Search resources..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resource Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Building
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Floor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {resources.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No resources found. {filters.resourceTypeId || filters.buildingId || filters.search ? 'Try adjusting your filters.' : 'Create your first one!'}
                                </td>
                            </tr>
                        ) : (
                            resources.map((resource) => (
                                <tr key={resource.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/resources/${resource.id}`}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-900"
                                        >
                                            {resource.resourceName}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            {resource.resourceType.typeName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {resource.building.buildingName} ({resource.building.buildingNumber})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        Floor {resource.floorNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex space-x-3 text-xs">
                                            <span>{resource._count.facilities} facilities</span>
                                            <span>{resource._count.cupboards} cupboards</span>
                                            <span>{resource._count.bookings} bookings</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <Link
                                            href={`/admin/resources/${resource.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(resource)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(resource.id)}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl m-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingResource ? 'Edit Resource' : 'Create Resource'}
                        </h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resource Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.resourceName}
                                        onChange={(e) => setFormData({ ...formData, resourceName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Computer Lab 1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resource Type *
                                    </label>
                                    <select
                                        value={formData.resourceTypeId}
                                        onChange={(e) => setFormData({ ...formData, resourceTypeId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {resourceTypes.map((type) => (
                                            <option key={type.id} value={type.id}>{type.typeName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Building *
                                    </label>
                                    <select
                                        value={formData.buildingId}
                                        onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Building</option>
                                        {buildings.map((building) => (
                                            <option key={building.id} value={building.id}>{building.buildingName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Floor Number *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.floorNumber}
                                        onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingResource ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
