import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createFormatPanelState, type FormatPanelState } from '@sentropic/dataviz-core';
import { FormatPanel } from './FormatPanel.js';

const state = (): FormatPanelState =>
  createFormatPanelState({
    axes: [{ id: 'revenue', label: 'Revenue' }],
    legends: [{ id: 'segment', label: 'Segment' }],
    markers: [{ id: 'points', label: 'Points' }],
  });

describe('FormatPanel (vue)', () => {
  it('emits axis edits', async () => {
    const onChange = vi.fn();
    const w = mount(FormatPanel, { props: { value: state(), onChange, label: 'Format' } });
    expect(w.find('[role="group"]').attributes('aria-label')).toBe('Format');

    await w.find('input[aria-label="Minimum Revenue"]').setValue('10');
    expect(onChange.mock.lastCall?.[0].axes[0].min).toBe(10);

    await w.find('input[aria-label="Inverser Revenue"]').setValue(true);
    expect(onChange.mock.lastCall?.[0].axes[0].inverted).toBe(true);
  });

  it('emits legend and marker edits', async () => {
    const onChange = vi.fn();
    const w = mount(FormatPanel, { props: { value: state(), onChange } });

    await w.find('input[aria-label="Titre Segment"]').setValue('Markets');
    expect(onChange.mock.lastCall?.[0].legends[0].title).toBe('Markets');

    await w.find('select[aria-label="Forme Points"]').setValue('diamond');
    expect(onChange.mock.lastCall?.[0].markers[0].shape).toBe('diamond');
  });
});
