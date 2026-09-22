<script lang="ts" module>
  export type PalettePickerProps = {
    /** Palette catégorielle : chaque couleur est affichée comme une pastille (ColorSwatch). Accepte des tokens DS `var(--…)`. */
    categorical?: string[];
    /** Stops d'ancrage (≥2) d'une échelle SÉQUENTIELLE → rampe OKLab (couleurs concrètes hex/rgb). */
    sequential?: string[];
    /** Stops d'ancrage (≥3, premier/milieu/dernier utilisés) d'une échelle DIVERGENTE → rampe OKLab. */
    diverging?: string[];
    /** Nombre d'échantillons des rampes de prévisualisation (défaut 9). */
    steps?: number;
    /** Libellés d'extrémité des barres séquentielle/divergente. */
    min?: string;
    max?: string;
    /** Côté des pastilles catégorielles en px (défaut 24). */
    swatchSize?: number;
    /** Libellé accessible de base. */
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { Stack, Inline, ColorSwatch, ColorScaleBar } from '@sentropic/design-system-svelte';
  import { buildSequentialScale, buildDivergingScale } from '@sentropic/dataviz-core';

  let {
    categorical,
    sequential,
    diverging,
    steps = 9,
    min,
    max,
    swatchSize = 24,
    label,
    class: className,
  }: PalettePickerProps = $props();

  // OKLab ramps are computed from the supplied anchor stops (perceptually even,
  // unlike a naive sRGB gradient). The discrete categorical palette is shown
  // as-is (each color = one DS ColorSwatch).
  const seqColors = $derived(
    sequential && sequential.length >= 2 ? buildSequentialScale(sequential, steps) : null,
  );
  const divColors = $derived.by(() => {
    if (!diverging || diverging.length < 3) return null;
    const lo = diverging[0]!;
    const mid = diverging[Math.floor(diverging.length / 2)]!;
    const hi = diverging[diverging.length - 1]!;
    return buildDivergingScale(lo, mid, hi, steps);
  });
</script>

<Stack gap={3} class={className}>
  {#if categorical && categorical.length}
    <Inline gap={1}>
      {#each categorical as c, i (i)}
        <ColorSwatch color={c} shape="circle" size={swatchSize} />
      {/each}
    </Inline>
  {/if}
  {#if seqColors}
    <ColorScaleBar
      colors={seqColors}
      {min}
      {max}
      label={label ? `${label} — séquentiel` : 'Échelle séquentielle'}
    />
  {/if}
  {#if divColors}
    <ColorScaleBar
      colors={divColors}
      {min}
      {max}
      label={label ? `${label} — divergent` : 'Échelle divergente'}
    />
  {/if}
</Stack>
