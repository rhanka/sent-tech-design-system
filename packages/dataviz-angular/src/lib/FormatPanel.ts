import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import {
  Checkbox as DsCheckbox,
  Input as DsInput,
  NumberInput as DsNumberInput,
  Select as DsSelect,
  type SelectOption,
} from '@sentropic/design-system-angular';
import {
  updateAxisFormat,
  updateLegendFormat,
  updateMarkerFormat,
  type FormatAxisScale,
  type FormatMarkerShape,
  type FormatPanelState,
} from '@sentropic/dataviz-core';

export type FormatPanelProps = {
  value: FormatPanelState;
  onChange: (next: FormatPanelState) => void;
  label?: string;
  class?: string;
};

const SCALE_OPTIONS: SelectOption[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'log', label: 'Log' },
];

const SHAPE_OPTIONS: SelectOption[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'triangle', label: 'Triangle' },
];

function optionalNumber(value: unknown): number | null {
  const text = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
  const trimmed = text.trim();
  if (!trimmed) return null;
  const next = Number(trimmed);
  return Number.isFinite(next) ? next : null;
}

function scaleFrom(value: unknown): FormatAxisScale {
  return value === 'log' ? 'log' : 'linear';
}

function shapeFrom(value: unknown): FormatMarkerShape {
  if (value === 'square' || value === 'diamond' || value === 'triangle') return value;
  return 'circle';
}

/**
 * Controlled format editor for axes, legends and markers. Every edit calls
 * `onChange` with the core `updateAxisFormat` / `updateLegendFormat` /
 * `updateMarkerFormat` result, like Vue/React.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` holds no reactive
 * state, so there is no `void <state>.value` marker to anchor on (see
 * tools/dataviz-angular-port/README.md). The component is fully controlled —
 * it renders `value` directly and writes through `(modelValueChange)`, the
 * design-system event the lot 9 `RelativeDateFilter` port established — so
 * `recompute()` is intentionally a no-op: the adapter-pattern guard requires
 * the `ngOnInit`/`ngOnChanges` pair on every adapter, and this records that
 * there is nothing to derive.
 *
 * Parity residue, measured not hidden: the Angular DS `NumberInput`/
 * `Select`/`Checkbox`/`Input` declare no `aria-label` input (React/Vue
 * forward it onto the control), so the per-axis/legend/marker labels have no
 * Angular counterpart. The visible `label` inputs still render; the run
 * attributes the missing attributes to the design system.
 */
@Component({
  selector: 'st-dataviz-format-panel',
  standalone: true,
  imports: [DsCheckbox, DsInput, DsNumberInput, DsSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="label" [class]="classInput">
      @for (axis of value.axes; track axis.id) {
        <div>
          <st-number-input
            [label]="'Minimum ' + axis.label"
            [modelValue]="axis.min ?? ''"
            (modelValueChange)="updateAxis(axis.id, { min: optionalNumber($event) })"
          ></st-number-input>
          <st-number-input
            [label]="'Maximum ' + axis.label"
            [modelValue]="axis.max ?? ''"
            (modelValueChange)="updateAxis(axis.id, { max: optionalNumber($event) })"
          ></st-number-input>
          <st-select
            [label]="'Echelle ' + axis.label"
            [modelValue]="axis.scale"
            [options]="scaleOptions"
            (modelValueChange)="updateAxis(axis.id, { scale: scaleFrom($event) })"
          ></st-select>
          <st-checkbox
            [label]="'Inverser ' + axis.label"
            [modelValue]="axis.inverted"
            [checked]="axis.inverted"
            (modelValueChange)="updateAxis(axis.id, { inverted: $event })"
          ></st-checkbox>
        </div>
      }
      @for (legend of value.legends; track legend.id) {
        <div>
          <st-input
            [label]="'Titre ' + legend.label"
            [modelValue]="legend.title"
            (modelValueChange)="updateLegend(legend.id, { title: $event })"
          ></st-input>
          <st-checkbox
            [label]="'Afficher ' + legend.label"
            [modelValue]="legend.visible"
            [checked]="legend.visible"
            (modelValueChange)="updateLegend(legend.id, { visible: $event })"
          ></st-checkbox>
        </div>
      }
      @for (marker of value.markers; track marker.id) {
        <div>
          <st-select
            [label]="'Forme ' + marker.label"
            [modelValue]="marker.shape"
            [options]="shapeOptions"
            (modelValueChange)="updateMarker(marker.id, { shape: shapeFrom($event) })"
          ></st-select>
          <st-number-input
            [label]="'Taille ' + marker.label"
            [modelValue]="marker.size"
            [min]="1"
            [step]="1"
            (modelValueChange)="updateMarker(marker.id, { size: optionalNumber($event) })"
          ></st-number-input>
          <st-input
            [label]="'Couleur ' + marker.label"
            [modelValue]="marker.color ?? ''"
            (modelValueChange)="updateMarker(marker.id, { color: $event || undefined })"
          ></st-input>
        </div>
      }
    </div>
  `,
})
export class FormatPanel implements OnInit, OnChanges {
  static readonly stComponentName = 'FormatPanel';

  @NgInput({ required: true }) value!: FormatPanelState;
  @NgInput({ required: true }) onChange!: (next: FormatPanelState) => void;
  @NgInput() label = 'Format';
  @NgInput('class') classInput?: string;

  readonly scaleOptions = SCALE_OPTIONS;
  readonly shapeOptions = SHAPE_OPTIONS;

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  updateAxis(axisId: string, patch: Parameters<typeof updateAxisFormat>[2]): void {
    this.onChange(updateAxisFormat(this.value, axisId, patch));
  }

  updateLegend(legendId: string, patch: Parameters<typeof updateLegendFormat>[2]): void {
    this.onChange(updateLegendFormat(this.value, legendId, patch));
  }

  updateMarker(markerId: string, patch: Parameters<typeof updateMarkerFormat>[2]): void {
    this.onChange(updateMarkerFormat(this.value, markerId, patch));
  }

  optionalNumber(value: unknown): number | null {
    return optionalNumber(value);
  }

  scaleFrom(value: unknown): FormatAxisScale {
    return scaleFrom(value);
  }

  shapeFrom(value: unknown): FormatMarkerShape {
    return shapeFrom(value);
  }

  private recompute(): void {
    // Fully controlled: the template renders `value` directly, so there is
    // nothing to derive. The method exists because the adapter-pattern guard
    // requires every adapter to recompute from both ngOnInit and ngOnChanges.
  }
}
