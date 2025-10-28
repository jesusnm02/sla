'use client';

import { useState, useEffect } from 'react';
import KpiCard from '@/components/KpiCard';
import AvailabilityChart from '@/components/AvailabilityChart';
import { Timer, Zap } from 'lucide-react';

interface KpiData {
  serviceId: string;
  serviceName: string;
  targetPerf: number;
  actualPerf: number | null;
  targetAvail: number;
  countSuccess: number;
  countFailed: number;
}

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/kpi/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch KPI data.');
        }
        const data = await response.json();
        setKpiData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance (Average Response Time)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map(kpi => (
            <KpiCard
              key={kpi.serviceId}
              title={`Performance: ${kpi.serviceName}`}
              value={kpi.actualPerf !== null ? `${Math.round(kpi.actualPerf)}ms` : 'N/A'}
              target={`${kpi.targetPerf}ms`}
              icon={Timer}
              isBetterHigher={false}
              rawValue={kpi.actualPerf}
              rawTarget={kpi.targetPerf}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Availability (Last 24h)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kpiData.map(kpi => (
            <AvailabilityChart
              key={kpi.serviceId}
              serviceName={kpi.serviceName}
              countSuccess={kpi.countSuccess}
              countFailed={kpi.countFailed}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
