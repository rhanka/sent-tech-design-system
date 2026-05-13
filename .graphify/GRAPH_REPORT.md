# Graph Report - .  (2026-05-13)

## Corpus Check
- Corpus is ~26,691 words - fits in a single context window. You may not need a graph.

## Summary
- 120 nodes · 115 edges · 6 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output


## Input Scope
- Requested: auto
- Resolved: committed (source: cli)
- Included files: 84 · Candidates: 104
- Excluded: 0 untracked · 5425 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `7045323`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Sent Tech Design System` - 6 edges
2. `Forge low-coupling integration` - 6 edges
3. `npm Trusted Publishing release` - 6 edges
4. `@sent-tech/themes` - 5 edges
5. `getOrderedWorkspaces()` - 4 edges
6. `run()` - 4 edges
7. `White-label runtime theming` - 4 edges
8. `Entropic chat refactor dependency` - 4 edges
9. `Component TDD verification` - 4 edges
10. `runWorkspaceScript()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Foundation semantic component tokens` --conceptually_related_to--> `@sent-tech/themes`  [INFERRED]
  PLAN.md → README.md
- `sentech-forge needs` --references--> `Forge low-coupling integration`  [INFERRED]
  PLAN.md → docs/integration/forge-low-coupling.md
- `Token-first architecture` --conceptually_related_to--> `@sent-tech/tokens`  [INFERRED]
  PLAN.md → README.md
- `Make or buy strategy` --conceptually_related_to--> `External design-system adapters`  [INFERRED]
  PLAN.md → docs/superpowers/specs/2026-05-05-sent-tech-design-system-design.md
- `White-label runtime theming` --conceptually_related_to--> `@sent-tech/themes`  [EXTRACTED]
  docs/superpowers/specs/2026-05-05-sent-tech-design-system-design.md → README.md

## Hyperedges (group relationships)
- **Sent Tech package model** — readme_tokens_package, readme_themes_package, readme_components_svelte_package, readme_docs_app [EXTRACTED 0.95]
- **Forge low-coupling path** — forge_vendor_copy_css, forge_theme_scope_attribute, forge_compatibility_bridge, forge_component_pilot [EXTRACTED 0.95]
- **Chat contract surface** — chat_contract_entropic_refactor, chat_contract_modes, chat_contract_runtime_events, chat_contract_token_groups [EXTRACTED 0.95]
- **Component Catalog V1 slices** — catalog_forms_slice, catalog_overlay_feedback_slice, catalog_data_navigation_slice [EXTRACTED 0.90]
- **Trusted publishing release flow** — release_trusted_publishing, release_pack_smoke, workflow_release_guard, workflow_post_publish_check [EXTRACTED 0.92]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (19): Forge CSS compatibility bridge, Forge component pilot, Forge low-coupling integration, Forge theme scope attribute, Forge vendor-copy CSS, Foundation semantic component tokens, sentech-forge needs, Token-first architecture (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (17): Component API principles, Data navigation slice, Forms component slice, Overlay and feedback slice, Component TDD verification, Entropic chat refactor dependency, Chat shell modes, Chat runtime events (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.28
Nodes (2): compileTheme(), compileThemeStyleTag()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (5): getOrderedWorkspaces(), main(), orderWorkspaces(), readJson(), runWorkspaceScript()

### Community 5 - "Community 5"
Cohesion: 0.46
Nodes (6): assert(), installTarballs(), listTarball(), packWorkspace(), run(), verifyTarball()

### Community 8 - "Community 8"
Cohesion: 0.43
Nodes (2): flattenTokens(), toCssVariables()

## Knowledge Gaps
- **13 isolated node(s):** `Carbon-like bilingual docs app`, `Public Repository Safety`, `sentech-forge needs`, `top-ai app needs`, `Design system quality gate` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 3`** (2 nodes): `compileTheme()`, `compileThemeStyleTag()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `flattenTokens()`, `toCssVariables()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@sent-tech/themes` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `White-label runtime theming` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `Carbon-like bilingual docs app`, `Public Repository Safety`, `sentech-forge needs` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._