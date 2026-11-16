import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";

export type SkeletonTextProps = HTMLAttributes<HTMLDivElement> & {
  lines?: number;
  width?: string;
  heading?: boolean;
  paragraph?: boolean;
  locale?: string;
  loadingLabel?: string;
};
export function SkeletonText({ lines = 1, width, heading = false, paragraph = false, locale = "fr-FR", loadingLabel, className, ...rest }: SkeletonTextProps) {
  const isFr = locale.toLowerCase().startsWith("fr");
  const resolvedLoadingLabel = loadingLabel ?? (isFr ? "Chargement…" : "Loading…");
  const lineCount = paragraph ? Math.max(lines, 3) : lines;
  const lineWidth = (index: number): string | undefined => {
    if (width && index === 0) return width;
    if (paragraph && index === lineCount - 1) return "60%";
    return undefined;
  };
  return (
    <div {...rest} className={classNames("st-skeleton", className)} role="status" aria-label={resolvedLoadingLabel} aria-busy="true">
      {Array.from({ length: lineCount }, (_, index) => {
        const w = lineWidth(index);
        return (
          <span
            key={index}
            className={classNames("st-skeleton__line", heading && "st-skeleton__line--heading")}
            style={w ? { width: w } : undefined}
          />
        );
      })}
    </div>
  );
}
