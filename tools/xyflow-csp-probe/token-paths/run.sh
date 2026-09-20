#!/usr/bin/env bash
# Mesure les cinq façons de porter un jeton jusqu'à un composant Svelte,
# sous CSP stricte. Lancer depuis ce dossier, avec les dépendances du parent.
set -u
for v in prop-composant ancetre-directive classe cssom prop-composant-svg; do
  VARIANTE=$v ./node_modules/.bin/vite build >/dev/null 2>&1
  VARIANTE=$v node ../measure.mjs 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin); p=d['pages']['index']; r=p['result']
print(f\"{'$v':22s} violations={len(p['violations'])}  wrapper={r.get('wrappers')}  fond={r.get('fondApplique')}\")"
done
