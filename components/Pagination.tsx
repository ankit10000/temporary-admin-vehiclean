'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
