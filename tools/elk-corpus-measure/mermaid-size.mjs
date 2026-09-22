// Estime la taille du mermaid qu'un exportateur produirait pour les scènes
// réelles, et la confronte aux limites des visualiseurs de plateforme.
import { readFileSync, readdirSync } from 'node:fs';
const C = process.env.CORPUS;
const GITLAB_CHAR_LIMIT = 2000;   // MAX_CHAR_LIMIT par diagramme
const collect = (n, nodes = [], edges = []) => {
  for (const c of n.children ?? []) {
    nodes.push({ id: c.id, container: !!c.children?.length });
    collect(c, nodes, edges);
  }
  for (const e of n.edges ?? []) edges.push(e);
  return { nodes, edges };
};
const safe = (s) => String(s ?? '').replace(/"/g, "'");
for (const f of readdirSync(C).filter((n) => n.endsWith('.elk.json'))) {
  const doc = JSON.parse(readFileSync(`${C}/${f}`, 'utf8'));
  const { nodes, edges } = collect(doc.elkInput);
  const labels = doc.labels ?? {};
  const lines = ['flowchart TB'];
  for (const n of nodes) {
    const label = safe(labels[n.id] ?? n.id);
    lines.push(`  ${n.id.replace(/[^\w]/g, '_')}@{ shape: ${n.container ? 'rect' : 'rounded'}, label: "${label}" }`);
  }
  for (const e of edges) {
    const s = (e.sources?.[0] ?? '').replace(/[^\w]/g, '_');
    const t = (e.targets?.[0] ?? '').replace(/[^\w]/g, '_');
    if (s && t) lines.push(`  ${s} --> ${t}`);
  }
  lines.push('  classDef dsCard fill:#eef2ff,stroke:#4f46e5,stroke-width:2px,color:#1e1b4b,font-size:12px,font-weight:600,font-family:Inter');
  lines.push(`  class ${nodes.map((n) => n.id.replace(/[^\w]/g, '_')).join(',')} dsCard`);
  const text = lines.join('\n');
  console.log(JSON.stringify({
    vue: f.replace('.elk.json', ''), noeuds: nodes.length, liaisons: edges.length,
    caracteres: text.length,
    limiteGitLab: GITLAB_CHAR_LIMIT,
    passeGitLab: text.length <= GITLAB_CHAR_LIMIT,
    depassement: Math.max(0, text.length - GITLAB_CHAR_LIMIT)
  }));
}
