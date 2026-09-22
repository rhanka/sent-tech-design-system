const ns = 'http://www.w3.org/2000/svg';
const t0 = performance.now();
fetch('/placed-view.json').then((r) => r.json()).then((view) => {
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${Math.ceil(view.width)} ${Math.ceil(view.height)}`);
  svg.setAttribute('class', 'st-diagram');
  const draw = (node, ox, oy) => (node.children || []).forEach((child) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', ox + child.x); r.setAttribute('y', oy + child.y);
    r.setAttribute('width', child.width); r.setAttribute('height', child.height);
    r.setAttribute('class', child.children ? 'st-diagram-group' : 'st-diagram-node');
    svg.appendChild(r);
    (child.labels || []).forEach((l) => {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', ox + child.x + 8); t.setAttribute('y', oy + child.y + 24);
      t.setAttribute('class', 'st-diagram-label'); t.textContent = l.text; svg.appendChild(t);
    });
    draw(child, ox + child.x, oy + child.y);
  });
  draw(view, 0, 0);
  document.getElementById('canvas').appendChild(svg);
  window.__result = { ok: true, ms: Math.round(performance.now() - t0), rects: svg.querySelectorAll('rect').length,
    elkInBundle: typeof window.ELK !== 'undefined' };
}).catch((e) => { window.__result = { ok: false, error: String(e) }; });
