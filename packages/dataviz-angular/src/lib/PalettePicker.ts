import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import {
  ColorScaleBar,
  ColorSwatch,
  Inline,
  Stack,
} from '@sentropic/design-system-angular';
import { buildDivergingScale, buildSequentialScale } from '@sentropic/dataviz-core';

export type PalettePickerProps = {
  /** Categorical palette: one ColorSwatch per colour. */
  categorical?: string[];
  /** Anchor stops (≥2) of a SEQUENTIAL scale → an OKLab ramp. */
  sequential?: string[];
  /** Anchor stops (≥3) of a DIVERGING scale → an OKLab ramp. */
  diverging?: string[];
  /** Preview-ramp samples (default 9). */
  steps?: number;
  /** Scale-bar end labels. */
  min?: string;
  max?: string;
  /** Swatch side in px (default 24). */
  swatchSize?: number;
  label?: string;
  class?: string;
};

/**
 * Palette previews: categorical swatches plus sequential/diverging OKLab ramps
 * built by dataviz-core, rendered with the design-system Stack, Inline,
 * ColorSwatch and ColorScaleBar. No dashboard store involved.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` is pure prop
 * derivation with no reactive state, so there is no `void <state>.value`
 * marker to anchor on (see tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-palette-picker',
  standalone: true,
  imports: [Stack, Inline, ColorSwatch, ColorScaleBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-stack [gap]="3" [class]="classInput">
      @if (catList.length > 0) {
        <st-inline [gap]="1">
          @for (c of catList; track $index) {
            <st-color-swatch [color]="c" shape="circle" [size]="swatchSize"></st-color-swatch>
          }
        </st-inline>
      }
      @if (seqColors) {
        <st-color-scale-bar
          [colors]="seqColors"
          [min]="min"
          [max]="max"
          [label]="seqLabel"
        ></st-color-scale-bar>
      }
      @if (divColors) {
        <st-color-scale-bar
          [colors]="divColors"
          [min]="min"
          [max]="max"
          [label]="divLabel"
        ></st-color-scale-bar>
      }
    </st-stack>
  `,
})
export class PalettePicker implements OnInit, OnChanges {
  static readonly stComponentName = 'PalettePicker';

  @NgInput() categorical?: string[];
  @NgInput() sequential?: string[];
  @NgInput() diverging?: string[];
  @NgInput() steps = 9;
  @NgInput() min?: string;
  @NgInput() max?: string;
  @NgInput() swatchSize = 24;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  catList: string[] = [];
  seqColors: string[] | null = null;
  divColors: string[] | null = null;
  seqLabel = 'Échelle séquentielle';
  divLabel = 'Échelle divergente';

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  private recompute(): void {
    this.catList = [...(this.categorical ?? [])];
    this.seqColors =
      this.sequential && this.sequential.length >= 2
        ? buildSequentialScale(this.sequential, this.steps)
        : null;
    let div: string[] | null = null;
    if (this.diverging && this.diverging.length >= 3) {
      div = buildDivergingScale(
        this.diverging[0]!,
        this.diverging[Math.floor(this.diverging.length / 2)]!,
        this.diverging[this.diverging.length - 1]!,
        this.steps,
      );
    }
    this.divColors = div;
    this.seqLabel = this.label ? `${this.label} — séquentiel` : 'Échelle séquentielle';
    this.divLabel = this.label ? `${this.label} — divergent` : 'Échelle divergente';
  }
}
