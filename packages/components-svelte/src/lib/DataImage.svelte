<script lang="ts" module>
  export type DataImageFit = "cover" | "contain";
</script>

<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";

  type DataImageProps = Omit<HTMLImgAttributes, "class" | "src" | "alt" | "width" | "height"> & {
    /** Image URL (required). */
    src: string;
    /** Alternative text (required for a11y; pass "" only for purely decorative images). */
    alt: string;
    /** Intrinsic / box width (number → px, or any CSS length). */
    width?: number | string;
    /** Intrinsic / box height (number → px, or any CSS length). */
    height?: number | string;
    /** `object-fit` behaviour inside its box. Default `cover`. */
    fit?: DataImageFit;
    /** Border radius (CSS length). */
    radius?: number | string;
    class?: string;
  };

  let {
    src,
    alt,
    width,
    height,
    fit = "cover",
    radius,
    loading = "lazy",
    decoding = "async",
    style: styleProp,
    class: className,
    ...rest
  }: DataImageProps = $props();

  const len = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

  const classes = () => ["st-dataImage", `st-dataImage--${fit}`, className].filter(Boolean).join(" ");

  const dimensionStyle = $derived(
    [len(width) ? `width:${len(width)}` : "", len(height) ? `height:${len(height)}` : "", len(radius) ? `border-radius:${len(radius)}` : ""]
      .filter(Boolean)
      .join(";")
  );

  const style = $derived(
    [dimensionStyle, styleProp ? String(styleProp).trim().replace(/;?\s*$/, "") : ""].filter(Boolean).join(";") || undefined
  );
</script>

<img
  {...rest}
  class={classes()}
  {src}
  {alt}
  {style}
  {loading}
  {decoding}
/>

<style>
  .st-dataImage {
    display: block;
    max-inline-size: 100%;
  }

  .st-dataImage--cover {
    object-fit: cover;
  }

  .st-dataImage--contain {
    object-fit: contain;
  }
</style>
