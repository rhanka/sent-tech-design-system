import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app') });
setTimeout(() => {
  const carte = document.querySelector('.carte');
  const rect = document.querySelector('svg rect');
  const g = document.querySelector('svg g');
  window.__result = { ok: true,
    wrappers: document.querySelectorAll('svelte-css-wrapper').length,
    gDansSvg: document.querySelectorAll('svg g').length,
    // Propriété qui peint réellement : background-color en HTML, fill en SVG.
    // La première version lisait backgroundColor sur le <rect> SVG, qui vaut toujours transparent.
    fondApplique: carte ? getComputedStyle(carte).backgroundColor : rect ? getComputedStyle(rect).fill : null,
    lectureAnterieureSvg: rect ? getComputedStyle(rect).backgroundColor : null,
    varSurG: g ? getComputedStyle(g).getPropertyValue('--st-fond').trim() : null,
    attributStyleG: g ? g.getAttribute('style') : null,
    varSurRect: rect ? getComputedStyle(rect).getPropertyValue('--st-fond').trim() : null
  };
}, 350);
