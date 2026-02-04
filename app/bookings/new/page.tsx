'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResourceType {
    id: number;
    typeName: string;
}

interface Resource {
    id: number;
    resourceName: string;
    building: { buildingName: string };
    floorNumber: number;
}

export default function NewBookingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [formData, setFormData] = useState({
        resourceTypeId: '',
        resourceId: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        purpose: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchResourceTypes();
    }, []);

    useEffect(() => {
        if (formData.resourceTypeId) {
            fetchResources(formData.resourceTypeId);
        }
    }, [formData.resourceTypeId]);

    const fetchResourceTypes = async () => {
        const res = await fetch('/api/resource-types');
        const data = await res.json();
        if (data.resourceTypes) {
            setResourceTypes(data.resourceTypes);
        }
    };

    const fetchResources = async (typeId: string) => {
        const res = await fetch(`/api/resources?resourceTypeId=${typeId}`);
        const data = await res.json();
        if (data.resources) {
            setResources(data.resources);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const startDatetime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDatetime = new Date(`${formData.endDate}T${formData.endTime}`);

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId: formData.resourceId,
                    startDatetime: startDatetime.toISOString(),
                    endDatetime: endDatetime.toISOString(),
                    purpose: formData.purpose
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create booking');
                setIsLoading(false);
                return;
            }

            router.push('/bookings');
        } catch (err) {
            setError('An error occurred');
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.resourceTypeId) {
            setError('Please select a resource type');
            return;
        }
        if (step === 2 && !formData.resourceId) {
            setError('Please select a resource');
            return;
        }
        setError('');
        setStep(step + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">New Booking Request</h1>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Select Resource Type */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Resource Type</h2>
                                <div className="space-y-3">
                                    {resourceTypes.map((type) => (
                                        <label
                                            key={type.id}
                                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${formData.resourceTypeId === String(type.id)
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="resourceType"
                                                value={type.id}
                                                checked={formData.resourceTypeId === String(type.id)}
                                                onChange={(e) => setFormData({ ...formData, resourceTypeId: e.target.value, resourceId: '' })}
                                                className="mr-3"
                                            />
                                            <span className="font-medium">{type.typeName}</span>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Step 2: Select Resource */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Resource</h2>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {resources.map((resource) => (
                                        <label
                                            key={resource.id}
                                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${formData.resourceId === String(resource.id)
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="resource"
                                                value={resource.id}
                                                checked={formData.resourceId === String(resource.id)}
                                                onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                                                className="mr-3"
                                            />
                                            <div>
                                                <p className="font-medium">{resource.resourceName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {resource.building.buildingName}, Floor {resource.floorNumber}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Date, Time, and Purpose */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                            <input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                            <input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Purpose (Optional)</label>
                                        <textarea
                                            value={formData.purpose}
                                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Describe the purpose of this booking..."
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        disabled={isLoading}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating...' : 'Create Booking'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
