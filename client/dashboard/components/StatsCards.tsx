import React from 'react';

export interface StatCard {
  label: string;
  value: number | string;
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'orange' | 'pink';
}

interface StatsCardsProps {
  stats: StatCard[];
}

const colorClasses = {
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  red: 'bg-red-50 border-red-200 text-red-600',
  gray: 'bg-gray-50 border-gray-200 text-gray-600',
  orange: 'bg-orange-50 border-orange-200 text-orange-600',
  pink: 'bg-pink-50 border-pink-200 text-pink-600',
};

const textColorClasses = {
  purple: 'text-purple-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  gray: 'text-gray-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600',
};

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  // Use 3 columns if more than 4 cards, otherwise auto-calculate
  const gridClass = stats.length > 4
    ? 'md:grid-cols-3'
    : stats.length === 4
    ? 'md:grid-cols-4'
    : stats.length === 3
    ? 'md:grid-cols-3'
    : 'md:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${colorClasses[stat.color]} rounded-xl p-6 border-2`}
        >
          <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
          <p className={`text-3xl font-bold ${textColorClasses[stat.color]}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

