import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app') });
setTimeout(() => { window.__result = { ok: true, nodes: document.querySelectorAll('.svelte-flow__node').length }; }, 900);
