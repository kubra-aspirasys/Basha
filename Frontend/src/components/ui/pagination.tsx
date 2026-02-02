import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemName?: string; // e.g., "users", "orders", "inquiries"
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemName = "items"
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show first 4 pages + ellipsis + last page
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 4 pages
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">Rows per page:</span>
        <Select
          value={itemsPerPage === totalItems ? 'all' : itemsPerPage.toString()}
          onValueChange={(value) => {
            if (value === 'all') {
              onItemsPerPageChange(totalItems);
            } else {
              onItemsPerPageChange(parseInt(value));
            }
          }}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Showing X-Y of Z info */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing {startItem}–{endItem} of {totalItems} {itemName}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <div className="flex items-center justify-center h-8 w-8">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </div>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`h-8 w-8 p-0 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white border-gold-500'
                    : ''
                }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}