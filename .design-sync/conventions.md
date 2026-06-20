# Sentropic Design System — Conventions d'utilisation

## Fondations

Le DS Sentropic expose **209 composants React** via `@sentropic/design-system-react`. Tous les composants sont wrappés dans un `ThemeProvider` (`data-st-theme="sent-tech"` par défaut).

## Thèmes disponibles

Trois thèmes sont publiés dans `@sentropic/design-system-themes` :
- `sent-tech` — thème principal (défaut)
- `forge` — variante identité Forge
- `entropic` — variante identité Entropic

Usage : `<ThemeProvider theme="sent-tech">…</ThemeProvider>`

## Tokens CSS

Toutes les valeurs de design sont exposées via des variables CSS `--st-*` :
- `--st-semantic-*` — couleurs sémantiques (surface, border, feedback)
- `--st-foundation-*` — échelle de base (couleurs, typographie, espacement)
- `--st-shadow-*` — ombres

## Composants par catégorie

**Formulaires** : `Input`, `Textarea`, `Select`, `Combobox`, `DatePicker`, `FormGroup`, `Checkbox`, `Radio`, `Toggle`

**Navigation** : `Header`, `AppHeader`, `Breadcrumb`, `Tabs`, `NavSection`, `Pagination`

**Feedback** : `Alert`, `Notification`, `Badge`, `StatusDot`, `Toast`, `InlineLoading`, `Spinner`

**Mise en page** : `Card`, `Accordion`, `Collapsible`, `Modal`, `Drawer`, `AppShell`

**Données** : `KpiCard`, `Table`, `FilterPill`, `Tag`

**Dataviz** : `BarChart`, `AreaChart`, `GeoMap`, `KpiCard`, `DashboardGrid` et 40+ autres graphiques Highcharts

## Règles de composition

1. Toujours envelopper dans `ThemeProvider` pour les tokens CSS
2. Utiliser `size` (`"sm"` | `"md"` | `"lg"`) pour le calibrage uniforme
3. Utiliser `tone` (`"info"` | `"success"` | `"warning"` | `"error"`) pour le feedback sémantique
4. Les icônes sont passées en props React (`icon={<IconComponent />}`), jamais en string
