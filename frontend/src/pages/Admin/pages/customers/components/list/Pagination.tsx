import React from 'react';

type PaginationProps = {
  totalItems: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage = 1,
  itemsPerPage = 50,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
      <p>
        Showing {totalItems} entr{totalItems === 1 ? 'y' : 'ies'}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            «
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange && onPageChange(pageNum)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === pageNum
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;




