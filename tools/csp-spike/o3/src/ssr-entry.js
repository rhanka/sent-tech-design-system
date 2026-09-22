// Entrée du build SSR (vite build --ssr) : rendu serveur par svelte/server.
import { render } from 'svelte/server';
import StaticScene from './StaticScene.svelte';
import XyflowScene from './XyflowScene.svelte';
export const renderers = {
  'static-svelte': (view) => render(StaticScene, { props: { view } }),
  xyflow: (view) => render(XyflowScene, { props: { view, sized: false } }),
  'xyflow-sized': (view) => render(XyflowScene, { props: { view, sized: true } }),
  'xyflow-sized-handles': (view) => render(XyflowScene, { props: { view, sized: true, handles: true } })
};
