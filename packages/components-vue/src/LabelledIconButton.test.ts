import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import LabelledIconButton from './LabelledIconButton.vue';
import { ICONS, ICON_NAMES } from './icon-data.js';

// Ported CA-L1 Svelte witnesses; glyphs now use the K7 neutral data contract.
const label = 'SENTINEL-LABEL';
describe('LabelledIconButton (CA-L1)', () => {
  it('keeps the ten canonical icon mappings alongside migrated control glyphs', () => {
    const canonical = [
      ['settings', 'settings'], ['eye', 'eye'], ['eye-off', 'eye-off'], ['layers', 'layers'],
      ['target', 'target'], ['close', 'x'], ['chevron-down', 'chevron-down'],
      ['chevron-right', 'chevron-right'], ['comment', 'message-square'], ['circle-dashed', 'circle-dashed'],
    ];
    for (const [name, glyph] of canonical) expect(ICONS[name as keyof typeof ICONS].name).toBe(glyph);
    expect(ICON_NAMES).toEqual(expect.arrayContaining(canonical.map(([name]) => name)));
    for (const name of ['copy', 'check', 'search', 'upload', 'clock']) expect(ICON_NAMES).toContain(name);
  });

  it('renders one icon-only button whose accessible name matches the label', () => {
    const view = mount(LabelledIconButton, { props: { label, icon: 'comment' } });
    expect(view.findAll('button')).toHaveLength(1);
    expect(view.get('button').attributes('aria-label')).toBe(label);
    expect(view.get('button').text()).toBe('');
    expect(view.get('button svg').attributes('aria-hidden')).toBe('true');
  });

  it('defaults tooltip content to the label and keeps that name when content is overridden', async () => {
    const view = mount(LabelledIconButton, { props: { label, icon: 'comment' } });
    expect(view.get('[role="tooltip"]').text()).toBe(label);
    await view.get('button').trigger('focus');
    expect(view.get('[role="tooltip"]').text()).toBe(label);
    await view.setProps({ tooltipContent: 'SENTINEL-TOOLTIP' });
    expect(view.get('[role="tooltip"]').text()).toBe('SENTINEL-TOOLTIP');
    expect(view.get('button').attributes('aria-label')).toBe(label);
  });

  it('forwards disabled, variant, size and tooltip placement', () => {
    const view = mount(LabelledIconButton, { props: { label, icon: 'comment', disabled: true, variant: 'danger', size: 'sm', tooltipPlacement: 'bottom', class: 'consumer' } });
    expect(view.get('button').element.disabled).toBe(true);
    expect(view.get('button').classes()).toEqual(expect.arrayContaining(['st-iconButton--danger', 'st-iconButton--sm']));
    expect(view.classes()).toEqual(expect.arrayContaining(['st-tooltip--bottom', 'consumer']));
  });

  it('maps toggle state and shortcuts verbatim and omits absent attributes', async () => {
    const view = mount(LabelledIconButton, { props: { label, icon: 'comment', pressed: true, ariaKeyshortcuts: 'Alt+Shift+Z' } });
    expect(view.get('button').attributes('aria-pressed')).toBe('true');
    expect(view.get('button').attributes('aria-keyshortcuts')).toBe('Alt+Shift+Z');
    await view.setProps({ pressed: false, ariaKeyshortcuts: undefined });
    expect(view.get('button').attributes('aria-pressed')).toBe('false');
    expect(view.get('button').attributes('aria-keyshortcuts')).toBeUndefined();
  });

  it('invokes the compatibility callback and Vue click listener once each', async () => {
    const onclick = vi.fn();
    const onClick = vi.fn();
    const view = mount(LabelledIconButton, { props: { label, icon: 'comment', onclick, onClick } });
    await view.get('button').trigger('click');
    expect(onclick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onclick.mock.calls[0][0]).toBe(onClick.mock.calls[0][0]);
  });
});
