import ELK from 'elkjs/lib/elk.bundled.js';
import { readFileSync, readdirSync } from 'node:fs';
const C = process.env.CORPUS ?? process.argv[2];
if (!C) { console.error('usage: CORPUS=<dossier> node measure.mjs   (ou: node measure.mjs <dossier>)'); process.exit(2); }
const FRAME = { w: 1440, h: 900 };
const sumLeafArea = (n, acc = { area: 0, cards: 0 }) => {
  for (const c of n.children ?? []) {
    if (c.children?.length) sumLeafArea(c, acc);
    else { acc.area += (c.width ?? 0) * (c.height ?? 0); acc.cards += 1; }
  }
  return acc;
};
const out = [];
for (const f of readdirSync(C).filter((n) => n.endsWith('.elk.json'))) {
  const input = JSON.parse(readFileSync(`${C}/${f}`, 'utf8')).elkInput;
  const { area, cards } = sumLeafArea(input);
  const t0 = Date.now();
  const placed = await new ELK().layout(structuredClone(input));
  const ms = Date.now() - t0;
  const W = placed.width, H = placed.height;
  const scale = Math.min(FRAME.w / W, FRAME.h / H);
  const occupancy = area / (W * H);
  // Plafond théorique : cartes empaquetées bord à bord, aucun espacement.
  const scalePacked = Math.sqrt((FRAME.w * FRAME.h) / area);
  out.push({ vue: f.replace('.elk.json', ''), cartes: cards, ms,
    boite: { w: Math.round(W), h: Math.round(H) },
    aireCartes: area,
    occupation: +(occupancy * 100).toFixed(1),
    echelleAjustee: +scale.toFixed(4),
    echellePlafondEmpaquete: +scalePacked.toFixed(4),
    // taille de police source requise pour tenir un plancher donné
    policeSourceRequisePour12px: +(12 / scale).toFixed(1),
    policeSourceRequisePour12pxSiEmpaquete: +(12 / scalePacked).toFixed(1) });
}
console.log(JSON.stringify(out, null, 2));
