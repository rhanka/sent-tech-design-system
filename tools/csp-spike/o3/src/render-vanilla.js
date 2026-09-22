// Même balisage que StaticScene.svelte, sans framework ni runtime.
const NS = 'http://www.w3.org/2000/svg';
export function renderVanilla(view, target) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'st-scene');
  svg.setAttribute('viewBox', `0 0 ${Math.ceil(view.width)} ${Math.ceil(view.height)}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Scène statique');
  const edges = document.createElementNS(NS, 'g');
  edges.setAttribute('class', 'st-scene-edges');
  for (const e of view.edges) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('class', 'st-scene-edge');
    p.setAttribute('d', (e.sections ?? []).map((s) => 'M' + [s.startPoint, ...(s.bendPoints ?? []), s.endPoint].map((q) => `${q.x} ${q.y}`).join(' L')).join(' '));
    edges.appendChild(p);
  }
  svg.appendChild(edges);
  for (const n of view.children) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'st-scene-node');
    g.setAttribute('transform', `translate(${n.x} ${n.y})`);
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('width', n.width); r.setAttribute('height', n.height); r.setAttribute('rx', '6');
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', '10'); t.setAttribute('y', n.height / 2 + 4);
    t.textContent = n.labels?.[0]?.text ?? n.id;
    g.append(r, t);
    svg.appendChild(g);
  }
  target.appendChild(svg);
}
