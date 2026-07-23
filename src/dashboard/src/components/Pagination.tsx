import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisible?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisible = 7,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const sidePages = Math.floor((maxVisible - 3) / 2);

    if (currentPage <= sidePages + 2) {
      for (let i = 1; i <= maxVisible - 2; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - sidePages - 1) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - maxVisible + 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - sidePages; i <= currentPage + sidePages; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className={lex items-center justify-center gap-1 } aria-label="Pagination">
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="pagination-button"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={llipsis-}
              className="px-3 py-2 text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={pagination-button }
            aria-label={Page }
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-button"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}

      <style jsx>{
        .pagination-button {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2.5rem;
          height: 2.5rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: var(--color-surface);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: all 0.2s ease;
        }

        .pagination-button:hover:not(:disabled) {
          background: var(--color-surface-hover);
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-button-active {
          background: var(--color-accent);
          color: white;
          border-color: var(--color-accent);
        }

        .pagination-button-active:hover {
          background: var(--color-accent-hover);
          border-color: var(--color-accent-hover);
          color: white;
        }
      }</style>
    </nav>
  );
}

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  className = '',
}: SimplePaginationProps) {
  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * (itemsPerPage || 10), totalItems) : null;

  return (
    <div className={lex items-center justify-between }>
      {startItem && endItem && totalItems && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium rounded-lg surface-elevated border border-border transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-lg surface-elevated border border-border transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
