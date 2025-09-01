import React from 'react';

interface StatItemProps {
  label: string;
  value: string | number;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
};

export default StatItem;