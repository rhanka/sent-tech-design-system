import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { createFormatPanelState, type FormatPanelState } from '@sentropic/dataviz-core';
import FormatPanel from './FormatPanel.svelte';

const state = (): FormatPanelState =>
  createFormatPanelState({
    axes: [{ id: 'revenue', label: 'Revenue' }],
    legends: [{ id: 'segment', label: 'Segment' }],
    markers: [{ id: 'points', label: 'Points' }],
  });

describe('FormatPanel (svelte)', () => {
  it('emits axis edits', async () => {
    const onChange = vi.fn();
    render(FormatPanel, { props: { value: state(), onChange, label: 'Format' } });
    expect(screen.getByRole('group', { name: 'Format' })).toBeTruthy();

    await fireEvent.input(screen.getByLabelText('Minimum Revenue'), { target: { value: '10' } });
    expect(onChange.mock.lastCall?.[0].axes[0].min).toBe(10);

    await fireEvent.click(screen.getByLabelText('Inverser Revenue'));
    expect(onChange.mock.lastCall?.[0].axes[0].inverted).toBe(true);
  });

  it('emits legend and marker edits', async () => {
    const onChange = vi.fn();
    render(FormatPanel, { props: { value: state(), onChange } });

    await fireEvent.input(screen.getByLabelText('Titre Segment'), { target: { value: 'Markets' } });
    expect(onChange.mock.lastCall?.[0].legends[0].title).toBe('Markets');

    await fireEvent.change(screen.getByLabelText('Forme Points'), { target: { value: 'diamond' } });
    expect(onChange.mock.lastCall?.[0].markers[0].shape).toBe('diamond');
  });
});
