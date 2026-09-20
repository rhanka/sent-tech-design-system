import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app') });
setTimeout(() => {
  const carte = document.querySelector('.carte') || document.querySelector('rect');
  window.__result = { ok: true,
    wrappers: document.querySelectorAll('svelte-css-wrapper').length,
    gDansSvg: document.querySelectorAll('svg g').length,
    fondApplique: carte ? (getComputedStyle(carte).backgroundColor || carte.getAttribute('fill')) : null };
}, 350);
