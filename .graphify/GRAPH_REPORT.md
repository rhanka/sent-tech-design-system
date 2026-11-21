# Graph Report - .  (2026-11-21)

## Corpus Check
- Large corpus: 5408 files · ~4,792,078 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 33109 nodes · 59729 edges · 0 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 31327 · imports: 8922 · imports_from: 6440 · re_exports: 5460 · calls: 4292 · method: 3243 · references: 23 · implements: 12 · conceptually_related_to: 9 · rationale_for: 1


## Input Scope
- Requested: tracked
- Resolved: tracked (source: cli)
- Included files: 5408 · Candidates: 7116
- Excluded: 12472 untracked · 80679 ignored · 21 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `5f5b81c`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Hyperedges (group relationships)
- **Sent Tech package model** — readme_tokens_package, readme_themes_package, readme_components_svelte_package, readme_docs_app [EXTRACTED 0.95]
- **Forge low-coupling path** — forge_vendor_copy_css, forge_theme_scope_attribute, forge_compatibility_bridge, forge_component_pilot [EXTRACTED 0.95]
- **Chat contract surface** — chat_contract_entropic_refactor, chat_contract_modes, chat_contract_runtime_events, chat_contract_token_groups [EXTRACTED 0.95]
- **Component Catalog V1 slices** — catalog_forms_slice, catalog_overlay_feedback_slice, catalog_data_navigation_slice [EXTRACTED 0.90]
- **Trusted publishing release flow** — release_trusted_publishing, release_pack_smoke, workflow_release_guard, workflow_post_publish_check [EXTRACTED 0.92]

## Communities

## Knowledge Gaps
- **12485 isolated node(s):** `Linked`, `Linker`, `LINKER_OPTIONS`, `Visitor`, `buildDir` (+12480 more)
  These have ≤1 connection - possible missing edges or undocumented components.