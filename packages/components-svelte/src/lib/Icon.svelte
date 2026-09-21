<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { ICONS, type IconName } from "./icons.js";

  type IconProps = Omit<SVGAttributes<SVGElement>, "class"> & {
    /** Canonical DS icon name (see {@link IconName}). */
    name: IconName;
    /** Square size in px. Default 18 — the DS-standard inline glyph size. */
    size?: number;
    /**
     * Stroke width. When omitted, the theme token
     * `--st-component-icon-strokeWidth` applies (default 2.25 — the DS's
     * existing lucide usage). When set, it wins over the token.
     */
    strokeWidth?: number;
    /**
     * Accessible name. When set, the icon is exposed as an image with this
     * label; when omitted, the icon is decorative (`aria-hidden`).
     */
    title?: string;
    class?: string;
  };

  let {
    name,
    size = 18,
    strokeWidth,
    title,
    class: className,
    ...rest
  }: IconProps = $props();

  const Glyph = $derived(ICONS[name]);
  const classes = $derived(["st-icon", className].filter(Boolean).join(" "));
  // An explicit prop is marked so the token rule below leaves it alone; the
  // presentation attribute keeps 2.25 when no stylesheet or theme is loaded.
  const strokeMarker = $derived(strokeWidth == null ? undefined : "prop");
</script>

{#if Glyph}
  <Glyph
    {size}
    strokeWidth={strokeWidth ?? 2.25}
    data-st-icon-stroke={strokeMarker}
    class={classes}
    role={title ? "img" : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : "true"}
    focusable="false"
    {...rest}
  />
{/if}

<style>
  /* Stroke width and colour come from the theme tokens. The selectors only
     match the DS defaults (stroke-width 2.25 set by no prop, stroke
     currentColor), so an explicit strokeWidth prop or colour keeps winning.
     :where() keeps the specificity at 0: any consumer rule still wins, while
     the declaration still beats the SVG presentation attributes. The fallbacks
     reproduce the former render when no theme is loaded. Same rule as the
     React/Vue/Angular styles.css. */
  :global(:where(.st-icon[stroke-width="2.25"]:not([data-st-icon-stroke]))) {
    stroke-width: var(--st-component-icon-strokeWidth, 2.25);
  }

  :global(:where(.st-icon[stroke="currentColor"])) {
    stroke: var(--st-component-icon-color, currentColor);
  }
</style>
