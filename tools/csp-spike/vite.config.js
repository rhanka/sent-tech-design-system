import { defineConfig } from 'vite';
export default defineConfig({
  root: '.', publicDir: 'public',
  build: { outDir: 'dist', emptyOutDir: true, cssCodeSplit: false,
    rollupOptions: { input: { elk: 'elk.html', bpmn: 'bpmn.html', control: 'control.html', 'bpmn-modeler': 'bpmn-modeler.html', focus: 'focus.html' } } }
});
