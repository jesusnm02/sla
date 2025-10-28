'use client';

import { useState, useEffect } from 'react';

interface Penalty {
  id: string;
  reason: string;
  status: string;
  timestamp: string;
  service: {
    name: string;
  }
}

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchPenalties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/penalties');
      if (!response.ok) {
        throw new Error('Failed to fetch penalties.');
      }
      const data = await response.json();
      setPenalties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const handleCheckPenalties = async () => {
    try {
      setIsChecking(true);
      setFeedback(null);
      setError(null);
      const response = await fetch('/api/penalties/check', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check for penalties.');
      }
      setFeedback(data.message);
      fetchPenalties(); // Refresh the list after checking
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Governance & Penalties</h1>
        <button
          onClick={handleCheckPenalties}
          disabled={isChecking}
          className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Execute Penalty Check'}
        </button>
      </div>

      {feedback && <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800">{feedback}</div>}
      {error && <div className="mb-4 p-3 rounded-md bg-red-100 text-red-800">{error}</div>}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading penalties...</td></tr>
            ) : penalties.length > 0 ? (
              penalties.map((penalty) => (
                <tr key={penalty.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{penalty.service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{penalty.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {penalty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(penalty.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="text-center py-4">No penalties found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
