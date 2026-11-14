import { mount } from 'svelte';
import { createApp, h } from 'vue';
import Harness from './Harness.svelte';
import VueFigure from '../../packages/components-vue/src/DiagramSceneFigure.vue';
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';
import { fixture } from './fixtures.js';

const style = document.createElement('style');
style.textContent = compileTheme(sentTechTheme);
document.head.append(style);
const params = new URLSearchParams(location.search);
const props = { ...fixture(params.get('scene')),
  onCameraChange: camera => { window.__camera = camera; } };
const target = document.querySelector('#app');
if (params.get('framework') === 'svelte') mount(Harness, { target, props });
else if (params.get('framework') === 'vue') createApp({ render: () => h(VueFigure, props) }).mount(target);
else throw new Error('Unknown framework');
window.__mounted = true;
