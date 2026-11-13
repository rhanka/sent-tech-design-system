// Read-only reference execution: no DOM, font loading or browser.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const engine = process.argv[2] ?? '/home/antoinefa/src/h2a/tmp/h-cond/memory-dossier/kit/src/card-svg-r14.js';
const { renderContainerScene } = await import(pathToFileURL(engine));
const { layoutScene } = await import(new URL('./layout-r9.js', pathToFileURL(engine)));
const roles = JSON.parse(fs.readFileSync(new URL('./memory-scenes-r14.json', pathToFileURL(engine)), 'utf8')).roles;
const approved = renderContainerScene(roles, roles.groups.filter(g => g.collapsed).map(g => g.id));
const reference = { engine: 'Memory R14 renderContainerScene', engineSha256: createHash('sha256').update(fs.readFileSync(engine)).digest('hex'), placementSha256: createHash('sha256').update(fs.readFileSync(new URL('./layout-r9.js', pathToFileURL(engine)))).digest('hex'), approvedRender: { scene: roles.id, bounds: [approved.layout.width, approved.layout.height], boxes: approved.layout.rects.size, boxedLabels: (approved.svg.match(/class="diagram-edge-pill"/g) ?? []).length }, scenes: {} };
for (const name of ['memory', 'vue-globale']) {
  const fixture = JSON.parse(fs.readFileSync(new URL(`../packages/diagram-canvas/tests/layout/dc2a/fixtures/owner/${name}.json`, import.meta.url)));
  const fallback = { top: fixture.cards.filter(c => !c.parentId).map(c => c.id), children: Object.fromEntries(fixture.cards.filter(c => c.container).map(c => [c.id, fixture.cards.filter(child => child.parentId === c.id).map(child => child.id)])) };
  const layout = fixture.source.layout ?? fallback;
  const scene = { id: name, title: name, layout,
    groups: fixture.cards.filter(c => c.container).map(c => ({ id: c.id, parentId: c.parentId, title: c.title, kicker: c.kicker, subtitle: c.purpose, cardFooter: c.footer, cardIcon: c.icon })),
    nodes: fixture.cards.filter(c => !c.container).map(c => ({ id: c.id, parentId: c.parentId, data: { title: c.title, kicker: c.kicker, function: c.purpose, detail: c.detail, cardFooter: c.footer, cardIcon: c.icon } })),
    edges: fixture.edges };
  for (const folded of [false, true]) {
    // The renderer uses a frozen route table for known scene/fold keys. Its
    // extracted placement function also accepts these test scenes unchanged.
    const result = { layout: layoutScene(scene, folded ? scene.groups.map(g => g.id) : []) };
    reference.scenes[`${name}/${folded ? 'folded' : 'expanded'}`] = { order: layout, parameters: { childGap: result.layout.params.childGap, rowGap: result.layout.params.rowGap, topGap: result.layout.params.topGap },
      rects: Object.fromEntries([...result.layout.rects].map(([id, r]) => [id, { x: r.x, y: r.y, width: r.w, height: r.h, kind: r.kind }])) };
  }
}
fs.writeFileSync(new URL('../packages/diagram-canvas/tests/layout/dc2a/fixtures/owner-r14-geometry.json', import.meta.url), JSON.stringify(reference, null, 2) + '\n');
