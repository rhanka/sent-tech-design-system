import { Stack, Inline, ColorSwatch, ColorScaleBar } from '@sentropic/design-system-react';
import { buildSequentialScale, buildDivergingScale } from '@sentropic/dataviz-core';

export type PalettePickerProps = {
  /** Palette catégorielle : chaque couleur est une pastille (ColorSwatch). Accepte des tokens DS `var(--…)`. */
  categorical?: string[];
  /** Stops d'ancrage (≥2) d'une échelle SÉQUENTIELLE → rampe OKLab (couleurs concrètes hex/rgb). */
  sequential?: string[];
  /** Stops d'ancrage (≥3) d'une échelle DIVERGENTE → rampe OKLab. */
  diverging?: string[];
  /** Échantillons des rampes de prévisualisation (défaut 9). */
  steps?: number;
  /** Libellés d'extrémité des barres. */
  min?: string;
  max?: string;
  /** Côté des pastilles en px (défaut 24). */
  swatchSize?: number;
  label?: string;
  className?: string;
};

export function PalettePicker({
  categorical,
  sequential,
  diverging,
  steps = 9,
  min,
  max,
  swatchSize = 24,
  label,
  className,
}: PalettePickerProps) {
  const seqColors =
    sequential && sequential.length >= 2 ? buildSequentialScale(sequential, steps) : null;
  let divColors: string[] | null = null;
  if (diverging && diverging.length >= 3) {
    divColors = buildDivergingScale(
      diverging[0]!,
      diverging[Math.floor(diverging.length / 2)]!,
      diverging[diverging.length - 1]!,
      steps,
    );
  }

  return (
    <Stack gap={3} className={className}>
      {categorical && categorical.length ? (
        <Inline gap={1}>
          {categorical.map((c, i) => (
            <ColorSwatch key={i} color={c} shape="circle" size={swatchSize} />
          ))}
        </Inline>
      ) : null}
      {seqColors ? (
        <ColorScaleBar
          colors={seqColors}
          min={min}
          max={max}
          label={label ? `${label} — séquentiel` : 'Échelle séquentielle'}
        />
      ) : null}
      {divColors ? (
        <ColorScaleBar
          colors={divColors}
          min={min}
          max={max}
          label={label ? `${label} — divergent` : 'Échelle divergente'}
        />
      ) : null}
    </Stack>
  );
}
