import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export interface PaginationProps {
  /** Zero-based current page (matches Spring Data). */
  page: number;
  totalPages: number;
  totalElements: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="px-1 py-3 text-sm text-slate-400">
        {totalElements} {totalElements === 1 ? "result" : "results"}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3">
      <p className="text-sm text-slate-500">
        Page <span className="font-medium text-slate-700">{page + 1}</span> of {totalPages}
        <span className="ml-2 text-slate-400">({totalElements} total)</span>
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(page - 1)}
          disabled={page <= 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
