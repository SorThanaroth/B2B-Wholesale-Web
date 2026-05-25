import { useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/constants";

/**
 * Page + page-size state for a backend-paginated list. Changing the page size
 * (or calling `reset`) jumps back to the first page so results stay consistent.
 */
export function usePagination(initialSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const [size, setSizeState] = useState(initialSize);

  const setSize = (next: number) => {
    setSizeState(next);
    setPage(0);
  };

  /** Reset to page 0 — call when a filter/search changes. */
  const reset = () => setPage(0);

  return { page, size, setPage, setSize, reset };
}
