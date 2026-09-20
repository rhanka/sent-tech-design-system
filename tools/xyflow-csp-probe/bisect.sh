#!/usr/bin/env bash
S=/home/antoinefa/.cache-tmp/claude-1000/-home-antoinefa-src-sent-tech-design-system/fe9b0873-fc2a-40be-844a-6728d7f3f06f/scratchpad/xyflow-csp
cd "$S" || exit 1
for mm in 0 1; do for it in 0 1; do
  WITH_MINIMAP=$mm ./node_modules/.bin/vite build >/dev/null 2>&1
  out=$(PLAYWRIGHT_CORE=/home/antoinefa/src/sent-tech-design-system/node_modules/playwright-core/index.js \
    CHROMIUM_PATH=/home/antoinefa/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
    INTERACT=$it node measure.mjs 2>/dev/null)
  echo "$out" | python3 -c "
import json,sys
d=json.load(sys.stdin); p=d['pages']['index']
v=p['violations']
print(f'MiniMap=$mm interaction=$it  →  violations: {len(v)}', [x['directive'] for x in v], p['result'].get('nodes'))"
done; done
