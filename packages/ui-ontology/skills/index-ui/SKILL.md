---
name: index-ui
description: Reserved DS skill skeleton for indexing application UI with ui@1. Extraction is not implemented in L0.
---

# Index UI (L0 skeleton)

The DS owns this skill and the ui@1 profile. Each application owns its instances;
the DS catalog is producer `ds-catalog`, applications are `app-<appId>`.

L0 supports profile integrity checks only:

```sh
npm run check -w @sentropic/ui-ontology
```

Extraction passes, fragments, manifests, installation and query integration are
later lots. Do not emit empty fragments or claim indexing succeeded. The planned
fragment layout is `generated/ui@1/<producerId>/fragments/<fragmentSlug>.json`,
with per-producer and top-level manifests. Catalog registration remains gated.
