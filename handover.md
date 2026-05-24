# Handover prompt for Claude

Tu reprends une session sur le repo `/home/antoinefa/src/sent-tech-design-system`, branche `main`.

Ton role: poursuivre proprement le travail sur le design system Sent Tech, sa documentation publique et son alignement avec les autres surfaces Sent Tech. Ne repars pas de zero. Lis ce fichier, puis verifie rapidement l'etat local avant toute action.

## Regles de collaboration avec l'utilisateur

- Reponds en francais.
- Le reporting attendu par l'utilisateur doit etre en 3 sections separees et aerrees (strict):
  - `Fait`
  - `A faire`
  - `Attendus`
  - Format obligatoire en multi-WP: chaque entrée de rapport doit être reprise sous forme de 3 lignes (`WP4`, `WP7`, `WP8`) dans chaque section.
  - Exemple attendu:
    - `Fait: WP4 — ...`
    - `Fait: WP7 — ...`
    - `Fait: WP8 — ...`
- Ne compacte pas plusieurs tracks dans un seul paragraphe. Separe clairement:
  - docs/design-system
  - harmonisation headers inter-sites
  - rattrapage Sentropic
  - verification/deploiement
- L'utilisateur veut des recommandations actionnables, pas des formulations floues.
- Ne sois pas defensif. Si un choix visuel est mauvais, corrige le diagnostic et propose une action precise.
- Ne touche pas a `../sentropic` directement sauf demande explicite. Tu peux le lire pour audit/inventaire.
- `top-ai-ideas.sent-tech.ca` et `top-ai` designent Sentropic. Dans le code local, la reference utile est `../sentropic`.
- Le port `5173` est reserve a Sentropic. N'utilise pas ce port pour preview docs. Utilise par exemple `4174`.

## Etat repo a reprendre

Derniers commits pertinents sur `main`:

- `e3756ff fix(docs): tighten docs navigation and capture sentropic gaps`
- `b331c6d fix(docs): restore previous shell and hide locale toggle`
- `f0a54fd fix(docs): tighten navigation and grouped page UX` - large passe UX ensuite rejetee par l'utilisateur, ne pas la recreer.
- `e6c8e0e fix(docs): publish redirects for documented component slugs`
- `0ef7487 fix(docs): align interactive affordances with sentropic`
- `1549b0f fix(docs): improve documentation readability spacing`

Worktree connu avant ce handover:

- `PLAN.md` modifie hors perimetre.
- `docs/chat-ui-contract.md` modifie hors perimetre.
- `docs/release.md` modifie hors perimetre.
- Ne pas revert ces fichiers. Ignore-les sauf instruction explicite.

Site public:

- URL: `https://design-system.sent-tech.ca/`
- Deploiement via GitHub Pages, workflow `.github/workflows/docs.yml`.
- Le push sur `main` declenche le workflow `Docs` si les chemins docs/packages changent.
- Verifications habituelles:
  - `npm run check`
  - `npm test`
  - `npm run docs:build`
  - si besoin preview locale: `npm run docs:build` puis `npm --workspace apps/docs run dev -- --host 127.0.0.1 --port 4174` ou autre port libre hors `5173`.

Warnings connus non bloquants:

- `packages/components-svelte/src/lib/Search.svelte`: warning accessibilite autour de `role="searchbox"`.
- `packages/components-svelte/src/lib/NumberInput.svelte`: warning CSS `appearance`.

## Mode de reporting immédiat requis (WP4 / WP7 / WP8 en cours)

### Fait
- WP4 — Les 6 pages chat dédiées sont rédigées (ChatMessage, ChatThread, ChatComposer, StreamingMessage, MessageActions, MessageStatusBadge), et la consolidation WP4 est marquée dans `docs/workpackages.md`.
- WP7 — La consolidation V2 existe dans `docs/ds-audit-consolidated-v2.md` et `docs/ds-audit-report.md` est explicitement marqué comme V1 historique.
- WP8 — `docs/wp8-multi-harness-target-review.md` formalise le contrat V1 de la passe skill et les preuves attendues.

### A faire
- WP4 — Vérification visuelle ciblée (Playwright si demandé) et micro-ajustements de snippets docs si nécessaire.
- WP7 — Clôturer la revue des clusters en Q/R et confirmer le mapping final des règles sur `packages/impeccable`.
- WP8 — Faire un Q/R segmenté, pas global: commande, orchestrateur, output contract, non-objectifs, preuve, décision blocs bloquants.

### Attendus
- WP4 — Validation utilisateur pièce par pièce, pas de signature globale.
- WP7 — Validation continue du backlog P0/P1 à partir de la V2 avant extension du ruleset.
- WP8 — Validation segmentée de la cible de revue avant tout “done”; décision explicite sur les adapters (`.codex`/`.gemini`) après ce Q/R.

## Contexte fonctionnel et decisions recentes

L'utilisateur a d'abord demande de publier la documentation du design system sur `design-system.sent-tech.ca`, puis a demande une revue critique avec Playwright et un audit de `../sentropic`.

Les corrections deja livrees dans les commits precedents incluent:

- Ajout de `@lucide/svelte` au design system/docs.
- Chevrons Lucide sur accordions, sidebar docs, dropdowns, combobox, multiselect.
- `OverflowMenu` avec icone Lucide `Ellipsis`.
- Fermeture `Escape` et outside-click sur `Dropdown`.
- Focus initial, focus trap minimal et fermeture `Escape` sur `Modal`.
- Fix de slugs directs comme `/components/input`.
- Ajout/extension de `docs/sentropic-alignment-inventory.md`.

L'utilisateur a ensuite rejete une passe trop large (`f0a54fd`) car:

- les boutons de menu etaient juges immondes;
- la sidebar avait disparu ou semblait trop transformee;
- un toggle de langue etait apparu au mauvais endroit dans la page.

Un rollback cible a ete fait avec `b331c6d`, puis une passe plus limitee avec `e3756ff`.

## Feedback visuel le plus recent a traiter

L'utilisateur a fourni des captures et demande explicitement:

1. Sidebar docs, item `Vue d'ensemble`
   - L'etat actif actuel combine une ligne bleue a gauche avec une forme arrondie.
   - Feedback: "tu peux pas mettre un bouton rond avec une ligne a gauche, c'est immonde".
   - Direction utilisateur: le principe ligne gauche peut marcher si le bouton est carre/rectangulaire, pas avec un pill arrondi.
   - Action recommandee: rendre l'etat actif premier niveau rectangulaire sobre, avec radius faible ou nul, ou utiliser un fond actif seul. Eviter le melange left-rail + pill arrondi.

2. Sidebar docs, groupes composants
   - L'espacement vertical entre `Actions`, `Formulaires`, `Navigation`, `Overlays`, `Feedback`, `Donnees`, `Structure` reste trop grand.
   - Action recommandee: reduire clairement `margin-top`, `gap`, `padding` et hauteur de summary; viser une densite proche DSFR/Carbon pour navigation technique.

3. Page `/components/plan-completion`
   - Le fond clair du hero ne doit pas deborder visuellement sous le menu lateral.
   - Le titre et les espacements ont deja ete reduits, mais rester vigilant.
   - L'utilisateur veut comprendre ce qu'il est cense regarder: privilegier des blocs de demo nommes, chacun lisible et contextualise.

4. Page `/components/overlays`
   - `OverflowMenu` doit s'ouvrir vers la droite quand le bouton `...` est a gauche.
   - Cela a deja ete fait avec `placement="bottom-start"`, mais a verifier si tu touches aux overlays.

## Harmonisation headers inter-sites

Sur demande de l'utilisateur, une etude rapide a ete faite entre:

- `https://top-ai-ideas.sent-tech.ca/` - Sentropic
- `https://design-system.sent-tech.ca/` - design system docs
- `https://nc.sent-tech.ca/` - NC
- `https://www.sent-tech.ca/` et le repo `../sentech-forge` - site principal / forge

Sources locales importantes:

- Design system docs: `apps/docs/src/routes/+layout.svelte`
- Design system CSS docs: `apps/docs/src/app.css`
- Sentropic header: `../sentropic/ui/src/lib/components/Header.svelte`
- NC header: `../nc-fullstack/ui/src/routes/Header.svelte`
- NC auth/menu: `../nc-fullstack/ui/src/routes/Menu.svelte`
- Sentech Forge navigation: `../sentech-forge/src/components/Navigation.svelte`
- Sentech Forge language switcher: `../sentech-forge/src/components/LanguageSwitcher.svelte`

Premiere reco donnee puis corrigee:

- Une premiere logique proposait deux familles de headers (`site public` vs `app shell`).
- L'utilisateur a tranche contre cette reco pour l'instant:
  - Tous les sites vont etre publics ou quasi publics.
  - Il prefere travailler sur un mode commun.
  - On pourra prevoir plus tard un mode `small` hauteur limitee pour les applications gourmandes, mais pas maintenant.
  - La reference visuelle probable est l'etat blanc de `https://www.sent-tech.ca/#blog`, pas l'etat transparent sur hero.
  - Le cas hero du site principal est une variation de fond, pas une autre famille.

Decision actuelle a respecter:

- Construire un contrat de header commun.
- Prendre comme base le header blanc `sent-tech.ca/#blog`.
- Harmoniser logo, burger, menus, langue, connexion/identification, transitions inter-site.
- Ne pas imposer pour l'instant une famille separee `app shell`.

Question ouverte en cours de Q/R:

- Que standardiser a droite du header commun ?
- Option precedemment recommandee: `Langue partout, Connexion seulement sur les surfaces applicatives qui ont une authentification`.
- L'utilisateur n'a pas encore repondu a cette question au moment du handover.
- Si tu reprends le Q/R, commence par rappeler cette question ou propose un arbitrage direct si tu as assez de contexte.

## Rattrapage Sentropic par le design system

Fichier central: `docs/sentropic-alignment-inventory.md`.

Ne pas confondre:

- `top-ai-ideas` = Sentropic.
- Le travail attendu ici est de rattraper les primitives manquantes dans le design system pour que Sentropic puisse les consommer.
- Ne pas modifier directement `../sentropic` tant que l'utilisateur ne le demande pas explicitement.

Backlog prioritaire actuel:

1. `IconButton`
   - Primitive compacte 32-36px.
   - Icon-only.
   - `aria-label` obligatoire.
   - `title` optionnel.
   - Hover/focus visibles.
   - Lucide uniquement.

2. `MenuTriggerButton`
   - Equivalent DS du pattern Sentropic `../sentropic/ui/src/lib/components/MenuTriggerButton.svelte`.
   - Bouton icone carre, pas pill textuel.

3. `MenuPopover`
   - Primitive de placement inspiree de `../sentropic/ui/src/lib/components/MenuPopover.svelte`.
   - `placement`, `align`, outside-click, fermeture `Escape`, z-index/width/max-height robustes.

4. `Menu` / `OverflowMenu`
   - Items avec icone, danger, disabled, groupes, separateurs.
   - Largeur contrainte.
   - Menus denses `icon + label`, pas liste de texte nue.

5. Sweep Lucide restant
   - `CopyButton`
   - `Search`
   - `PasswordInput`
   - `InlineLoading`
   - `ProgressIndicator`
   - `PaginationNav`
   - `Tag`
   - `FileUploader`

## Priorites recommandees au prochain agent

Priorite immediate si l'utilisateur demande d'implementer:

1. Fix docs sidebar limite et verifie visuellement:
   - corriger l'actif `Vue d'ensemble` pour supprimer le melange bouton arrondi + ligne gauche;
   - resserrer les groupes composants;
   - verifier desktop et mobile avec Playwright;
   - ne pas refaire tout le shell.

2. Continuer le Q/R header commun:
   - valider la zone droite: langue partout, connexion seulement ou non;
   - valider le logo officiel SENT vs monogramme produit;
   - valider le burger: toujours a droite sur sites publics, a gauche uniquement si rail applicatif existant, ou standard unique;
   - valider les nav labels par surface.

3. Rediger un mini contrat `docs/header-alignment-contract.md` ou equivalent avant gros refactor:
   - hauteur standard;
   - logo;
   - nav centrale;
   - utilitaires droite;
   - behavior hero/transparent vs blanc;
   - responsive.

4. Rattrapage Sentropic DS:
   - commencer par `IconButton` + docs;
   - puis `MenuTriggerButton`;
   - puis enrichissement `Menu` / `OverflowMenu`;
   - ensuite `MenuPopover`.

## Contraintes visuelles fortes

- Utiliser les icones Lucide dans les boutons d'outils et affordances.
- Ne pas utiliser de boutons textuels arrondis quand une icone standard suffit.
- Eviter les pills arrondis dans les sidebars techniques si cela cree une ambiguite ou un effet amateur.
- Les cards ne doivent pas etre imbriquees dans des cards.
- Les sections docs doivent etre scannables, avec densite de navigation technique proche Carbon/DSFR.
- Le design system doit etre uniforme avec `sent-tech.ca`, pas une experience separee.

## Commandes utiles

Etat:

```bash
git status --short
git log --oneline -8
```

Verification:

```bash
npm run check
npm test
npm run docs:build
```

Preview docs, hors port 5173:

```bash
npm --workspace apps/docs run dev -- --host 127.0.0.1 --port 4174
```

Deploiement:

```bash
git add <files>
git commit -m "<message>"
git push
gh run list --workflow Docs --branch main --limit 5
gh run watch <run-id>
```

Controle public:

```bash
curl -I https://design-system.sent-tech.ca/
curl -I https://design-system.sent-tech.ca/components/overlays
```

## Prompt operationnel a suivre

Commence par:

1. Lire ce handover.
2. Verifier `git status --short`.
3. Ne pas toucher aux fichiers hors perimetre deja modifies.
4. Si tu implementes, limite la premiere passe aux corrections explicitement demandees, surtout sidebar/docs.
5. Pour toute decision header, continuer le Q/R avec une question a la fois.
6. Avant de dire que c'est termine, verifier localement avec commandes et Playwright si visuel.
7. En final, reporter en sections `Fait`, `A faire`, `Attendus`, avec tracks separees.

Phrase de reprise conseillee:

> Je reprends sur la base d'un header commun, avec `sent-tech.ca/#blog` comme reference blanche. Je commence par corriger le souci sidebar deja identifie sans refaire le shell, puis je poursuis le Q/R sur la zone droite du header commun et le backlog Sentropic DS.
