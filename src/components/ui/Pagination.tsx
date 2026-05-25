import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/constants";
import { Button } from "./Button";

export interface PaginationProps {
  /** Zero-based current page (matches Spring Data). */
  page: number;
  totalPages: number;
  totalElements: number;
  onChange: (page: number) => void;
  /** Current page size — when paired with `onPageSizeChange`, renders a size selector. */
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  onChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const showSizeSelector = pageSize !== undefined && onPageSizeChange !== undefined;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-500">
          {totalPages > 1 ? (
            <>
              Page <span className="font-medium text-slate-700">{page + 1}</span> of {totalPages}
              <span className="ml-2 text-slate-400">({totalElements} total)</span>
            </>
          ) : (
            <>
              {totalElements} {totalElements === 1 ? "result" : "results"}
            </>
          )}
        </p>

        {showSizeSelector && (
          <label className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white py-1 pl-2 pr-7 text-sm text-slate-700 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onChange(page - 1)} disabled={page <= 0}>
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
      )}
    </div>
  );
}
