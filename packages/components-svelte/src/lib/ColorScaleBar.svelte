<script lang="ts" module>
  /**
   * ColorScaleBar — affiche une échelle de couleur continue (gradient) à partir
   * d'une liste de stops arbitraires (hex/rgb/oklch/token). Pensé pour documenter
   * les échelles OKLab/séquentielles/divergentes : le consommateur fournit les
   * stops, le composant rend `linear-gradient(...)` via un `background` inline —
   * c'est sa raison d'être. Libellés d'extrémités (min/max) et orientation au
   * choix.
   *
   * Le style PROPRE (rayon, bordure, typo des libellés, gaps) reste token-only
   * (`--st-*` + fallback littéral) ; SEUL le gradient est inline.
   *
   * Props :
   *   colors      string[]                      - stops du gradient (≥2)
   *   orientation? 'horizontal' | 'vertical'    - défaut 'horizontal'
   *   length?      number  (px)                 - longueur de la barre
   *   thickness?   number  (px)                 - épaisseur de la barre
   *   min?         string                       - libellé d'extrémité bas/gauche
   *   max?         string                       - libellé d'extrémité haut/droite
   *   label?       string                       - libellé accessible
   *   class?       string
   */
  export type ColorScaleBarOrientation = "horizontal" | "vertical";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type ColorScaleBarProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    colors: string[];
    orientation?: ColorScaleBarOrientation;
    length?: number;
    thickness?: number;
    min?: string;
    max?: string;
    label?: string;
    class?: string;
  };

  let {
    colors = [],
    orientation = "horizontal",
    length,
    thickness,
    min,
    max,
    label,
    class: className,
    ...rest
  }: ColorScaleBarProps = $props();

  const isVertical = $derived(orientation === "vertical");

  // ≥2 stops requis pour un gradient ; sinon on duplique la seule couleur (aplat).
  const stops = $derived(
    colors.length >= 2 ? colors : colors.length === 1 ? [colors[0], colors[0]] : []
  );

  // Direction CSS : horizontal = gauche→droite ; vertical = bas→haut (l'extrémité
  // `max` en haut, comme une légende de heatmap).
  const direction = $derived(isVertical ? "to top" : "to right");
  const gradient = $derived(stops.length ? `linear-gradient(${direction}, ${stops.join(", ")})` : "none");

  const safeLength = $derived(length !== undefined ? Math.max(Number(length) || 0, 1) : undefined);
  const safeThickness = $derived(thickness !== undefined ? Math.max(Number(thickness) || 0, 1) : undefined);

  // Style inline de la barre : SEULE la dimension + le gradient (couleur en prop).
  // `background-image` (et non le raccourci `background`) pour le gradient.
  const barStyle = $derived(
    [
      `background-image:${gradient}`,
      isVertical
        ? safeLength !== undefined
          ? `height:${safeLength}px`
          : null
        : safeLength !== undefined
          ? `width:${safeLength}px`
          : null,
      isVertical
        ? safeThickness !== undefined
          ? `width:${safeThickness}px`
          : null
        : safeThickness !== undefined
          ? `height:${safeThickness}px`
          : null
    ]
      .filter(Boolean)
      .join("; ")
  );

  const hasEndLabels = $derived(min !== undefined || max !== undefined);
  const accessibleLabel = $derived(label);

  const classes = $derived(
    ["st-colorScaleBar", `st-colorScaleBar--${orientation}`, className].filter(Boolean).join(" ")
  );
</script>

<div {...rest} class={classes}>
  {#if label}
    <span class="st-colorScaleBar__label">{label}</span>
  {/if}
  <div class="st-colorScaleBar__track">
    {#if hasEndLabels}
      <span class="st-colorScaleBar__end st-colorScaleBar__end--max">{max ?? ""}</span>
    {/if}
    <div class="st-colorScaleBar__bar" style={barStyle} role="img" aria-label={accessibleLabel}></div>
    {#if hasEndLabels}
      <span class="st-colorScaleBar__end st-colorScaleBar__end--min">{min ?? ""}</span>
    {/if}
  </div>
</div>

<style>
  .st-colorScaleBar {
    color: var(--st-semantic-text-secondary, inherit);
    display: inline-flex;
    flex-direction: column;
    font-family: inherit;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-colorScaleBar__label {
    color: var(--st-semantic-text-primary, inherit);
    font-size: 0.875rem;
    line-height: 1.2;
  }

  .st-colorScaleBar__track {
    align-items: center;
    display: inline-flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-colorScaleBar--vertical .st-colorScaleBar__track {
    flex-direction: column;
  }

  .st-colorScaleBar__bar {
    border: var(--st-border-width-thin, 1px) solid
      var(--st-semantic-border-subtle, var(--st-semantic-border-strong, rgba(0, 0, 0, 0.12)));
    border-radius: var(--st-radius-sm, 0.25rem);
    box-sizing: border-box;
  }

  /* Dimensions par défaut (overridées par les props length/thickness inline). */
  .st-colorScaleBar--horizontal .st-colorScaleBar__bar {
    height: var(--st-colorScaleBar-thickness, 0.75rem);
    width: var(--st-colorScaleBar-length, 12rem);
  }

  .st-colorScaleBar--vertical .st-colorScaleBar__bar {
    height: var(--st-colorScaleBar-length, 12rem);
    width: var(--st-colorScaleBar-thickness, 0.75rem);
  }

  .st-colorScaleBar__end {
    color: var(--st-semantic-text-secondary, inherit);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
  }
</style>
