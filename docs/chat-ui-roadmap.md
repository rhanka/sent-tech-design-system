# Chat-UI roadmap pour le design system Sent Tech

Périmètre : primitives chat à ajouter au DS pour que Sentropic et les futures surfaces (panel docked, extension Chrome, embedded, VS Code) consomment des briques stables au lieu de les réinventer dans `ChatPanel.svelte` (6 107 lignes) et `ChatWidget.svelte` (3 249 lignes).

Le DS n'absorbe pas la logique produit (orchestration runtime, adapters provider, persistance, permissions outils). Il fournit les surfaces visuelles + accessibilité + tokens.

## Sources et conventions

- Référence interne Sentropic (lecture seule, ne pas modifier) :
  - `../sentropic/ui/src/lib/components/ChatPanel.svelte` — god-component, contient toute la timeline + composer + menus contexte/outils + actions message.
  - `../sentropic/ui/src/lib/components/ChatWidget.svelte` — coque (modes `floating`/`docked`/`sidepanel`), onglets `chat`/`queue`/`comments`.
  - `../sentropic/ui/src/lib/components/StreamMessage.svelte` — moteur de rendu d'une bulle assistant streamée (deltas, étapes reasoning/tool, summary, expand/collapse).
  - `../sentropic/ui/src/lib/components/DocumentSourceMenu.svelte` — picker d'attachements (fichier local + Google Drive), réutilisable.
  - `../sentropic/ui/src/lib/components/EditableInput.svelte` — éditeur markdown utilisé comme textarea du composer.
  - `../sentropic/packages/chat-core/src/runtime-messages.ts` et `runtime.ts` — modèle de données runtime côté serveur (rôles `user`/`assistant`/`system`/`tool`, statuts `pending`/`processing`/`completed`/`failed`).
  - `../sentropic/rules/design-system.md` — règles tokens/typography/boutons internes Sentropic.
- Contrat existant DS : `docs/chat-ui-contract.md` — pose le statut « experimental component boundary, stable token and runtime contracts ». Il fige déjà : (1) les tokens `component.chat.*` (user/assistant bubble, composer surface, tool-call surface) et `semantic.status.*` (pending/processing/completed/failed), (2) le `ChatRuntimeEvent` (message.delta / tool.started / permission.requested / checkpoint.requested), (3) le `ChatMessage` normalisé avec `blocks: ChatMessageBlock[]` (text / tool-call / permission), (4) les quatre modes shell `floating`/`docked`/`sidepanel`/`embedded`, (5) la séparation d'ownership (DS = primitives & tokens, chat-ui = streaming/runtime/persistance/permissions). Le contrat **n'engage aucune API de composant Svelte** tant que le refacto Sentropic n'a pas atterri. Le présent roadmap propose les composants à promouvoir une fois le refacto stabilisé.
- Carbon Design System : référence d'écart uniquement. Carbon **ne ship pas** de primitive chat (ni `ChatMessage`, ni `Composer`, ni `ToolCall`). On cite Carbon pour les briques adjacentes (`Tile`, `OverflowMenu`, `Notification`, `InlineLoading`, `Tag`).

## Inventaire Sentropic actuel

| Composant Sentropic | Rôle | Primitives DS consommées | Réinventions / dépendances locales |
|---|---|---|---|
| `ChatWidget.svelte` (3 249 l.) | Coque chat : modes `overlay`/`sidepanel`, onglets `chat`/`queue`/`comments`, header de sessions, menu sessions, raccourcis | `MenuPopover` (DS), `Toast` (via store local) | Mode handoff Chrome extension, gestion sessions, layout local (`chatWidgetLayout` store), pas de DS shell |
| `ChatPanel.svelte` (6 107 l.) | Timeline messages + composer + menus contexte/outils/modèle, comments side-mode | `MenuPopover` Sentropic, icônes `@lucide/svelte` | **Tout le reste réinventé** : message bubbles inline (`chat-user-bubble`, `chat-assistant-bubble` Tailwind), actions hover row (copy/edit/feedback/checkpoint), composer ad-hoc avec `EditableInput`, picker contexte/outils, sélecteur modèle, mention `@`, attachements |
| `StreamMessage.svelte` (1 212 l.) | Bulle assistant streamée (variantes `chat`/`job`) : aggrégation deltas, expand details (reasoning + tool calls), summary, smooth streaming, todo cards | `@lucide/svelte` (`ChevronDown`, `Loader2`), `svelte-streamdown` | Tout est local : layout, animations, expand/collapse, summary header, runtime preview |
| `DocumentSourceMenu.svelte` (122 l.) | Menu d'attachement (fichier local + Google Drive) | `@lucide/svelte` | Couplage Google Drive (provider-specific) — non promouvable tel quel |
| `EditableInput.svelte` | Éditeur markdown contenteditable utilisé par le composer | TipTap local | Pas de `Textarea` DS (richesse markdown) |
| `MenuPopover.svelte` | Popover ancré utilisé par tout le panel | Local — doublon du `MenuPopover` DS | À aligner sur la primitive DS |
| `Toast.svelte` | Toasts locaux | Local — doublon du `Toast` DS | À aligner |
| `chat-run-projection.ts` (util) | Projection des events stream en `ProjectedTimelineItem` | — | Logique pure, reste produit |
| `chat-tool-scope.ts` / `chat-steer.ts` (utils) | Permissions outils + steer en cours de stream | — | Logique pure, reste produit |

Observations clés :

1. **Aucune brique chat n'existe en DS** côté Svelte. ChatPanel a tout inline en Tailwind, ce qui rend l'évolution (theming, white-label, tokens) hors de portée du DS aujourd'hui.
2. **StreamMessage est déjà bien factorisé** côté logique : variants `chat`/`job`, mode `live`/`passive`, `finalContent` + `initialEvents`, callbacks `onTerminal`/`onStreamEvent`/`onGeneratedFile`. C'est le meilleur point de départ d'API pour un futur `ChatMessage`/`StreamingMessage` DS.
3. **Le composer est dispersé** : surface contenteditable + barre d'actions (menu + sélecteur modèle + bouton stop + bouton send). Pas un seul composant.
4. **Actions de message** (copy/edit/feedback up/down/regen/undo checkpoint) répétées entre comments et chat — bon candidat à un `MessageActions`.

## Inventaire DS Sent Tech actuel (briques chat-adjacentes déjà disponibles)

Source : `packages/components-svelte/src/lib/index.ts`.

| DS primitive existante | Équivalent dans un chat | Réutilisable tel quel ? |
|---|---|---|
| `Toast` | Notification éphémère post-action (copié, erreur send) | Oui, déjà dans le contrat DS |
| `OverflowMenu` + `Menu` + `MenuPopover` | Actions message (overflow), menus composer (contexte, outils) | Oui, à câbler |
| `EmptyState` | Thread vide / pas de session sélectionnée | Oui |
| `InlineLoading` | Indicateur « assistant réfléchit / outil en cours » | Oui — base potentielle pour `StreamCursor` |
| `IconButton` | Boutons d'action message (copy, edit, regen, thumbs) | Oui — base de `MessageActions` |
| `Tag` | Badge de statut message (`processing`, `failed`), pill de citation | Oui |
| `Tooltip` | Tooltips sur actions message | Oui |
| `Textarea` | Composer si on n'a pas besoin de markdown | Oui pour cas simple ; insuffisant pour Sentropic (markdown) |
| `Drawer` | Mode `sidepanel`/`docked` | Oui — mais shell chat dédié probable |
| `Card` | Conteneur de tool-call / citation | Oui |
| `Alert` | Bandeau d'erreur de session | Oui |
| `ProgressBar` / `ProgressIndicator` | Budget contexte, étapes streaming | Oui |
| `CopyButton` | Copy message content | Oui |
| `FileUploader` | Attachements | Oui (en remplacement partiel de `DocumentSourceMenu`) |
| `Tabs` / `ContentSwitcher` | Onglets `chat`/`queue`/`comments` du widget | Oui |

Aucune primitive **chat-spécifique** n'existe dans le DS aujourd'hui. Tout le travail est à faire.

## Gap analysis

Légende priorité : **P0** = bloque la promotion `experimental → beta` du contrat. **P1** = nécessaire dès qu'un second consommateur arrive. **P2** = nice-to-have, peut rester app-local.

| Primitive proposée | Équivalent Sentropic | Carbon le plus proche | Priorité |
|---|---|---|---|
| `ChatMessage` (rôle `user`/`assistant`/`system`/`tool`, statuts `pending`/`processing`/`completed`/`failed`, slots `avatar`/`content`/`footer`/`actions`) | bloc inline dans `ChatPanel.svelte` (`chat-user-bubble`, `chat-assistant-bubble`) | aucun équivalent Carbon (proche : `Tile`) | P0 |
| `ChatThread` (conteneur scroll, auto-scroll, séparateurs de jour sticky, `aria-live=polite` pour streaming) | `<div bind:this={listEl} on:scroll={onListScroll}>` dans ChatPanel | aucun équivalent Carbon | P0 |
| `ChatComposer` (textarea/markdown, auto-resize, raccourcis Enter/Cmd+Enter, slot `attachments`, slot `actions-left`, slot `actions-right`, bouton send intégré, état `running`/`stoppable`) | bloc `chat-composer-footer` + `EditableInput` + boutons send/stop | aucun équivalent Carbon (proche : `Textarea` + `Button`) | P0 |
| `StreamingMessage` (sous-cas de `ChatMessage` : aggrégation deltas, sections collapsibles reasoning/tool, expand/collapse, smooth streaming optionnel) | `StreamMessage.svelte` variant `chat` | aucun équivalent Carbon (proche : `InlineLoading` + `Accordion`) | P0 |
| `MessageActions` (rangée d'`IconButton` au hover : copy, edit, regen, feedback up/down, plus overflow) | `chat-message-action-button` inline dans ChatPanel | aucun (proche : `OverflowMenu` + `IconButton`) | P1 |
| `ToolCallBlock` / `ToolResultBlock` (carte expandable montrant nom outil, args JSON, statut, durée) | aggrégation de `tool_call_*` events dans StreamMessage, rendu inline en `Step` | aucun (proche : `Tile` + `Tag` + `CodeSnippet`) | P1 |
| `PermissionRequest` (carte avec choix `allow once`/`allow always`/`deny`) | bloc local dans ChatPanel (non isolé) | aucun (proche : `Notification` actionable) | P1 |
| `TypingIndicator` / `StreamCursor` (curseur de streaming, 3-dots, ou cursor caret animé respectant `prefers-reduced-motion`) | absent — Sentropic utilise `<Loader2>` icône | aucun équivalent (proche : `InlineLoading`) | P1 |
| `Citation` / `SourcePill` (puce numérotée référençant une source, hoverable) | absent — markdown brut avec `renderMarkdownWithRefs` | aucun (proche : `Tag` ou `Link` inline) | P1 |
| `MessageStatusBadge` (mappe `ChatMessageStatus` → couleur token `semantic.status.*`) | inline | `Tag` Carbon | P1 |
| `Attachment` / `AttachmentChip` (pill fichier attaché au composer/message, avec suppression) | bloc inline dans ChatPanel (sessionDocs map) | aucun (proche : `Tag` + `FileUploader`) | P1 |
| `DaySeparator` (séparateur sticky « Aujourd'hui » / date) | absent en visuel sticky, logique `isSameDay` existe pour comments | aucun | P2 |
| `ChatShell` (coque `floating`/`docked`/`sidepanel`/`embedded` avec slots `header`/`body`/`footer`) | `ChatWidget.svelte` | aucun (proche : `Drawer` + `Header`) | P2 |
| `ConversationListItem` (carte de session dans la liste) | bloc inline dans ChatWidget | aucun (proche : `StructuredList`) | P2 |

Hors périmètre DS (rappel) :

- Logique de stream (StreamHub, deltas → projection).
- Permissions outils (local tools, policy store).
- Adapters provider, mention `@`, gestion comments, checkpoints, todo runtime, Google Drive picker, sélecteur de modèle.
- VS Code agent / Chrome extension handoff.

## Plan d'implémentation proposé

Phases volontairement étroites pour pouvoir promouvoir `experimental → beta` brique par brique, sans attendre que tout Sentropic ait atterri.

### Phase 0 — Préparer le terrain (zéro nouveau composant)

1. Vérifier que les tokens `component.chat.*` et `semantic.status.*` listés dans `chat-ui-contract.md` sont effectivement exposés par `@sentropic/design-system-tokens` et présents dans `entropic.css`. Sinon, les ajouter (workstream tokens, hors scope code Svelte).
2. Publier un `docs/chat-ui-roadmap.md` (ce fichier) et l'ajouter à la navigation `apps/docs`.

### Phase 1 — P0 (déblocage promotion `experimental → beta`)

3. `ChatMessage` (status `experimental`) — primitive visuelle role/status, slots `avatar`/`content`/`footer`/`actions`. API inspirée des champs `role`/`status` du `ChatMessage` côté `chat-core` (cf. `runtime-messages.ts`) et du `ChatMessageBlock` du contrat. Le `content` reste un slot (Sentropic injecte `Streamdown`, d'autres consommateurs autre chose).
4. `ChatThread` (status `experimental`) — conteneur scroll + auto-scroll au bas + `aria-live=polite` paramétrable. Slot par défaut = liste de `ChatMessage`.
5. `ChatComposer` (status `experimental`) — wrapper `Textarea` (cas simple) + slots `attachments` / `actions-left` / `actions-right` + `onSubmit` + état `busy`/`stoppable` + raccourcis clavier. Le rich-editor markdown reste app-local (Sentropic garde son `EditableInput`).
6. `StreamingMessage` (status `experimental`) — sous-variante de `ChatMessage` qui accepte `streamId` + `events` + `status`. API mirror de `StreamMessage.svelte` (props `streamId`, `status`, `initialEvents`, `finalContent`, `subscriptionMode`), mais sans logique streamHub (le consommateur injecte les events via prop).

### Phase 2 — P1 (premier vrai consommateur Sentropic)

7. `MessageActions` — rangée d'`IconButton` + slot overflow. Items typés `MessageAction = { id, icon, label, variant?: 'primary'|'danger', onClick }`.
8. `ToolCallBlock` / `ToolResultBlock` — `Card` + `Tag` (statut) + `CodeSnippet` (args/result) avec expand/collapse, basé sur le `ChatMessageBlock` `type: 'tool-call'` du contrat.
9. `PermissionRequest` — basé sur `ChatMessageBlock` `type: 'permission'` du contrat. Variante `Notification` actionable.
10. `TypingIndicator` / `StreamCursor` — un petit composant unique avec prop `variant: 'dots' | 'cursor'`, respectant `prefers-reduced-motion`.
11. `Citation` / `SourcePill` — pill numérotée, hoverable, ouvrable.
12. `MessageStatusBadge` — mappe `ChatMessageStatus → Tag` couleur token `semantic.status.*`.
13. `Attachment` — pill fichier + croix suppression, taille `sm`/`md`.

### Phase 3 — P2 (deuxième consommateur ou besoin produit confirmé)

14. `DaySeparator` — séparateur sticky avec `aria-hidden` correct.
15. `ChatShell` — coque modes `floating`/`docked`/`sidepanel`/`embedded` (cf. contrat). Probablement composition de `Drawer` + `Header` + slots.
16. `ConversationListItem` — carte de session.

À chaque promotion `experimental → beta`, exiger les artifacts du **Exchange Packet** (`chat-ui-contract.md` § Exchange Packet) : package contract, theme contract, a11y matrix, runtime schema, release decision.

## Hors périmètre

Reste explicitement chez Sentropic (ou autre produit), pas dans le DS :

- StreamHub (`$lib/stores/streamHub`) et toute la projection events → timeline (`chat-run-projection.ts`).
- Permissions d'outils locaux (`localTools` store, `LocalToolPermissionRequiredError`).
- Adapters provider (OpenAI / Anthropic / Gemini), sélecteur de modèle, smooth streaming Gemini-spécifique.
- Gestion de sessions chat (CRUD, contextes, checkpoints, retry, steer).
- Comments thread (mode `comments` de ChatPanel — c'est un produit collaboratif, pas une primitive chat).
- Mention `@user`, intégration Google Drive (`DocumentSourceMenu` reste app-local tant que connecteurs sont provider-specific).
- VS Code agent profile, Chrome extension handoff (`chatwidget-handoff`).
- Logique markdown/streamdown — le DS expose un slot `content`, le consommateur choisit son renderer.

## Décisions à prendre (pour débloquer Phase 1)

1. **API `ChatMessage` : adopter verbatim la forme `ChatMessage` du `chat-ui-contract.md` (avec `blocks: ChatMessageBlock[]`) ou définir une API DS plus simple (single `content` slot + props `role`/`status`) et laisser le mapping `blocks → render` au consommateur ?** Recommandation : option 2 (DS reste visuel, le consommateur orchestre les blocks). Le `blocks` reste la lingua franca runtime entre chat-ui et le serveur, pas un contrat de slot Svelte.
2. **`StreamingMessage` : composant séparé ou variant de `ChatMessage` ?** Recommandation : variant (`<ChatMessage streaming events={...} />`), pour garder une seule API.
3. **`ChatComposer` : un seul composant ou un duo `ChatComposer` (shell) + `ChatComposerInput` (textarea/rich) ?** Recommandation : shell unique avec slot `input` pour permettre EditableInput Sentropic et Textarea simple ailleurs.
