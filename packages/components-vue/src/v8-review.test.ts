import { afterEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DataTable from './DataTable.vue';
import LabelledIconButton from './LabelledIconButton.vue';
import WebFrame from './WebFrame.vue';
import LockPresenceBadge from './presence-badge/LockPresenceBadge.vue';
import Toast from './Toast.vue';
import TreeView from './TreeView.vue';
import ComposerEditor from './rich-text-editor/ComposerEditor.vue';
import RichTextEditor from './rich-text-editor/RichTextEditor.vue';
import CopyButton from './CopyButton.vue';
import DiagramControlGlyph from './DiagramControlGlyph.vue';
import FilterPill from './FilterPill.vue';
import Combobox from './Combobox.vue';
import MultiSelect from './MultiSelect.vue';
import TimePicker from './TimePicker.vue';
import TimeRangePicker from './TimeRangePicker.vue';
import Modal from './Modal.vue';
import Drawer from './Drawer.vue';

const wrappers: ReturnType<typeof mount>[] = [];
function render(component: any, props: Record<string, unknown>) {
  const wrapper = mount(component, { props, attachTo: document.body });
  wrappers.push(wrapper); return wrapper;
}
afterEach(() => { wrappers.splice(0).forEach(w => w.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); });
const messages = { editorLabel: 'Editor', placeholder: 'Write', preservedBlockLabel: 'Preserved {kind}', externalConflictLabel: 'Conflict' };

for (const component of [Modal, Drawer]) {
  it(`should initialize an initially open ${component.name}, close on Escape and restore scrolling`, async () => {
    document.body.style.overflow = 'auto';
    const onClose = vi.fn(), wrapper = render(component, { open: true, onClose, 'aria-label': 'Consumer title' });
    expect(document.body.style.overflow).toBe('hidden');
    expect(wrapper.get('[role=dialog]').attributes('aria-label')).toBe('Consumer title');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await wrapper.setProps({ open: false });
    expect(document.body.style.overflow).toBe('auto');
    await wrapper.setProps({ open: true });
    expect(document.body.style.overflow).toBe('hidden');
    wrapper.unmount(); wrappers.pop();
    expect(document.body.style.overflow).toBe('auto');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    document.body.style.overflow = '';
  });
  it(`should preserve external labeling on an initially open ${component.name}`, () => {
    const wrapper = render(component, { open: true, 'aria-labelledby': 'consumer-heading' });
    expect(wrapper.get('[role=dialog]').attributes('aria-labelledby')).toBe('consumer-heading');
    expect(wrapper.get('[role=dialog]').attributes('aria-label')).toBeUndefined();
  });
}

it('should preserve the Svelte fold-toggle SVG attributes through the DS Icon', () => {
  const control = render(DiagramControlGlyph, { plus: true, size: 'var(--control-size)' });
  const svg = control.get('svg');
  expect(svg.attributes('stroke-width')).toBe('2');
  expect(svg.classes()).not.toContain('st-icon');
  expect(svg.attributes('focusable')).toBeUndefined();
  expect(svg.attributes('aria-hidden')).toBe('true');
});

it('should bind table attributes and bubbling listeners exactly once on the table', async () => {
  const onClick = vi.fn();
  const table = render(DataTable, { columns: [{ key: 'name', label: 'Name' }], rows: [{ id: '1', name: 'Ada' }], id: 'users', 'aria-label': 'Users', onClick });
  expect(table.findAll('#users')).toHaveLength(1);
  expect(table.get('table').attributes('id')).toBe('users');
  await table.get('td').trigger('click'); expect(onClick).toHaveBeenCalledTimes(1);
});

it('should expose tooltip visibility on focus and forward button attributes with canonical icon classes', async () => {
  const button = render(LabelledIconButton, { label: 'Comments', icon: 'comment', id: 'comments', 'aria-controls': 'thread' });
  expect(button.get('button').attributes('id')).toBe('comments');
  expect(button.get('button').attributes('aria-controls')).toBe('thread');
  const tooltip = button.get('[role=tooltip]');
  expect(tooltip.attributes('id')).toBeTruthy(); expect(tooltip.attributes('aria-hidden')).toBe('true');
  await button.get('button').trigger('focusin');
  expect(tooltip.attributes('aria-hidden')).toBe('false');
  await button.get('button').trigger('focusout'); expect(tooltip.attributes('aria-hidden')).toBe('true');
  expect(button.get('svg').classes()).toEqual(expect.arrayContaining(['st-icon', 'lucide-message-square-icon', 'lucide-message-square']));
});

it('should diagnose an unknown icon and render a decorative fallback without throwing', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const button = render(LabelledIconButton, { label: 'Unknown', icon: 'missing-icon' });
  expect(button.get('svg.st-icon').attributes('aria-hidden')).toBe('true');
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing-icon'));
});

it('should forward WebFrame attributes, classes and load listeners on its iframe', async () => {
  const onLoad = vi.fn();
  const frame = render(WebFrame, { frame: { src: 'https://example.com' }, id: 'preview', class: 'custom', style: 'width: 90%', onLoad });
  expect(frame.get('iframe').attributes('id')).toBe('preview'); expect(frame.classes()).toContain('custom');
  expect(frame.attributes('style')).toContain('width: 90%');
  await frame.trigger('load'); expect(onLoad).toHaveBeenCalledTimes(1);
});

it('should forward badge attributes and compose its public class', () => {
  const badge = render(LockPresenceBadge, { lock: null, presence: null, capabilities: { currentActorId: 'self', canAcquire: false, canRequestUnlock: false, canForceUnlock: false }, messages: {}, nowIso: '2026-11-13T12:00:00Z', id: 'presence', class: 'custom', 'data-testid': 'consumer-presence' });
  expect(badge.attributes('id')).toBe('presence'); expect(badge.classes()).toEqual(expect.arrayContaining(['st-presence-badge', 'custom']));
  expect(badge.attributes('data-testid')).toBe('consumer-presence');
});

it('should show close and dismiss controls for once listeners and merged arrays', async () => {
  const first = vi.fn(), second = vi.fn(), dismiss = vi.fn();
  const toast = render(Toast, { title: 'Saved', onClose: [first, second] });
  await toast.get('button').trigger('click'); expect(first).toHaveBeenCalledTimes(1); expect(second).toHaveBeenCalledTimes(1);
  const queue = render(Toast, { items: [{ id: 'one', title: 'Saved' }], onDismissOnce: dismiss });
  await queue.get('button').trigger('click'); await queue.get('button').trigger('click'); expect(dismiss).toHaveBeenCalledExactlyOnceWith('one');
  const close = vi.fn(), single = render(Toast, { title: 'Saved', onCloseOnce: close });
  await single.get('button').trigger('click'); await single.get('button').trigger('click'); expect(close).toHaveBeenCalledTimes(1);
});

it('should keep once-select trees keyboard accessible', async () => {
  const onSelectOnce = vi.fn(), tree = render(TreeView, { nodes: [{ id: 'one', label: 'One' }], onSelectOnce });
  expect(tree.get('[role=treeitem]').attributes('tabindex')).toBe('0');
  await tree.get('[role=treeitem]').trigger('keydown', { key: 'Enter' }); expect(onSelectOnce).toHaveBeenCalledExactlyOnceWith('one');
});

for (const profile of ['p0', 'full']) {
  it(`should intercept template keydown in capture phase for ${profile} without inserting an Enter`, async () => {
    const onKeydown = vi.fn(() => true);
    const wrapper = render(ComposerEditor, { value: 'Draft', profile, messages, onKeydown, id: 'discard', role: 'textbox', class: 'custom' });
    await wrapper.vm.captureComposer();
    const native = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    wrapper.get('.ProseMirror').element.dispatchEvent(native);
    expect(onKeydown).toHaveBeenCalledTimes(1);
    expect(onKeydown.mock.calls[0][0]).not.toBeInstanceOf(KeyboardEvent);
    expect(native.defaultPrevented).toBe(true);
    expect((await wrapper.vm.captureComposer()).text).toBe('Draft');
    expect(wrapper.findAll('[role=textbox]')).toHaveLength(1); expect(wrapper.attributes('id')).toBeUndefined(); expect(wrapper.classes()).toContain('custom');
  });
}

it('should suppress duplicate key aliases and forwarding on disabled composers', async () => {
  const onKeydown = vi.fn(() => true), active = render(ComposerEditor, { value: 'Draft', messages, onKeydown, onKeyDown: onKeydown });
  await active.vm.captureComposer(); await active.get('.ProseMirror').trigger('keydown', { key: 'Enter' }); expect(onKeydown).toHaveBeenCalledTimes(1);
  const disabled = render(ComposerEditor, { value: 'Draft', messages, disabled: true, onKeydown });
  await disabled.vm.captureComposer(); await disabled.get('.ProseMirror').trigger('keydown', { key: 'Enter' }); expect(onKeydown).toHaveBeenCalledTimes(1);
});

it('should discard editor wrapper attributes while preserving class and the inner textbox', async () => {
  const wrapper = render(RichTextEditor, { value: { format: 'focus.markdown.p0@1', blocks: [{ paragraphId: 'p:1', kind: 'paragraph', text: 'Draft' }] }, messages, id: 'discard', role: 'textbox', 'aria-label': 'Outer', class: 'custom' });
  await wrapper.vm.captureDocument(); expect(wrapper.attributes('id')).toBeUndefined(); expect(wrapper.classes()).toContain('custom'); expect(wrapper.findAll('[role=textbox]')).toHaveLength(1);
});

it('should render control glyphs with the DS icon token contract', () => {
  const button = render(CopyButton, { value: 'Copy me' });
  expect(button.get('svg').classes()).toContain('st-icon'); expect(button.get('svg').attributes('stroke-width')).toBe('2.25');
  const control = render(DiagramControlGlyph, { plus: true, size: 'var(--control-size)' });
  expect(control.get('svg').classes()).toContain('lucide-plus'); expect(control.get('svg').attributes('stroke-width')).toBe('2');
  expect(control.get('svg').attributes('width')).toBe('var(--control-size)');
});

it.each([
  ['CopyButton', CopyButton, { value: 'Copy' }, ['14']],
  ['FilterPill', FilterPill, { field: 'Country', value: 'Canada' }, ['12']],
  ['Combobox', Combobox, { options: [{ value: 'a', label: 'A' }], value: 'a' }, ['16', '18']],
  ['MultiSelect', MultiSelect, { options: [{ value: 'a', label: 'A' }], value: ['a'] }, ['14', '18']],
  ['TimePicker', TimePicker, {}, ['16']],
  ['TimeRangePicker', TimeRangePicker, {}, ['16', '16']],
] as const)('should preserve %s control glyph dimensions during the Icon migration', (_name, component, props, sizes) => {
  const control = render(component, props);
  expect(control.findAll('svg.st-icon').map(icon => icon.attributes('width'))).toEqual(sizes);
  expect(control.findAll('svg.st-icon').map(icon => icon.attributes('height'))).toEqual(sizes);
});

it('should preserve the copied-state glyph dimensions', async () => {
  const button = render(CopyButton, { value: 'Copy' });
  await button.get('button').trigger('click');
  expect(button.get('svg.st-icon').attributes('width')).toBe('14');
});
