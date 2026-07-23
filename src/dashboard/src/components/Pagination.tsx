import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const generatePageNumbers = () => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'dots', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, 'dots', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, 'dots', ...middleRange, 'dots', totalPages];
    }

    return [];
  };

  const pages = generatePageNumbers();

  return (
    <nav className="flex items-center justify-between px-4 py-3" role="navigation" aria-label="Pagination">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === 'dots') {
            return (
              <span
                key={`dots-${i}`}
                className="px-3 py-2 text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className="px-3 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--color-accent-base)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-text-secondary)',
              }}
              aria-label={Page }
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </nav>
  );
}
