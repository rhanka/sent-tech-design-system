import { describe, it, expect } from 'vitest';
import {
  createFormatPanelState,
  updateAxisFormat,
  updateLegendFormat,
  updateMarkerFormat,
} from './index.js';

const state = () =>
  createFormatPanelState({
    axes: [{ id: 'revenue', label: 'Revenue' }],
    legends: [{ id: 'segment', label: 'Segment' }],
    markers: [{ id: 'points', label: 'Points' }],
  });

describe('format panel state', () => {
  it('creates frozen defaults for axes, legends and markers', () => {
    const current = state();
    expect(current.axes[0]).toEqual({
      id: 'revenue',
      label: 'Revenue',
      scale: 'linear',
      inverted: false,
    });
    expect(current.legends[0]).toEqual({
      id: 'segment',
      label: 'Segment',
      title: 'Segment',
      visible: true,
    });
    expect(current.markers[0]).toEqual({
      id: 'points',
      label: 'Points',
      shape: 'circle',
      size: 6,
    });
    expect(Object.isFrozen(current)).toBe(true);
    expect(Object.isFrozen(current.axes)).toBe(true);
  });

  it('updates one axis without mutating the previous state', () => {
    const current = state();
    const next = updateAxisFormat(current, 'revenue', {
      min: 0,
      max: 100,
      scale: 'log',
      inverted: true,
    });

    expect(next.axes[0]).toEqual({
      id: 'revenue',
      label: 'Revenue',
      min: 0,
      max: 100,
      scale: 'log',
      inverted: true,
    });
    expect(current.axes[0]?.min).toBeUndefined();
  });

  it('updates legend title and marker shape', () => {
    const current = state();
    const withLegend = updateLegendFormat(current, 'segment', { title: 'Markets', visible: false });
    const withMarker = updateMarkerFormat(withLegend, 'points', { shape: 'diamond', size: 10 });

    expect(withMarker.legends[0]?.title).toBe('Markets');
    expect(withMarker.legends[0]?.visible).toBe(false);
    expect(withMarker.markers[0]?.shape).toBe('diamond');
    expect(withMarker.markers[0]?.size).toBe(10);
  });
});
