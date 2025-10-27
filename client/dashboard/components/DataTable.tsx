import React, { ReactNode } from 'react';

export interface Column {
  header: string;
  sortable?: boolean;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemLabel?: string; // e.g., "articles", "users", "messages"
}

interface DataTableProps {
  columns: Column[];
  children: ReactNode;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  emptyMessage?: string;
  pagination?: PaginationData;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  children,
  sortField,
  sortOrder,
  emptyMessage = 'No data available',
  pagination,
}) => {
  const getSortIcon = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (!column.sortable) return null;

    return (
      <span className="ml-1 text-xs">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-royal-gold/10 to-yellow-100 border-b-2 border-royal-gold">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-${column.align || 'left'} text-sm font-bold text-royal-black ${
                    column.sortable ? 'cursor-pointer hover:text-royal-gold transition-colors' : ''
                  } ${column.width || ''}`}
                  onClick={column.onSort}
                  title={column.sortable ? 'Click to sort' : undefined}
                >
                  {column.header}
                  {column.sortable && getSortIcon(index)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {React.Children.count(children) === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Part of table container */}
      {pagination && (
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing page {pagination.currentPage} of {pagination.totalPages > 0 ? pagination.totalPages : 1} ({pagination.totalItems} total {pagination.itemLabel || 'items'})
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {[...Array(pagination.totalPages > 0 ? pagination.totalPages : 1)].map((_, i) => {
              const page = i + 1;
              const totalPages = pagination.totalPages > 0 ? pagination.totalPages : 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                      pagination.currentPage === page
                        ? 'bg-royal-gold text-white border-royal-gold'
                        : 'border-gray-200 hover:border-royal-gold'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                return <span key={page} className="px-2 py-2">...</span>;
              }
              return null;
            })}
            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages > 0 ? pagination.totalPages : 1, pagination.currentPage + 1))}
              disabled={pagination.currentPage === (pagination.totalPages > 0 ? pagination.totalPages : 1)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

