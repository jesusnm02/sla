'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Service {
  id: string;
  name: string;
}

export default function SimulationPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [responseTime, setResponseTime] = useState('');
  const [wasSuccessful, setWasSuccessful] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
          if (data.length > 0) {
            setSelectedService(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (isRandom: boolean) => {
    if (!selectedService) {
      setFeedback({ type: 'error', message: 'Please select a service.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const body = isRandom
      ? { serviceId: selectedService, isRandom }
      : { serviceId: selectedService, responseTime: Number(responseTime), wasSuccessful, isRandom };

    try {
      const response = await fetch('/api/simulation/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.status === 201) {
        setFeedback({ type: 'success', message: `Simulation logged successfully!${isRandom ? ' (Random)' : ''}` });
        if (!isRandom) {
          setResponseTime('');
          setWasSuccessful(true);
        }
      } else {
        const data = await response.json();
        setFeedback({ type: 'error', message: data.error || 'Failed to log simulation.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Simulation Data</h1>

      <div className="mb-6">
        <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service</label>
        <select
          id="service"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {services.map(service => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manual Simulation Form */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Manual Simulation</h2>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleSubmit(false); }} className="space-y-4">
            <div>
              <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700">Response Time (ms)</label>
              <input
                id="responseTime"
                type="number"
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center">
              <input
                id="wasSuccessful"
                type="checkbox"
                checked={wasSuccessful}
                onChange={(e) => setWasSuccessful(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="wasSuccessful" className="ml-2 block text-sm text-gray-900">Was Successful</label>
            </div>
            <button
              type="submit"
              disabled={isLoading || !selectedService}
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Simulating...' : 'Simulate'}
            </button>
          </form>
        </div>

        {/* Random Simulation Form */}
        <div className="p-6 border border-gray-200 rounded-lg flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-4">Random Simulation</h2>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading || !selectedService}
            className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading ? 'Simulating...' : 'Simulate Random Data'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`mt-6 p-4 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
}
