<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type SkeletonTextProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    lines?: number;
    width?: string;
    heading?: boolean;
    paragraph?: boolean;
    class?: string;
  };

  let {
    lines = 1,
    width,
    heading = false,
    paragraph = false,
    class: className,
    ...rest
  }: SkeletonTextProps = $props();

  const wrapperClasses = () => ["st-skeleton", className].filter(Boolean).join(" ");
  const lineClasses = () =>
    ["st-skeleton__line", heading ? "st-skeleton__line--heading" : null].filter(Boolean).join(" ");
  const lineCount = () => (paragraph ? Math.max(lines, 3) : lines);

  function lineWidth(index: number, total: number): string | undefined {
    if (width && index === 0) return width;
    if (paragraph && index === total - 1) return "60%";
    return undefined;
  }
</script>

<div {...rest} class={wrapperClasses()} role="status" aria-label="Loading…" aria-busy="true">
  {#each Array.from({ length: lineCount() }) as _, i (i)}
    <span class={lineClasses()} style={lineWidth(i, lineCount()) ? `width:${lineWidth(i, lineCount())}` : undefined}></span>
  {/each}
</div>

<style>
  .st-skeleton {
    display: grid;
    gap: 0.5rem;
    width: 100%;
  }

  .st-skeleton__line {
    background: linear-gradient(
      90deg,
      var(--st-semantic-surface-subtle, #eaeef2),
      var(--st-semantic-border-subtle, #d8dee4),
      var(--st-semantic-surface-subtle, #eaeef2)
    );
    background-size: 200% 100%;
    border-radius: 0.25rem;
    display: block;
    height: 0.875rem;
    width: 100%;
    animation: st-skeleton-shimmer 1.4s ease-in-out infinite;
  }

  .st-skeleton__line--heading {
    height: 1.25rem;
  }

  @keyframes st-skeleton-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-skeleton__line {
      animation: none;
    }
  }
</style>
