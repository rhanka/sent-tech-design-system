import { Checkbox, Input, NumberInput, Select } from '@sentropic/design-system-react';
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
  className?: string;
};

const SCALE_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'log', label: 'Log' },
];

const SHAPE_OPTIONS = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'triangle', label: 'Triangle' },
];

function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const next = Number(trimmed);
  return Number.isFinite(next) ? next : null;
}

function scaleFrom(value: string): FormatAxisScale {
  return value === 'log' ? 'log' : 'linear';
}

function shapeFrom(value: string): FormatMarkerShape {
  if (value === 'square' || value === 'diamond' || value === 'triangle') return value;
  return 'circle';
}

export function FormatPanel({ value, onChange, label = 'Format', className }: FormatPanelProps) {
  return (
    <div role="group" aria-label={label} className={className}>
      {value.axes.map((axis) => (
        <div key={axis.id}>
          <NumberInput
            label={`Minimum ${axis.label}`}
            aria-label={`Minimum ${axis.label}`}
            value={axis.min ?? ''}
            onChange={(event) => onChange(updateAxisFormat(value, axis.id, { min: optionalNumber(event.currentTarget.value) }))}
          />
          <NumberInput
            label={`Maximum ${axis.label}`}
            aria-label={`Maximum ${axis.label}`}
            value={axis.max ?? ''}
            onChange={(event) => onChange(updateAxisFormat(value, axis.id, { max: optionalNumber(event.currentTarget.value) }))}
          />
          <Select
            label={`Echelle ${axis.label}`}
            aria-label={`Echelle ${axis.label}`}
            value={axis.scale}
            options={SCALE_OPTIONS}
            onChange={(event) => onChange(updateAxisFormat(value, axis.id, { scale: scaleFrom(event.currentTarget.value) }))}
          />
          <Checkbox
            label={`Inverser ${axis.label}`}
            aria-label={`Inverser ${axis.label}`}
            checked={axis.inverted}
            onChange={(event) => onChange(updateAxisFormat(value, axis.id, { inverted: event.currentTarget.checked }))}
          />
        </div>
      ))}

      {value.legends.map((legend) => (
        <div key={legend.id}>
          <Input
            label={`Titre ${legend.label}`}
            aria-label={`Titre ${legend.label}`}
            value={legend.title}
            onChange={(event) => onChange(updateLegendFormat(value, legend.id, { title: event.currentTarget.value }))}
          />
          <Checkbox
            label={`Afficher ${legend.label}`}
            aria-label={`Afficher ${legend.label}`}
            checked={legend.visible}
            onChange={(event) => onChange(updateLegendFormat(value, legend.id, { visible: event.currentTarget.checked }))}
          />
        </div>
      ))}

      {value.markers.map((marker) => (
        <div key={marker.id}>
          <Select
            label={`Forme ${marker.label}`}
            aria-label={`Forme ${marker.label}`}
            value={marker.shape}
            options={SHAPE_OPTIONS}
            onChange={(event) => onChange(updateMarkerFormat(value, marker.id, { shape: shapeFrom(event.currentTarget.value) }))}
          />
          <NumberInput
            label={`Taille ${marker.label}`}
            aria-label={`Taille ${marker.label}`}
            min={1}
            step={1}
            value={marker.size}
            onChange={(event) => onChange(updateMarkerFormat(value, marker.id, { size: optionalNumber(event.currentTarget.value) }))}
          />
          <Input
            label={`Couleur ${marker.label}`}
            aria-label={`Couleur ${marker.label}`}
            value={marker.color ?? ''}
            onChange={(event) => onChange(updateMarkerFormat(value, marker.id, { color: event.currentTarget.value || undefined }))}
          />
        </div>
      ))}
    </div>
  );
}
