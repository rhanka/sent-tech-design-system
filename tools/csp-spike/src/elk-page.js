import ELK from 'elkjs/lib/elk.bundled.js';

const graph = {
  id: 'root',
  layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.padding': '[top=20,left=20,bottom=20,right=20]' },
  children: [
    { id: 'g1', layoutOptions: { 'elk.algorithm': 'layered' }, children: [
      { id: 'a', width: 90, height: 40 }, { id: 'b', width: 90, height: 40 }
    ], edges: [{ id: 'e_ab', sources: ['a'], targets: ['b'] }] },
    { id: 'g2', layoutOptions: { 'elk.algorithm': 'layered' }, children: [
      { id: 'c', width: 90, height: 40 }, { id: 'd', width: 90, height: 40 }
    ], edges: [{ id: 'e_cd', sources: ['c'], targets: ['d'] }] }
  ],
  edges: [{ id: 'e_g', sources: ['b'], targets: ['c'] }]
};

const t0 = performance.now();
new ELK().layout(graph).then((res) => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${Math.ceil(res.width)} ${Math.ceil(res.height)}`);
  svg.setAttribute('class', 'st-diagram');
  const draw = (node, ox, oy) => {
    (node.children || []).forEach((child) => {
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', ox + child.x); r.setAttribute('y', oy + child.y);
      r.setAttribute('width', child.width); r.setAttribute('height', child.height);
      r.setAttribute('class', child.children ? 'st-diagram-group' : 'st-diagram-node');
      svg.appendChild(r);
      draw(child, ox + child.x, oy + child.y);
    });
  };
  draw(res, 0, 0);
  document.getElementById('canvas').appendChild(svg);
  window.__result = { ok: true, ms: Math.round(performance.now() - t0), width: res.width, height: res.height,
    placed: (res.children || []).map((c) => ({ id: c.id, x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.width), h: Math.round(c.height) })) };
}).catch((err) => { window.__result = { ok: false, error: String(err) }; });
