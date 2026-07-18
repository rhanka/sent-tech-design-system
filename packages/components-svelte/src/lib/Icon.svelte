<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { ICONS, type IconName } from "./icons.js";

  type IconProps = Omit<SVGAttributes<SVGElement>, "class"> & {
    /** Canonical DS icon name (see {@link IconName}). */
    name: IconName;
    /** Square size in px. Default 18 — the DS-standard inline glyph size. */
    size?: number;
    /** Stroke width. Default 2.25 — matches the DS's existing lucide usage. */
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
    strokeWidth = 2.25,
    title,
    class: className,
    ...rest
  }: IconProps = $props();

  const Glyph = $derived(ICONS[name]);
  const classes = $derived(["st-icon", className].filter(Boolean).join(" "));
</script>

{#if Glyph}
  <Glyph
    {size}
    {strokeWidth}
    class={classes}
    role={title ? "img" : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : "true"}
    focusable="false"
    {...rest}
  />
{/if}
