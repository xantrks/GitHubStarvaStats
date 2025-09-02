import React from 'react';

interface StatItemProps {
  label: string;
  value: string | number;
  align?: 'left' | 'center' | 'right';
}

const StatItem: React.FC<StatItemProps> = ({ label, value, align = 'center' }) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <div className={alignmentClasses[align]}>
      <p className="text-xs uppercase tracking-wider text-gray-300 font-medium">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
};

export default StatItem;