import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app') });
setTimeout(() => {
  window.__result = { ok: true,
    wrapper: document.querySelectorAll('svelte-css-wrapper').length,
    attributStyleLitteral: [...document.querySelectorAll('[style]')].map((e) => e.getAttribute('style')).slice(0, 3) };
}, 300);
