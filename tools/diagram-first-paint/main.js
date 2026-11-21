import { mount } from 'svelte';
import { createApp, h } from 'vue';
import Harness from './Harness.svelte';
import VueFigure from '../../packages/components-vue/src/DiagramSceneFigure.vue';
import '../../packages/components-vue/src/styles.css';
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';
import { expectedRelations, fixture } from './fixtures.js';

const style = document.createElement('style');
style.textContent = compileTheme(sentTechTheme);
document.head.append(style);
const params = new URLSearchParams(location.search);
const sceneName = params.get('scene');
const fitToWindow = params.has('fitToWindow')
  ? params.get('fitToWindow') !== 'false'
  : Boolean(sceneName?.startsWith('r7-'));
const props = { ...fixture(sceneName),
  fitToWindow,
  onCameraChange: camera => { window.__camera = camera; } };
window.__relations = expectedRelations(sceneName);
const target = document.querySelector('#app');
if (params.get('framework') === 'svelte') mount(Harness, { target, props: { props } });
else if (params.get('framework') === 'vue') createApp({ render: () => h(VueFigure, props) }).mount(target);
else throw new Error('Unknown framework');
window.__mounted = true;
