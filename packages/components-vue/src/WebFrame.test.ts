import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import WebFrame from './WebFrame.vue';

// The iframe witness from dataviz-svelte/ObjectLayers.test.ts and its core defaults.
describe('WebFrame', () => {
  it('renders the Svelte iframe source and accessible title', () => {
    const view = mount(WebFrame, { props: { frame: { src: 'https://example.com/embed', title: 'Embedded report' } } });
    const iframe = view.get('iframe');
    expect(iframe.attributes('src')).toBe('https://example.com/embed');
    expect(iframe.attributes('title')).toBe('Embedded report');
    expect(iframe.attributes('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    expect(iframe.attributes('loading')).toBe('lazy');
    expect(iframe.attributes('sandbox')).toBeUndefined();
    expect(iframe.attributes('allow')).toBeUndefined();
  });

  it('resolves sandbox arrays and preserves authored frame attributes', async () => {
    const view = mount(WebFrame, { props: { frame: { src: '/form', sandbox: ['allow-scripts', 'allow-forms'], loading: 'eager', referrerPolicy: 'no-referrer', allow: 'fullscreen' }, class: 'consumer' } });
    expect(view.get('iframe').attributes()).toMatchObject({ title: 'Embedded page', sandbox: 'allow-scripts allow-forms', loading: 'eager', referrerpolicy: 'no-referrer', allow: 'fullscreen', class: 'consumer' });
    await view.setProps({ frame: { src: '/empty', title: '', sandbox: '', allow: '' } });
    expect(view.get('iframe').attributes()).toMatchObject({ src: '/empty', title: '', sandbox: '', allow: '' });
  });
});
