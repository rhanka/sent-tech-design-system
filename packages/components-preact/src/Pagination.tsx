import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type PaginationProps = HTMLAttributes<HTMLElement> & {
  /** Plain value, or a signal in the Preact build (read at the edge). */
  page: MaybeSignal<number>;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  pageCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  onPageChange?: (page: number) => void;
};

export function Pagination({
  page: pageInput,
  pageSize = 10,
  totalItems,
  totalPages,
  pageCount,
  previousLabel = "Previous",
  nextLabel = "Next",
  onPageChange,
  className,
  ...rest
}: PaginationProps) {
  const page = useValue(pageInput);
  const pages = pageCount ?? totalPages ?? (totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : page);
  const visiblePages = Array.from({ length: pages }, (_, index) => index + 1);
  return (
    <nav {...rest} className={classNames("st-pagination", className)} aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
        {previousLabel}
      </button>
      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          className={classNames("st-pagination__page", pageNumber === page && "st-pagination__page--active")}
          aria-label={`Page ${pageNumber}`}
          aria-current={pageNumber === page ? "page" : undefined}
          onClick={() => onPageChange?.(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onPageChange?.(page + 1)}>
        {nextLabel}
      </button>
    </nav>
  );
}
