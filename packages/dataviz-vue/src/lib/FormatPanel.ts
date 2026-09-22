import { defineComponent, h, type Component, type PropType } from 'vue';
import { Checkbox, Input, NumberInput, Select } from '@sentropic/design-system-vue';
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

function eventValue(event: Event): string {
  const target = event.currentTarget;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return target.value;
  return '';
}

function eventChecked(event: Event): boolean {
  const target = event.currentTarget;
  return target instanceof HTMLInputElement ? target.checked : false;
}

function textValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function optionalNumber(value: unknown): number | null {
  const trimmed = textValue(value).trim();
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

export const FormatPanel = defineComponent({
  name: 'FormatPanel',
  props: {
    value: { type: Object as PropType<FormatPanelState>, required: true },
    onChange: { type: Function as PropType<(next: FormatPanelState) => void>, required: true },
    label: { type: String, default: 'Format' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const emitAxisNumber = (axisId: string, field: 'min' | 'max', raw: unknown) => {
      props.onChange(updateAxisFormat(props.value, axisId, { [field]: optionalNumber(raw) }));
    };
    const emitAxisScale = (axisId: string, raw: unknown) => {
      props.onChange(updateAxisFormat(props.value, axisId, { scale: scaleFrom(raw) }));
    };
    const emitMarkerShape = (markerId: string, raw: unknown) => {
      props.onChange(updateMarkerFormat(props.value, markerId, { shape: shapeFrom(raw) }));
    };

    return () =>
      h('div', { role: 'group', 'aria-label': props.label, class: props.class }, [
        ...props.value.axes.map((axis) =>
          h('div', { key: axis.id }, [
            h(NumberInput as Component, {
              label: `Minimum ${axis.label}`,
              'aria-label': `Minimum ${axis.label}`,
              modelValue: axis.min ?? '',
              'onUpdate:modelValue': (raw: string | number) => emitAxisNumber(axis.id, 'min', raw),
              onInput: (event: Event) => emitAxisNumber(axis.id, 'min', eventValue(event)),
            }),
            h(NumberInput as Component, {
              label: `Maximum ${axis.label}`,
              'aria-label': `Maximum ${axis.label}`,
              modelValue: axis.max ?? '',
              'onUpdate:modelValue': (raw: string | number) => emitAxisNumber(axis.id, 'max', raw),
              onInput: (event: Event) => emitAxisNumber(axis.id, 'max', eventValue(event)),
            }),
            h(Select as Component, {
              label: `Echelle ${axis.label}`,
              'aria-label': `Echelle ${axis.label}`,
              modelValue: axis.scale,
              options: SCALE_OPTIONS,
              'onUpdate:modelValue': (raw: string) => emitAxisScale(axis.id, raw),
              onChange: (event: Event) => emitAxisScale(axis.id, eventValue(event)),
            }),
            h(Checkbox as Component, {
              label: `Inverser ${axis.label}`,
              'aria-label': `Inverser ${axis.label}`,
              modelValue: axis.inverted,
              checked: axis.inverted,
              'onUpdate:modelValue': (checked: boolean) => {
                props.onChange(updateAxisFormat(props.value, axis.id, { inverted: checked }));
              },
              onChange: (event: Event) => {
                props.onChange(updateAxisFormat(props.value, axis.id, { inverted: eventChecked(event) }));
              },
            }),
          ])
        ),
        ...props.value.legends.map((legend) =>
          h('div', { key: legend.id }, [
            h(Input as Component, {
              label: `Titre ${legend.label}`,
              'aria-label': `Titre ${legend.label}`,
              modelValue: legend.title,
              'onUpdate:modelValue': (raw: string) => {
                props.onChange(updateLegendFormat(props.value, legend.id, { title: raw }));
              },
              onInput: (event: Event) => {
                props.onChange(updateLegendFormat(props.value, legend.id, { title: eventValue(event) }));
              },
            }),
            h(Checkbox as Component, {
              label: `Afficher ${legend.label}`,
              'aria-label': `Afficher ${legend.label}`,
              modelValue: legend.visible,
              checked: legend.visible,
              'onUpdate:modelValue': (checked: boolean) => {
                props.onChange(updateLegendFormat(props.value, legend.id, { visible: checked }));
              },
              onChange: (event: Event) => {
                props.onChange(updateLegendFormat(props.value, legend.id, { visible: eventChecked(event) }));
              },
            }),
          ])
        ),
        ...props.value.markers.map((marker) =>
          h('div', { key: marker.id }, [
            h(Select as Component, {
              label: `Forme ${marker.label}`,
              'aria-label': `Forme ${marker.label}`,
              modelValue: marker.shape,
              options: SHAPE_OPTIONS,
              'onUpdate:modelValue': (raw: string) => emitMarkerShape(marker.id, raw),
              onChange: (event: Event) => emitMarkerShape(marker.id, eventValue(event)),
            }),
            h(NumberInput as Component, {
              label: `Taille ${marker.label}`,
              'aria-label': `Taille ${marker.label}`,
              modelValue: marker.size,
              min: 1,
              step: 1,
              'onUpdate:modelValue': (raw: string | number) => {
                props.onChange(updateMarkerFormat(props.value, marker.id, { size: optionalNumber(raw) }));
              },
              onInput: (event: Event) => {
                props.onChange(updateMarkerFormat(props.value, marker.id, { size: optionalNumber(eventValue(event)) }));
              },
            }),
            h(Input as Component, {
              label: `Couleur ${marker.label}`,
              'aria-label': `Couleur ${marker.label}`,
              modelValue: marker.color ?? '',
              'onUpdate:modelValue': (raw: string) => {
                props.onChange(updateMarkerFormat(props.value, marker.id, { color: raw || undefined }));
              },
              onInput: (event: Event) => {
                props.onChange(updateMarkerFormat(props.value, marker.id, { color: eventValue(event) || undefined }));
              },
            }),
          ])
        ),
      ]);
  },
});
