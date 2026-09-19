// Compte les icônes de fournisseurs réellement disponibles dans les collections
// iconify candidates, et relève la licence déclarée de chaque collection.
// La licence du pack ne dit rien des droits de marque : voir le README.
const COLLECTIONS = ['logos', 'devicon', 'simple-icons', 'skill-icons'];
const PREFIXES = ['aws', 'google-cloud', 'gcp', 'azure', 'ovh', 'scaleway', 'kubernetes'];
const j = async (u) => (await fetch(u)).json();

const meta = await j('https://api.iconify.design/collections');
const out = { date: new Date().toISOString().slice(0, 10), collections: {} };
for (const prefix of COLLECTIONS) {
  const data = await j(`https://api.iconify.design/collection?prefix=${prefix}`);
  const names = new Set();
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) v.filter((x) => typeof x === 'string').forEach((x) => names.add(x));
    if (k === 'categories' && v && typeof v === 'object') Object.values(v).flat().forEach((x) => names.add(x));
  }
  const sorted = [...names].sort();
  out.collections[prefix] = {
    total: data.total,
    licence: meta[prefix]?.license ?? null,
    parFournisseur: Object.fromEntries(PREFIXES.map((p) => {
      const hits = sorted.filter((n) => n.startsWith(p));
      return [p, { nombre: hits.length, exemples: hits.slice(0, 5) }];
    }))
  };
}
console.log(JSON.stringify(out, null, 2));
