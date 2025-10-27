import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton,
  backTo,
  action,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      {showBackButton && (
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="flex items-center gap-2 text-royal-gold hover:text-yellow-600 mb-4 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-6 py-3 bg-royal-gold text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};


