#!/usr/bin/env bash
# Mesure les façons de porter un jeton jusqu'à un composant Svelte, sous CSP stricte.
# Dépendances : celles du dossier parent (cd .. && npm install).
# Pilote : PLAYWRIGHT_CORE (module playwright-core) et CHROMIUM_PATH (binaire), comme les autres sondes.
# Sortie : une ligne JSON par variante, au format de evidence/*-chemins-jeton*.jsonl.
set -u
cd "$(dirname "$0")"
VITE=../node_modules/.bin/vite
for v in prop-composant ancetre-directive classe cssom prop-composant-svg prop-composant-svg-css svg-temoin-sans-jeton; do
  VARIANTE=$v "$VITE" build >/dev/null 2>&1 || { echo "{\"variante\": \"$v\", \"erreur\": \"build\"}"; continue; }
  DIST="$PWD/dist/" node ../measure.mjs 2>/dev/null | VARIANTE=$v python3 -c "
import json, os, sys
d = json.load(sys.stdin); p = d['pages']['index']; r = p['result']
print(json.dumps({'variante': os.environ['VARIANTE'], 'navigateur': d['browser'],
  'violations': len(p['violations']), 'directives': [x['directive'] for x in p['violations']],
  'wrappers': r.get('wrappers'), 'gDansSvg': r.get('gDansSvg'), 'fondApplique': r.get('fondApplique'),
  'lectureAnterieureSvg': r.get('lectureAnterieureSvg'), 'varSurG': r.get('varSurG'),
  'attributStyleG': r.get('attributStyleG'), 'varSurRect': r.get('varSurRect')}, ensure_ascii=False))"
done
# Rendu serveur des idiomes A et E : la sortie HTML porte-t-elle un attribut style littéral ?
for v in prop-composant prop-composant-svg; do
  VARIANTE=$v "$VITE" build --ssr src/ssr-entry.js --outDir dist-ssr >/dev/null 2>&1 || { echo "{\"variante\": \"$v\", \"ssr\": \"erreur build\"}"; continue; }
  VARIANTE=$v node --input-type=module -e "
const { html } = await import('./dist-ssr/ssr-entry.js');
const h = html();
console.log(JSON.stringify({ variante: process.env.VARIANTE, ssr: true, attributsStyle: [...h.matchAll(/style=\"([^\"]*)\"/g)].map((m) => m[1]), html: h }));"
done
rm -rf dist-ssr
