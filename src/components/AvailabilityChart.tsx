'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AvailabilityChartProps {
  serviceName: string;
  countSuccess: number;
  countFailed: number;
}

const COLORS = ['#4ade80', '#f87171']; // Green for Success, Red for Failure

const AvailabilityChart: React.FC<AvailabilityChartProps> = ({ serviceName, countSuccess, countFailed }) => {
  const total = countSuccess + countFailed;
  const availability = total > 0 ? (countSuccess / total) * 100 : 100; // Default to 100 if no data
  const data = [
    { name: 'Success', value: countSuccess },
    { name: 'Failure', value: countFailed },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Availability: {serviceName}</h3>
      <div style={{ width: '100%', height: 200, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div
          className="absolute"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}
        >
          <span className="text-3xl font-bold text-gray-800">
            {availability.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityChart;
