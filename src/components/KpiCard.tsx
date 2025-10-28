import { LucideProps } from 'lucide-react';
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  target: string;
  icon: React.ComponentType<LucideProps>;
  isBetterHigher: boolean; // True if a higher value is better, false if lower is better
  rawValue: number | null;
  rawTarget: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, target, icon: Icon, isBetterHigher, rawValue, rawTarget }) => {

  let isMeetingTarget = false;
  if (rawValue !== null) {
    isMeetingTarget = isBetterHigher ? rawValue >= rawTarget : rawValue <= rawTarget;
  }

  const valueColor = rawValue === null ? 'text-gray-500' : isMeetingTarget ? 'text-green-500' : 'text-red-500';
  const iconColor = rawValue === null ? 'bg-gray-200' : isMeetingTarget ? 'bg-green-100' : 'bg-red-100';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className={`p-3 rounded-full ${iconColor}`}>
        <Icon className={`w-6 h-6 ${isMeetingTarget ? 'text-green-600' : 'text-red-600'}`} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
        <p className="text-xs text-gray-400">Target: {target}</p>
      </div>
    </div>
  );
};

export default KpiCard;
