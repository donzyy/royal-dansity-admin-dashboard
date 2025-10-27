import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  // Always show pagination
  const pages = totalPages > 0 ? totalPages : 1;

  return (
    <div className="bg-white border-t-2 border-gray-300 px-6 py-4 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Showing page {currentPage} of {pages} ({totalItems} total items)
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {[...Array(pages)].map((_, i) => {
          const page = i + 1;
          if (
            page === 1 ||
            page === pages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-royal-gold text-white border-royal-gold'
                    : 'border-gray-200 hover:border-royal-gold'
                }`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-2 py-2">...</span>;
          }
          return null;
        })}
        <button
          onClick={() => onPageChange(Math.min(pages, currentPage + 1))}
          disabled={currentPage === pages}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

