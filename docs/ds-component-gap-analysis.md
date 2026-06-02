# Gap Analysis — Composants Design System (vs DSFR & IBM Carbon)

**Date :** 2026-05-26

## a) Objectif

Identifier les composants présents dans le **DSFR** (Système de design de l'État français) et/ou **IBM Carbon** mais **absents** de notre design system Svelte, afin d'alimenter le backlog.

## b) Méthode et sources

**Source de vérité « nous » :** lecture directe du fichier
`/home/antoinefa/src/sent-tech-design-system/packages/components-svelte/src/lib/index.ts`
(chaque `export { default as X }` = un composant). Inventaire exhaustif, sans hallucination.

**Sources externes — transparence sur les accès :**

| Source | URL visée | Statut |
| --- | --- | --- |
| DSFR — page officielle composants & modèles | https://www.systeme-de-design.gouv.fr/composants-et-modeles/ | **ÉCHEC** — HTTP 403 Forbidden (le site officiel bloque les fetch automatisés ; testé plusieurs fois, plusieurs chemins) |
| DSFR — démo template.incubateur.net | https://template.incubateur.net/components | **ÉCHEC** — certificat TLS expiré |
| DSFR — Django-DSFR (miroir d'implémentation) | https://numerique-gouv.github.io/django-dsfr/components/ | **OK** — liste de composants récupérée |
| DSFR — VueDsfr (miroir d'implémentation) | https://docs.vue-ds.fr/composants/ | **OK** — liste de composants récupérée |
| DSFR — modèles (pages types) | recherche web (page officielle 403) | **Partiel** — confirmés via WebSearch : page de connexion, pages d'erreur 404/500/503, page de formulaire |
| Carbon — overview officiel | https://carbondesignsystem.com/components/overview/components/ | **ÉCHEC** — HTTP 403 / contenu tronqué |
| Carbon — source React sur GitHub | https://github.com/carbon-design-system/carbon/tree/main/packages/react/src/components | **OK** — dossiers de composants récupérés (source canonique) |
| Carbon — complément | WebSearch « Carbon components overview » | **OK** — liste confirmée |

> **Note d'honnêteté :** les sites officiels DSFR et Carbon renvoient tous deux 403 aux fetch automatisés. La liste DSFR provient donc de **deux miroirs d'implémentation concordants** (Django-DSFR + VueDsfr) ; la liste Carbon provient du **dépôt source GitHub officiel** (faisant autorité, mais incluant des sous-composants et primitives de layout qui ne sont pas tous des « composants » au sens catalogue). Les modèles/pages-types DSFR n'ont pu être listés exhaustivement (site 403) — seuls les plus connus, confirmés par recherche, figurent ici. Aucun composant n'a été inventé.

## c0) Mise à jour 2026-06-01

Ce document reste le snapshot de cadrage du 2026-05-26. État courant vérifié sur `main` :

- Le package Svelte exporte 81 symboles UI, dont `ThemeProvider`; le catalogue docs couvre 80 composants publics hors primitive infra.
- Les gaps P1 initiaux `Footer` et `Tile` sont fermés : composants exportés, pages docs dédiées et entrées catalogue présentes.
- Les gaps P2 `SkipLink`, `LanguageSelector`, `Quote`, `Highlight` et `Notification inline / actionable` sont également fermés.
- Le backlog résiduel utile concerne surtout `Table of contents`, `Back to top`, `Transcription`, `Display settings`, `Media content` et les patterns composites DSFR, selon besoin produit.

### Nos composants au snapshot initial (source de vérité — 81 composants exportés)

Accordion, Alert, AreaChart, AspectRatio, Badge, BarChart, Breadcrumb, Button, Card, ChatMessage, ChatComposer, ChatThread, MessageActions, StreamingMessage, MessageStatusBadge, Checkbox, CodeSnippet, Combobox, ContentSwitcher, CopyButton, DataTable, DatePicker, DonutChart, Drawer, Dropdown, EmptyState, FileUploader, Footer, ForceGraph, Form, FormGroup, Header, Highlight, IconButton, InlineLoading, Input, LanguageSelector, LineChart, Link, LoadingState, Menu, MenuPopover, MenuTriggerButton, Modal, Notification, MultiSelect, NumberInput, OrderedList, OverflowMenu, Pagination, PaginationNav, PasswordInput, Popover, ProgressBar, ProgressIndicator, Quote, Radio, ScatterPlot, Search, Select, SideNav, SkeletonText, SkipLink, Slider, Sparkline, StackedBarChart, StructuredList, Switch, Table, Tabs, Tag, ThemeProvider, Textarea, Tile, TileGroup, Toast, Toggle, Toggletip, Tooltip, TreeView, UnorderedList.

## c) Tableau gap

Légende : ✅ = présent / oui ; ❌ = absent / non ; ~ = couvert partiellement ou par un autre composant.

### Manques réels au snapshot initial (présent chez DSFR et/ou Carbon, absent chez nous)

| Composant | Présent chez nous ? | DSFR ? | Carbon ? | Recommandation backlog |
| --- | --- | --- | --- | --- |
| **Footer / Pied de page** | ❌ | ✅ (Pied de page) | ✅ (UI shell footer / PageHeader famille) | **P1** — présent DSFR + structurel partout ; on a Header mais pas Footer. Brique de base d'app shell. |
| **Tile (tuile individuelle)** | ~ (on a `TileGroup`) | ✅ (Tuile) | ✅ (Tile, RadioTile) | **P1** — présent dans les deux. On expose seulement le groupe ; manque la tuile cliquable/sélectionnable unitaire (clickable/selectable tile). |
| **Tree view / Arborescence** | ❌ | ❌ | ✅ (TreeView) | **P2** — Carbon seul, mais composant de navigation/hiérarchie courant et non trivial. |
| **Notification (inline / toast système)** | ✅ | ✅ (Alertes/notices) | ✅ (Notification : inline, toast, actionable) | **Couvré** — composant dédié ajouté (`Notification`) avec tonalités, actions et option de fermeture. |
| **Skip links / Liens d'évitement** | ❌ | ✅ (Liens d'évitement) | ~ (recommandé, pas de composant dédié) | **P2** — présent DSFR ; brique d'accessibilité importante (a11y) souvent oubliée. |
| **Stepper / Indicateur d'étapes (horizontal)** | ~ (on a `ProgressIndicator`) | ✅ (Indicateur d'étapes) | ✅ (ProgressIndicator) | **P3** — probablement déjà couvert par notre `ProgressIndicator` ; à vérifier (variante orientée « étapes de formulaire »). |
| **Quote / Citation** | ❌ | ✅ (Citation) | ❌ | **P2** — présent DSFR (composant éditorial blockquote stylé). |
| **Highlight / Mise en avant + Mise en exergue** | ❌ | ✅ (Mise en avant, Mise en exergue) | ❌ | **P2** — composants éditoriaux DSFR (callout / encart). Utile pour contenus type blog/doc. |
| **Table of contents / Sommaire** | ❌ | ✅ (Sommaire) | ❌ | **P3** — pattern éditorial DSFR (sommaire d'ancres de page). |
| **Back to top / Retour en haut** | ❌ | ✅ (Retour en haut de page) | ❌ | **P3** — micro-composant utilitaire DSFR. |
| **Language selector / Sélecteur de langue** | ❌ | ✅ (Sélecteur de langue) | ❌ | **P2** — pertinent pour produit i18n / bilingue (cf. besoins Sent Tech). |
| **Consent manager / Gestionnaire de consentement** | ❌ | ✅ (Gestionnaire de consentement) | ❌ | **P3** — composite RGPD spécifique secteur public ; pattern plus que composant. |
| **Newsletter & réseaux sociaux / Infolettre** | ❌ | ✅ (Lettre d'information et réseaux sociaux) | ❌ | **P3** — pattern composite éditorial DSFR. |
| **Transcription** | ❌ | ✅ (Transcription) | ❌ | **P3** — composant a11y média DSFR (transcription audio/vidéo dépliable). |
| **Display settings / Paramètres d'affichage** | ❌ | ✅ (Paramètres d'affichage) | ❌ | **P3** — sélecteur de thème/contraste DSFR ; partiellement couvert par notre `ThemeProvider` (mais pas l'UI). |
| **Media content / Contenu média** | ❌ | ✅ (Contenu média) | ❌ | **P3** — wrapper figure/légende DSFR. |
| **FranceConnect button** | ❌ | ✅ (Bouton FranceConnect) | ❌ | **Ignoré (hors scope)** — spécifique État français, non pertinent pour Sent Tech. |
| **Contained list / Liste contenue** | ~ (on a `StructuredList`, `UnorderedList`) | ❌ | ✅ (ContainedList, ListItem, OrderedList) | **P3** — Carbon seul ; vraisemblablement couvert par nos listes existantes. À vérifier. |
| **Ordered list / Liste ordonnée** | ❌ (on a `UnorderedList`) | ❌ | ✅ (OrderedList) | **P3** — Carbon seul ; complément trivial de `UnorderedList`. |
| **Loading (spinner plein)** | ~ (on a `LoadingState`, `InlineLoading`) | ❌ | ✅ (Loading) | **P3** — probablement couvert par `LoadingState`. À vérifier. |
| **Layout primitives (Grid / FlexGrid / Stack / Layer)** | ❌ | ❌ | ✅ (Grid, FlexGrid, Layer, Stack) | **P3** — Carbon seul ; primitives de layout, pas des composants UI au sens strict. À arbitrer selon la stratégie tokens/layout du DS. |
| **Modèle : Page de connexion** | ❌ | ✅ (modèle) | ❌ | **P3** — modèle/pattern composite (login), pas un composant atomique. |
| **Modèle : Pages d'erreur (404/500/503)** | ~ (on a `EmptyState`) | ✅ (modèle) | ❌ | **P3** — pattern ; partiellement réalisable avec `EmptyState`. |
| **Modèle : Page de formulaire** | ~ (on a `Form`, `FormGroup`) | ✅ (modèle) | ❌ | **P3** — pattern composite, couvert par nos primitives de formulaire. |

### Couverture confirmée (présents chez nous ET référence — pas un gap)

Accordion, Alert, Badge, Breadcrumb, Button, Card, Checkbox, CodeSnippet, Combobox, ContentSwitcher, CopyButton, DataTable, DatePicker, Drawer (≈ DSFR menu latéral / overlay), Dropdown / Listes déroulantes, FileUploader / Téléversement, Form, FormGroup, Header / En-tête, IconButton, InlineLoading, Input / Champ de saisie, Link / Lien, Menu, Modal / Modale, MultiSelect, NumberInput, OverflowMenu, Pagination, PaginationNav, PasswordInput, Popover, ProgressBar, ProgressIndicator, Radio / Bouton radio, Search / Recherche, Select / Sélecteur, SideNav / Menu latéral, SkeletonText, Slider / Curseur, StructuredList, Switch / Interrupteur, Table / Tableau, Tabs / Onglets, Tag, Textarea, Toggle, Toggletip, Tooltip / Infobulle, UnorderedList.

**En plus de la référence (différenciateurs « maison ») :** AreaChart, BarChart, LineChart, Notification, Sparkline (data-viz), et toute la famille **Chat** (ChatMessage, ChatComposer, ChatThread, MessageActions, StreamingMessage, MessageStatusBadge) + AspectRatio, EmptyState, ThemeProvider. Ni DSFR ni Carbon ne couvrent ces composants — atouts produit à conserver.

## d) Backlog proposé au snapshot initial (trié P1 > P2 > P3)

### P1 — présent dans DSFR **et** Carbon, manque réel
1. **Footer / Pied de page** — brique d'app shell manquante (on a Header sans Footer).
2. **Tile (tuile cliquable/sélectionnable unitaire)** — on n'expose que `TileGroup` ; ajouter la tuile atomique (clickable + selectable/radio tile).

### P2 — présent dans **un seul** des deux référentiels, manque fonctionnel
1. **Tree view / Arborescence** — navigation hiérarchique (Carbon).
2. **Skip links / Liens d'évitement** — accessibilité (DSFR).
3. **Language selector / Sélecteur de langue** — utile i18n produit (DSFR).
4. **Quote / Citation** — éditorial (DSFR).
5. **Highlight (Mise en avant + Mise en exergue)** — callouts éditoriaux (DSFR).

### P3 — modèle/pattern composite, primitive, ou probablement déjà couvert (à vérifier)
6. **Stepper « étapes de formulaire »** — vérifier couverture par `ProgressIndicator`.
7. **Table of contents / Sommaire** (DSFR).
8. **Back to top / Retour en haut** (DSFR).
9. **Transcription** — a11y média (DSFR).
10. **Display settings / Paramètres d'affichage** — UI de thème par-dessus `ThemeProvider` (DSFR).
11. **Media content / Contenu média** (DSFR).
12. **Consent manager / Gestionnaire de consentement** — composite RGPD (DSFR).
13. **Newsletter & réseaux sociaux** — composite éditorial (DSFR).
14. **OrderedList** — complément trivial de `UnorderedList` (Carbon).
15. **Contained list / ListItem** — vérifier couverture par `StructuredList` (Carbon).
16. **Loading (spinner plein)** — vérifier couverture par `LoadingState` (Carbon).
17. **Layout primitives (Grid / FlexGrid / Stack / Layer)** — arbitrage stratégique (Carbon).
18. **Modèles DSFR** : page de connexion, pages d'erreur, page de formulaire — patterns, pas composants atomiques.

**Hors scope :** Bouton FranceConnect (spécifique État français).
