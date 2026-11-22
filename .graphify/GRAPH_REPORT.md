# Graph Report - .  (2026-11-22)

## Corpus Check
- 88 files · ~79 776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 304 nodes · 393 edges · 16 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 223 · imports_from: 74 · calls: 47 · imports: 17 · re_exports: 16 · references: 11 · conceptually_related_to: 3 · implements: 2


## Input Scope
- Requested: committed
- Resolved: committed (source: cli)
- Included files: 88 · Candidates: 7165
- Excluded: 3 untracked · 79582 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `f5e6672`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `createComponent()` - 21 edges
2. `distFilesRecursiveLazy()` - 7 edges
3. `TenantTheme` - 6 edges
4. `distFilesLazy()` - 6 edges
5. `Elements 0.3.0` - 6 edges
6. `compileTheme()` - 5 edges
7. `getOrderedWorkspaces()` - 5 edges
8. `compileThemeWithModes()` - 4 edges
9. `flattenTokens()` - 4 edges
10. `toCssVariables()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Elements 0.3.0` --references--> `Review Core 0.1.2 (DS-7)`  [EXTRACTED]
  docs/release.md → packages/review-core/README.md
- `Design system quality gate` --conceptually_related_to--> `Component TDD verification`  [INFERRED]
  docs/superpowers/specs/2026-05-05-sent-tech-design-system-design.md → docs/superpowers/specs/2026-05-06-component-catalog-v1-design.md
- `Component API principles` --conceptually_related_to--> `White-label runtime theming`  [EXTRACTED]
  docs/superpowers/specs/2026-05-06-component-catalog-v1-design.md → docs/superpowers/specs/2026-05-05-sent-tech-design-system-design.md
- `Data navigation slice` --implements--> `Component API principles`  [EXTRACTED]
  docs/superpowers/specs/2026-05-06-data-navigation-catalog-design.md → docs/superpowers/specs/2026-05-06-component-catalog-v1-design.md
- `Data navigation slice` --references--> `Component TDD verification`  [EXTRACTED]
  docs/superpowers/specs/2026-05-06-data-navigation-catalog-design.md → docs/superpowers/specs/2026-05-06-component-catalog-v1-design.md

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (1): set

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (39): angularComponentFiles(), angularManifest, assert(), datavizAngularLibFiles(), datavizAngularManifest, datavizCoreFiles(), datavizReactLibFiles(), datavizReactManifest (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (41): AccordionInput, accordionOf(), AlertInput, alertOf(), BadgeInput, badgeOf(), BreadcrumbInput, breadcrumbOf() (+33 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (6): base, selector, options, action, content, trigger

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (22): compileTheme(), CompileThemeOptions, compileThemeStyleTag(), compileThemeWithModes(), component, flattenTokens(), toCssVariables(), TokenTree (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (2): body, trigger

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (7): defaultRoot, dependencyFields, getOrderedWorkspaces(), main(), orderWorkspaces(), readJson(), runWorkspaceScript()

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (10): Component API principles, Data navigation slice, Forms component slice, Overlay and feedback slice, Component TDD verification, Chat UI incubation, External design-system adapters, Design system quality gate (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (7): BPMN element and mount exports, FA-D3 Review Layer in Focus Kit, Focus static artifact kit, Elements Trusted Publishing, Elements 0.3.0, TimeSeriesChart, Review Core 0.1.2 (DS-7)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (4): DossierReviewMode, DossierReviewMount, DossierReviewOptions, liveByHost

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (2): copy, Locale

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (3): cssDir, root, themes

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (2): DOCUMENTED_CSP, KNOWN_CSP_DEVIATIONS

### Community 14 - "Community 14"
Cohesion: 1.00
Nodes (2): asDiagnostic(), renderBpmn()

### Community 15 - "Community 15"
Cohesion: 1.00
Nodes (1): st

### Community 24 - "Community 24"
Cohesion: 1.00
Nodes (1): Forge relay prompt

## Knowledge Gaps
- **80 isolated node(s):** `Locale`, `copy`, `st`, `DOCUMENTED_CSP`, `KNOWN_CSP_DEVIATIONS` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 0`** (1 nodes): `set`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `body`, `trigger`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `copy`, `Locale`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `DOCUMENTED_CSP`, `KNOWN_CSP_DEVIATIONS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `asDiagnostic()`, `renderBpmn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `st`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `Forge relay prompt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createComponent()` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `Locale`, `copy`, `st` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03773584905660377 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06659619450317125 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06968641114982578 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06585365853658537 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13636363636363635 - nodes in this community are weakly interconnected._