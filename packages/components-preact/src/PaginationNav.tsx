import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

// `pageCount` (Svelte-canonical) is accepted as an alias of `totalPages`.
export type PaginationNavProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  /** Plain value, or a signal in the Preact build (read at the edge). */
  page?: MaybeSignal<number>;
  /** Total page count (Svelte-canonical). `totalPages` is accepted as alias. */
  pageCount?: number;
  totalPages?: number;
  siblings?: number;
  locale?: string;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  previousHref?: string;
  nextHref?: string;
  onPageChange?: (page: number) => void;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

// Mirrors the Svelte reference: first/last anchors, sibling window around the
// current page, and two collapse points (ellipses) once the total exceeds
// `siblings * 2 + 5`.
type PaginationSlot = number | "ellipsis-start" | "ellipsis-end";
function paginationSlots(page: number, pageCount: number, siblings: number): PaginationSlot[] {
  const total = Math.max(0, Math.floor(pageCount));
  if (total <= 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const sib = Math.max(0, Math.floor(siblings));
  const minSlots = sib * 2 + 5;
  if (total <= minSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - sib, 1);
  const rightSibling = Math.min(current + sib, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;
  const result: PaginationSlot[] = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + sib * 2;
    for (let i = 1; i <= leftItemCount; i += 1) result.push(i);
    result.push("ellipsis-end");
    result.push(total);
  } else if (showLeftEllipsis && !showRightEllipsis) {
    result.push(1);
    result.push("ellipsis-start");
    const rightItemCount = 3 + sib * 2;
    for (let i = total - rightItemCount + 1; i <= total; i += 1) result.push(i);
  } else if (showLeftEllipsis && showRightEllipsis) {
    result.push(1);
    result.push("ellipsis-start");
    for (let i = leftSibling; i <= rightSibling; i += 1) result.push(i);
    result.push("ellipsis-end");
    result.push(total);
  } else {
    for (let i = 1; i <= total; i += 1) result.push(i);
  }
  return result;
}

export function PaginationNav({
  page: pageInput = 1,
  pageCount,
  totalPages,
  siblings = 1,
  locale = "fr-FR",
  label = "Pagination",
  previousLabel,
  nextLabel,
  previousHref,
  nextHref,
  onPageChange,
  className,
  ...rest
}: PaginationNavProps) {
  const page = useValue(pageInput);
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const resolvedPreviousLabel = previousLabel ?? (isFr ? "Page précédente" : "Previous page");
  const resolvedNextLabel = nextLabel ?? (isFr ? "Page suivante" : "Next page");
  const pages = pageCount ?? totalPages ?? 1;
  const slots = paginationSlots(page, pages, siblings);
  const go = (target: number) => {
    if (target < 1 || target > pages || target === page) return;
    onPageChange?.(target);
  };
  return (
    <nav {...rest} className={classNames("st-paginationNav", className)} aria-label={label}>
      <ul className="st-paginationNav__list">
        <li>
          {previousHref ? (
            <a href={previousHref} className="st-paginationNav__nav" aria-label={resolvedPreviousLabel}>
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              className="st-paginationNav__nav"
              aria-label={resolvedPreviousLabel}
              disabled={page <= 1 || pages <= 0}
              onClick={() => go(page - 1)}
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </li>
        {slots.map((slot, index) => (
          <li key={typeof slot === "number" ? `p-${slot}` : `${slot}-${index}`}>
            {slot === "ellipsis-start" || slot === "ellipsis-end" ? (
              <span className="st-paginationNav__ellipsis" aria-hidden="true">
                <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
              </span>
            ) : (
              <button
                type="button"
                className={classNames("st-paginationNav__page", slot === page && "st-paginationNav__page--active")}
                aria-label={`Page ${slot}`}
                aria-current={slot === page ? "page" : undefined}
                onClick={() => go(slot)}
              >
                {slot}
              </button>
            )}
          </li>
        ))}
        <li>
          {nextHref ? (
            <a href={nextHref} className="st-paginationNav__nav" aria-label={resolvedNextLabel}>
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              className="st-paginationNav__nav"
              aria-label={resolvedNextLabel}
              disabled={page >= pages || pages <= 0}
              onClick={() => go(page + 1)}
            >
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
