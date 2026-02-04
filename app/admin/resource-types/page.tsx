'use client';

import { useEffect, useState } from 'react';

interface ResourceType {
    id: number;
    typeName: string;
    _count: {
        resources: number;
    };
}

export default function ResourceTypesPage() {
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<ResourceType | null>(null);
    const [formData, setFormData] = useState({ typeName: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchResourceTypes();
    }, []);

    const fetchResourceTypes = async () => {
        try {
            const res = await fetch('/api/resource-types');
            const data = await res.json();
            if (data.resourceTypes) {
                setResourceTypes(data.resourceTypes);
            }
        } catch (err) {
            console.error('Error fetching resource types:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const url = editingType
                ? `/api/resource-types/${editingType.id}`
                : '/api/resource-types';

            const method = editingType ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to save resource type');
                return;
            }

            setSuccessMessage(editingType ? 'Resource type updated successfully' : 'Resource type created successfully');
            setShowModal(false);
            setFormData({ typeName: '' });
            setEditingType(null);
            fetchResourceTypes();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('An error occurred');
        }
    };

    const handleEdit = (type: ResourceType) => {
        setEditingType(type);
        setFormData({ typeName: type.typeName });
        setShowModal(true);
        setError('');
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this resource type?')) {
            return;
        }

        try {
            const res = await fetch(`/api/resource-types/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to delete resource type');
                return;
            }

            setSuccessMessage('Resource type deleted successfully');
            fetchResourceTypes();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert('An error occurred');
        }
    };

    const openCreateModal = () => {
        setEditingType(null);
        setFormData({ typeName: '' });
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
                    <h1 className="text-2xl font-bold text-gray-900">Resource Types</h1>
                    <p className="text-gray-600 mt-1">Manage resource categories</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Resource Type</span>
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
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resources Count
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {resourceTypes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No resource types found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            resourceTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {type.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{type.typeName}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {type._count.resources} resources
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(type.id)}
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
                            {editingType ? 'Edit Resource Type' : 'Create Resource Type'}
                        </h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.typeName}
                                    onChange={(e) => setFormData({ typeName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Classroom, Lab, Auditorium"
                                    required
                                />
                            </div>

                            <div className="flex space-x-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingType(null);
                                        setFormData({ typeName: '' });
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
                                    {editingType ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
