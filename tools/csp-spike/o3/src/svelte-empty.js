// Référence : runtime Svelte seul, sans scène ; sert à isoler le coût marginal des composants.
import { mount, flushSync } from 'svelte';
import Empty from './Empty.svelte';
import './scene.css';
import { T, finish } from './common.js';
T.data = T.start = performance.now();
mount(Empty, { target: document.getElementById('app'), props: { label: 'vide' } });
flushSync();
finish({ nodes: 0, edges: 0 });
