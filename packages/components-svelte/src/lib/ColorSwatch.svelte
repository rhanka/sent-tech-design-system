<script lang="ts" module>
  export type ColorSwatchShape = "square" | "circle" | "pill";
</script>

<script lang="ts">
  // ColorSwatch — affiche UNE couleur arbitraire (hex, rgb(), oklch() ou
  // var(--token)) sous forme de pastille. Contrairement à Tag/Badge (limités aux
  // tons category1..8 du DS), la couleur passée en prop est rendue via un
  // `background` inline : c'est sa raison d'être (palette-picker, page « échelles
  // de couleur »). Le style PROPRE (taille, rayon, bordure, typo) reste token-only.
  import type { HTMLAttributes } from "svelte/elements";

  type ColorSwatchProps = Omit<HTMLAttributes<HTMLSpanElement>, "class" | "color"> & {
    color: string;
    size?: number;
    shape?: ColorSwatchShape;
    label?: string;
    class?: string;
  };

  let {
    color,
    size = 24,
    shape = "square",
    label,
    class: className,
    ...rest
  }: ColorSwatchProps = $props();

  const safeSize = $derived(Math.max(Number(size) || 0, 1));
  const accessibleLabel = $derived(label ?? color);
  const chipStyle = $derived(
    `background-color:${color}; width:${safeSize}px; height:${safeSize}px;`
  );
  const classes = $derived(
    ["st-colorSwatch", `st-colorSwatch--${shape}`, className].filter(Boolean).join(" ")
  );
</script>

<span {...rest} class={classes}>
  <span class="st-colorSwatch__chip" style={chipStyle} role="img" aria-label={accessibleLabel}></span>
  {#if label}
    <span class="st-colorSwatch__label">{label}</span>
  {/if}
</span>

<style>
  .st-colorSwatch {
    align-items: center;
    color: var(--st-semantic-text-secondary, inherit);
    display: inline-flex;
    font-family: inherit;
    gap: var(--st-spacing-2, 0.5rem);
    line-height: 1;
    vertical-align: middle;
  }

  .st-colorSwatch__chip {
    border: var(--st-border-width-thin, 1px) solid
      var(--st-semantic-border-subtle, var(--st-semantic-border-strong, rgba(0, 0, 0, 0.12)));
    border-radius: var(--st-radius-sm, 0.25rem);
    box-sizing: border-box;
    display: inline-block;
    flex: none;
  }

  .st-colorSwatch--circle .st-colorSwatch__chip {
    border-radius: var(--st-radius-full, 999px);
  }

  .st-colorSwatch--pill .st-colorSwatch__chip {
    border-radius: var(--st-radius-pill, var(--st-radius-full, 999px));
  }

  .st-colorSwatch__label {
    color: var(--st-semantic-text-primary, inherit);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }
</style>
