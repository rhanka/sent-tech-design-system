// Ombre portée en mermaid : via classDef (trois écritures), via le look « neo » natif, et un témoin sans ombre.
// Script externe (et non inline) pour pouvoir tourner sous script-src 'self'.
import mermaid from '/node_modules/mermaid/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

const base = 'flowchart LR\n  A@{ shape: rounded, label: "Service" }\n  B@{ shape: rect, label: "Base" }\n  A --> B\n';
const VARIANTES = {
  'temoin-sans-ombre': base + '  classDef ombre fill:#eef2ff,stroke:#4f46e5\n  class A,B ombre\n',
  'classDef-drop-shadow-hex': base + '  classDef ombre fill:#eef2ff,stroke:#4f46e5,filter:drop-shadow(2px 3px 2px #00000066)\n  class A,B ombre\n',
  'classDef-drop-shadow-rgba-virgules-echappees': base + '  classDef ombre fill:#eef2ff,stroke:#4f46e5,filter:drop-shadow(2px 3px 2px rgba(0\\,0\\,0\\,0.4))\n  class A,B ombre\n',
  'classDef-filter-url': base + '  classDef ombre fill:#eef2ff,stroke:#4f46e5,filter:url(#ombre)\n  class A,B ombre\n',
  'classDef-box-shadow': base + '  classDef ombre fill:#eef2ff,stroke:#4f46e5,box-shadow:2px 3px 2px #00000066\n  class A,B ombre\n',
  'look-neo-natif': '---\nconfig:\n  look: neo\n---\n' + base,
  // themeCSS (look classique) : règle CSS libre ciblant la classe posée par classDef/class.
  'themeCSS-classe': '---\nconfig:\n  themeCSS: ".ombre rect, .ombre path, .ombre polygon { filter: drop-shadow(2px 3px 2px rgba(0, 0, 0, 0.4)); }"\n---\n'
    + base + '  classDef ombre fill:#eef2ff,stroke:#4f46e5\n  class A,B ombre\n'
};

const ctx = (s, i, n = 90) => s.slice(Math.max(0, i - n), i + n);
const tick = (ms = 120) => new Promise((r) => setTimeout(r, ms));
// Bandes de 4 px juste à droite et juste sous le nœud B (aucune arête n'en sort) : c'est là
// qu'une ombre portée vers le bas-droite se peint. Le pilote les capture et mesure leur luminance.
const bands = (x0, y0, x1, y1) => ({
  droite: { x: x1 + 1, y: y0 + 3, width: 4, height: Math.max(1, y1 - y0 - 3) },
  dessous: { x: x0 + 3, y: y1 + 1, width: Math.max(1, x1 - x0 - 3), height: 4 }
});
const out = { variantes: {} };
let k = 0;
for (const [nom, def] of Object.entries(VARIANTES)) {
  const cspAvant = window.__csp.length;
  const r = { definition: def };
  try {
    const { svg } = await mermaid.render(`v${k++}`, def);
    r.rendu = true;
    // Dans la chaîne SVG produite
    const styleEls = [...svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
    const cssText = styleEls.join('\n');
    r.chaine = {
      octets: svg.length,
      elementsStyle: styleEls.length,
      ombreDansStyleElement: [...cssText.matchAll(/(drop-shadow|box-shadow|filter:url)/g)].map((m) => ctx(cssText, m.index, 70)).slice(0, 4),
      // Règles d'ombre du <style> hors look neo (celles du thème neo sont toujours présentes).
      reglesOmbreHorsNeo: cssText.split('}').filter((r) => /shadow/.test(r) && !/data-look="neo"/.test(r)).map((r) => r.trim() + '}').slice(0, 4),
      attributsStyleAvecOmbre: [...svg.matchAll(/<(\w+)[^>]*\sstyle="([^"]*(?:shadow|filter)[^"]*)"/g)].map((m) => `${m[1]}: ${m[2]}`).slice(0, 6),
      attributsStyleTotal: (svg.match(/\sstyle="/g) || []).length,
      elementsFilter: (svg.match(/<filter\b/g) || []).length
    };
    // Dans le DOM, une fois inséré
    const holder = document.createElement('div');
    holder.innerHTML = svg;
    document.getElementById('out').appendChild(holder);
    await tick();
    const node = holder.querySelector('.node');
    const shape = node?.querySelector('path, rect, polygon');
    const cs = shape ? getComputedStyle(shape) : null;
    r.dom = { formeTag: shape?.tagName ?? null, attributStyleForme: shape?.getAttribute('style') ?? null,
      filterCalcule: cs?.filter ?? null, boxShadowCalcule: cs?.boxShadow ?? null, fillCalcule: cs?.fill ?? null,
      strokeCalcule: cs?.stroke ?? null };
    // Nœud B, en ligne (DOM de la page) puis dans un <img> (SVG servi comme image, data: URI).
    const svgEl = holder.querySelector('svg');
    const b = holder.querySelector('.node[id*="-B-"]');
    const bShape = b?.querySelector('path, rect, polygon');
    if (svgEl && bShape) {
      const rr = bShape.getBoundingClientRect();
      r.bandes = { enLigne: bands(rr.left + scrollX, rr.top + scrollY, rr.right + scrollX, rr.bottom + scrollY) };
      const m = svgEl.getScreenCTM().inverse().multiply(bShape.getScreenCTM());
      const bb = bShape.getBBox();
      const p0 = new DOMPoint(bb.x, bb.y).matrixTransform(m), p1 = new DOMPoint(bb.x + bb.width, bb.y + bb.height).matrixTransform(m);
      const vb = svgEl.viewBox.baseVal;
      const img = new Image();
      img.width = Math.round(vb.width);
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      const imgHolder = document.createElement('div');
      imgHolder.appendChild(img);
      document.getElementById('out').appendChild(imgHolder);
      await img.decode().catch(() => {});
      await tick();
      const ir = img.getBoundingClientRect();
      const sx = ir.width / vb.width;
      const X = (u) => ir.left + scrollX + (u - vb.x) * sx, Y = (u) => ir.top + scrollY + (u - vb.y) * sx;
      r.bandes.image = bands(X(p0.x), Y(p0.y), X(p1.x), Y(p1.y));
      r.image = { largeur: Math.round(ir.width), hauteur: Math.round(ir.height), charge: img.complete && img.naturalWidth > 0 };
    }
  } catch (e) { r.rendu = false; r.erreur = String(e).slice(0, 300); }
  await tick();
  r.violations = window.__csp.slice(cspAvant).map((v) => v.directive);
  out.variantes[nom] = r;
}
window.__out = out; window.__done = true;
