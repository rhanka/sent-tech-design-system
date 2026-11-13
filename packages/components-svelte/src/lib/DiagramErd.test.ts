import { readFileSync } from 'node:fs';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect, afterEach } from 'vitest';
import { convertEngramErdScene, m3ProfileRegistry, shippedExecutorBindings, type EngramErdScene } from '../../../diagram-core/dist/index.js';
import DiagramSceneFigure from './DiagramSceneFigure.svelte';
const scenes = JSON.parse(readFileSync('../diagram-core/tests/fixtures/erd/ERD-SCENES.json', 'utf8')).ontologies as EngramErdScene[];
afterEach(cleanup);
describe('ERD Svelte host', () => {
  for (const source of scenes)
    it('should render and expose every field and relation in ' + source.id, async () => {
      const data = convertEngramErdScene(source);
      const mounted = render(DiagramSceneFigure, { ...data, registry: m3ProfileRegistry, bindings: shippedExecutorBindings, title: source.id });
      await tick();
      const root = mounted.container;
      expect(root.querySelector('[data-scene-refused]')).toBeNull();
      expect(root.querySelectorAll('[data-scene-kind="erd"]')).toHaveLength(source.classes.length);
      expect(root.querySelectorAll('[data-erd-field]')).toHaveLength(source.classes.reduce((n, c) => n + c.fields.length, 0));
      expect(root.querySelectorAll('[data-scene-edge]')).toHaveLength(source.relations.length);
      expect(root.querySelectorAll('[data-erd-marker]')).toHaveLength(2 * source.relations.length);
      expect(root.querySelectorAll('[data-erd-table-field]')).toHaveLength(Object.keys(data.document.ports).length);
      expect(root.querySelectorAll('[data-erd-table-relation]')).toHaveLength(source.relations.length);
      const button = root.querySelector<HTMLButtonElement>('.st-diagramErd-toggle')!;
      const node = button.parentElement!, fields = node.querySelectorAll('[data-erd-field]').length;
      await fireEvent.click(button);
      await tick();
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(node.querySelectorAll('[data-erd-field]')).toHaveLength(0);
      expect(root.querySelectorAll('[data-scene-edge]')).toHaveLength(source.relations.length);
      expect(root.ownerDocument.activeElement).toBe(button);
      await fireEvent.click(button);
      await tick();
      expect(node.querySelectorAll('[data-erd-field]')).toHaveLength(fields);
    });
});
