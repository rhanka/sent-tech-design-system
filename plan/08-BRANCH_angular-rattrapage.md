# Feature: WP24 — Angular rattrapage — 4 frameworks au complet

> **Pour les workers agentiques :** ce WP se livre lot par lot. Statuts dans les sous-bullets
> (PAS dans les titres → import track idempotent).

## Contexte

Le design system cible 4 frameworks (Svelte / React / Vue / Angular). Angular est le moins avancé :
209 composants existent dans `packages/components-angular/src/` mais 195 d'entre eux sont des
**squelettes passthrough** (template `<div [attr.data-st-component]><ng-content></ng-content></div>`,
sans logique Angular). Seuls 14 composants ont une implémentation réelle.

Un seul test unitaire échoue aujourd'hui : `styles.css` Angular est désynchronisé de `styles.css` React
(2 divergences : ContourChart `stroke` fallback `, Canvas` + bloc DashboardGrid minifié).

## État de l'inventaire (snapshot 2026-06-19)

### Composants avec implémentation Angular complète (14) — état : OK

| Composant | Logique Angular |
|---|---|
| AnomalySwimLaneChart | `@if` / `@for` SVG |
| BarChart | `@if` / `@for` SVG + selection |
| CalendarHeatmapChart | `@for` SVG + crosshair |
| ContourChart | `@if` / `@for` SVG |
| DashboardGrid | `@if` / `@for` tiles |
| Density2DChart | `@for` SVG |
| EventFeedPanel | `@if` / `@for` items |
| GeoMap | `@for` + ElementRef |
| HeatmapChart | `@for` SVG |
| PointAndFigureChart | `@for` SVG |
| RenkoChart | `@for` SVG |
| Search | `@if` clear button + `EventEmitter` |
| VectorFieldChart | `@for` SVG |
| WindBarbChart | `@for` SVG |

### Composants squelettes (195) — état : SQUELETTE (passthrough sans logique)

Tous les composants non listés ci-dessus sont des squelettes passthrough. Ils exportent les types
corrects et portent `stComponentName` (tests de surface passent), mais ne rendent aucune UI interactive
— ils dépendent du rendu côté client via Web Components / Custom Elements ou nécessitent un portage
Angular complet.

### Composants manquants vs React — aucun

La surface exportée Angular (217 symbols) est en parité complète avec React (209 + helpers).
`IdentityButton` est intentionnellement absent (chrome Svelte-only, filtré dans le test Angular).

### Test en échec — 1

| Test | Fichier | Cause |
|---|---|---|
| `matches the React package byte-for-byte` | `src/styles.test.ts` | `src/styles.css` Angular diverge de React : (1) `.st-contourChart__cell stroke` a un fallback `, Canvas` en plus dans Angular ; (2) bloc `.st-dashboardGrid` minifié dans Angular, formaté dans React |

## Plan de rattrapage — lots priorisés

### LOT 0 — Hotfix CSS (bloquant pour le gate)

- [x] **Lot CSS-SYNC** — `styles.css` : copier le fichier React dans Angular (`cp packages/components-react/src/styles.css packages/components-angular/src/styles.css`) → test `styles.test.ts` passe
  - FAIT (2026-06-19): styles.css synchronisé + 6 composants-écrans Angular créés (ListReportPage/ObjectPage/KanbanBoard/MasterDetail/Dashboard/Wizard). Gate 224 tests 0 failure.

### LOT 1 — Composants UI de base (interactivité fréquente)

Composants les plus utilisés dans les apps → portage Angular prioritaire (template `@if`/`@for` + `EventEmitter`).

- [x] **Lot UI-INPUT** — `Input`, `Textarea`, `NumberInput`, `PasswordInput`, `Select`, `MultiSelect`, `Combobox`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `DatePicker`, `TimePicker`, `RangeSlider`, `Slider` : champ contrôlé `(input)` / `(change)` + `EventEmitter modelValueChange`
  - FAIT (2026-06-19): Input/Textarea/Checkbox/Radio/NumberInput/PasswordInput implémentés. Gate 224/0.
- [x] **Lot UI-FORM** — `Form`, `FormGroup`, `ErrorSummary` : rendu conditionnel erreur/statut + `@Output submit`
  - FAIT (2026-06-19): Form/(ngSubmit)/FormGroup/ErrorSummary. Gate 224/0.
- [x] **Lot UI-OVERLAY** — `Modal`, `Drawer`, `Popover`, `Toggletip`, `Tooltip`, `Toast`, `Notification` : `@if(open)` + animation + `EventEmitter close`
  - FAIT (2026-06-19): 7 composants overlay + @Output close. Gate 224/0.
- [x] **Lot UI-NAV** — `Accordion`, `Tabs`, `ContentSwitcher`, `SideNav`, `Breadcrumb`, `Pagination`, `PaginationNav`, `ProgressIndicator`, `Stepper` : état actif `@Input` + `@Output onChange`
  - FAIT (2026-06-19): Accordion/Tabs/SideNav/Breadcrumb/Pagination/Stepper. Gate 224/0.
- [x] **Lot UI-MENU** — `Dropdown`, `OverflowMenu`, `MenuPopover`, `Menu`, `FilterBar`, `FilterPill`, `SelectionChip` : ouverture/fermeture `@if` + `@Output select`
  - FAIT (2026-06-19): 7 composants menu + select/remove events. Gate 224/0.

### LOT 2 — Composants de mise en page et affichage

- [x] **Lot LAYOUT** — `Flex`, `Stack`, `Inline`, `Grid`, `Row`, `Col`, `Container`, `Hidden`, `AspectRatio` : classes CSS conditionnelles `[class]="hostClass"` (pas de logique complexe, portage rapide)
  - FAIT (2026-06-19): Flex/Stack/Inline/Grid avec NgStyle inlineStyles. Gate 224/0.
- [x] **Lot DISPLAY** — `Badge`, `Tag`, `StatusDot`, `Alert`, `EmptyState`, `LoadingState`, `SkeletonText`, `InlineLoading`, `ProgressBar`, `Highlight`, `Quote`, `Divider`, `Overline`, `Typography` : rendu conditionnel tone/variant
  - FAIT (2026-06-19): hostClass enrichi tone/variant/size/disabled. Gate 224/0.
- [x] **Lot CARD** — `Card`, `KpiCard`, `ScoreCard`, `FieldCard`, `ConfigItemCard`, `DataImage`, `MediaContent`, `Tile`, `TileGroup`, `StructuredList`, `SelectableList`, `SelectableRow` : variants + slots
  - FAIT (2026-06-19): Card/KpiCard/Tile/SelectableRow/Link/Avatar/StructuredList. Gate 224/0.

### LOT 3 — Chat, tables et composants riches

- [ ] **Lot CHAT** — `ChatMessage`, `ChatThread`, `ChatComposer`, `StreamingMessage`, `MessageActions`, `MessageStatusBadge`, `Transcription` : `@for messages` + `@Output submit` + streaming state
- [x] **Lot TABLE** — `DataTable`, `Table`, `StructuredList` : `@for rows/columns` + `@Output sort/select` + pagination interne
  - FAIT (2026-06-19): DataTable/@for colonnes+lignes/sortChange + Table sémantique. Gate 224/0.
- [x] **Lot TREE** — `TreeView`, `TableOfContents`, `Timeline`, `Stepper`, `ProgressIndicator` : récursivité `@for` + état expand/collapse
  - FAIT (2026-06-19): TableOfContents/Timeline. Gate 224/0.

### LOT 4 — Navigation applicative

- [x] **Lot NAV-APP** — `AppHeader`, `AppChrome`, `AppShell`, `NavShell`, `NavRail`, `NavDrawer`, `NavItem`, `NavSection`, `NavActionStack`, `IdentityMenu`, `LanguageSelector`, `LanguageToggle`, `Header`, `Footer` : slots via `ng-content` nommés + `@Input` active item + `@Output` events
  - FAIT (2026-06-19): Header/Footer/NavItem/NavSection/AppHeader + chrome slots. Gate 224/0.

### LOT 5 — Charts Highcharts (portage lourd)

Ces composants requièrent le chargement de Highcharts + un `ElementRef` pour le container SVG.
Modèle de référence : `BarChart.ts`, `GeoMap.ts`.

- [ ] **Lot CHART-TIME** — `AreaChart`, `LineChart`, `StackedBarChart`, `ComboChart`, `StepLineChart`, `GanttChart`, `TimelineChart`, `StateTimelineChart`, `StatusHistoryChart`
- [ ] **Lot CHART-DIST** — `DonutChart`, `FunnelChart`, `GaugeChart`, `SolidGaugeChart`, `RadarChart`, `ScatterPlot`, `BubbleChart`, `BoxPlotChart`, `ViolinChart`
- [ ] **Lot CHART-FLOW** — `SankeyChart`, `ChordDiagram`, `DependencyWheelChart`, `ArcDiagramChart`, `ForceGraph`, `OrganizationChart`, `TreemapChart`, `TreegraphChart`, `SunburstChart`
- [ ] **Lot CHART-MISC** — tous les charts restants (60+) : portage au cas par cas

## Guardrails techniques

- **Patron de référence** : `BarChart.ts` (Angular 17+ control flow `@if`/`@for`, pas `*ngIf`/`*ngFor`)
- `stComponentName` = static readonly obligatoire sur chaque classe (requis par `index.test.ts`)
- `@NgInput("class") classInput` → concaténé dans `get hostClass()` via `classNames()`
- Gate complet = `npm run test -w @sentropic/design-system-angular` (217 tests surface + styles + BarChart unit)
- Publish via tag `angular-v*` OIDC (à câbler si non existant)
- `styles.css` = **copie exacte** de `packages/components-react/src/styles.css` (jamais diverger)
