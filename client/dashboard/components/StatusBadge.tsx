import React from 'react';

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

const defaultColorMap: Record<string, string> = {
  published: 'bg-green-100 text-green-800 border-green-300',
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  archived: 'bg-gray-100 text-gray-800 border-gray-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-red-100 text-red-800 border-red-300',
  unread: 'bg-blue-100 text-blue-800 border-blue-300',
  read: 'bg-gray-100 text-gray-800 border-gray-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-gray-100 text-gray-800 border-gray-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  urgent: 'bg-red-100 text-red-800 border-red-300',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, colorMap }) => {
  const colors = colorMap || defaultColorMap;
  const statusLower = status.toLowerCase();
  const colorClass = colors[statusLower] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${colorClass} capitalize`}
    >
      {status}
    </span>
  );
};


