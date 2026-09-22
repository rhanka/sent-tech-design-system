<script lang="ts" module>
  import type { FormatPanelState } from '@sentropic/dataviz-core';

  export type FormatPanelProps = {
    value: FormatPanelState;
    onChange: (next: FormatPanelState) => void;
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { Checkbox, Input, Select } from '@sentropic/design-system-svelte';
  import {
    updateAxisFormat,
    updateLegendFormat,
    updateMarkerFormat,
    type FormatAxisScale,
    type FormatMarkerShape,
  } from '@sentropic/dataviz-core';
  import FormatNumberInput from './FormatNumberInput.svelte';

  let { value, onChange, label = 'Format', class: className }: FormatPanelProps = $props();

  function textValue(event: Event): string {
    const target = event.currentTarget;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return target.value;
    return '';
  }

  function checkedValue(event: Event): boolean {
    const target = event.currentTarget;
    return target instanceof HTMLInputElement ? target.checked : false;
  }

  function scaleFrom(event: Event): FormatAxisScale {
    return textValue(event) === 'log' ? 'log' : 'linear';
  }

  function shapeFrom(event: Event): FormatMarkerShape {
    const next = textValue(event);
    if (next === 'square' || next === 'diamond' || next === 'triangle') return next;
    return 'circle';
  }
</script>

<div role="group" aria-label={label} class={className}>
  {#each value.axes as axis (axis.id)}
    <div>
      <FormatNumberInput
        label={`Minimum ${axis.label}`}
        value={axis.min}
        onValue={(next) => onChange(updateAxisFormat(value, axis.id, { min: next }))}
      />
      <FormatNumberInput
        label={`Maximum ${axis.label}`}
        value={axis.max}
        onValue={(next) => onChange(updateAxisFormat(value, axis.id, { max: next }))}
      />
      <Select
        label={`Echelle ${axis.label}`}
        aria-label={`Echelle ${axis.label}`}
        value={axis.scale}
        onchange={(event) => onChange(updateAxisFormat(value, axis.id, { scale: scaleFrom(event) }))}
      >
        <option value="linear">Linear</option>
        <option value="log">Log</option>
      </Select>
      <Checkbox
        label={`Inverser ${axis.label}`}
        aria-label={`Inverser ${axis.label}`}
        checked={axis.inverted}
        onchange={(event) => onChange(updateAxisFormat(value, axis.id, { inverted: checkedValue(event) }))}
      />
    </div>
  {/each}

  {#each value.legends as legend (legend.id)}
    <div>
      <Input
        label={`Titre ${legend.label}`}
        aria-label={`Titre ${legend.label}`}
        value={legend.title}
        oninput={(event) => onChange(updateLegendFormat(value, legend.id, { title: textValue(event) }))}
      />
      <Checkbox
        label={`Afficher ${legend.label}`}
        aria-label={`Afficher ${legend.label}`}
        checked={legend.visible}
        onchange={(event) => onChange(updateLegendFormat(value, legend.id, { visible: checkedValue(event) }))}
      />
    </div>
  {/each}

  {#each value.markers as marker (marker.id)}
    <div>
      <Select
        label={`Forme ${marker.label}`}
        aria-label={`Forme ${marker.label}`}
        value={marker.shape}
        onchange={(event) => onChange(updateMarkerFormat(value, marker.id, { shape: shapeFrom(event) }))}
      >
        <option value="circle">Circle</option>
        <option value="square">Square</option>
        <option value="diamond">Diamond</option>
        <option value="triangle">Triangle</option>
      </Select>
      <FormatNumberInput
        label={`Taille ${marker.label}`}
        min={1}
        step={1}
        value={marker.size}
        onValue={(next) => onChange(updateMarkerFormat(value, marker.id, { size: next }))}
      />
      <Input
        label={`Couleur ${marker.label}`}
        aria-label={`Couleur ${marker.label}`}
        value={marker.color ?? ''}
        oninput={(event) => onChange(updateMarkerFormat(value, marker.id, { color: textValue(event) || undefined }))}
      />
    </div>
  {/each}
</div>
