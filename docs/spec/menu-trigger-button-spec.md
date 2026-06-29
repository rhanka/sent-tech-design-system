# SPEC — `MenuButton` (Dropdown de navigation porté body)

> Statut : **design / spec** (aucun build dans ce livrable).
> Demandeur : consommateur immo `radar-immobilier`.
> But : rendre l'`AppHeader` immo **100 % DS, 0 custo** — un dropdown de nav natif
> (popover porté en body, nav SPA via `onSelect`, items gatés par rôle) utilisable
> depuis le slot `nav` d'`AppHeader`, + extension `AppChrome.nav` pour accepter des
> entrées dropdown non-`href`.

---

## 0. État du réel (ce qui existe déjà, ce qui manque)

| Brique | Fichier | Ce qu'elle fait | Manque pour le besoin immo |
| --- | --- | --- | --- |
| Trigger | `MenuTriggerButton.svelte` (+ react/vue/angular) | **Uniquement le bouton** : wrapper `IconButton`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, `size`, `variant`, `disabled`. | Pas de panneau, pas d'items, pas de variante « pill texte + chevron » pour la nav. |
| Liste menu | `Menu.svelte` | Toute l'a11y : `role="menu"`, roving `tabindex`, flèches ↑/↓, Home/End, Enter/Espace, `onselect(value)`, items `{label,value,disabled,danger,icon}` + `divider` + `group`. **Rendu inline** (`<div role="menu">`). | Pas d'`href`, pas de `onSelect` par item (callback), pas de gating par rôle, pas de portage body. |
| Popover positionné | `MenuPopover.svelte` | Calcule `top/left` via `getBoundingClientRect()` puis **`position:absolute`**. | **C'est la cause du décalage** : un élément `absolute` se positionne contre le 1er ancêtre positionné. Avec `navAlign="center"`, `.st-appHeader__bar` passe en `position:relative` → les coordonnées « page » sont appliquées dans le repère de la barre → double offset. |
| Portail | `Portal.svelte` | Téléporte les enfants dans `document.body` (ou `target`), `display:contents`, SSR-safe (`resolvePortalTarget`). | Rien — **c'est la primitive à réutiliser** pour neutraliser le décalage. |
| Chrome | `AppChrome.svelte` | `nav: AppChromeNavItem[] = {label, href, active?}` ; thème/colorMode/locale/github/identity contrôlés ; drawer mobile. | `nav` n'accepte que des **liens `href`**, pas d'entrée dropdown. |
| Select form | `Dropdown.svelte` | `role="listbox"`, value-based, `position:fixed`. | C'est un select de **formulaire** (value unique, pas de nav, pas de rôle, pas d'`href`). Non réutilisable tel quel pour la nav. |

**Décision de nommage.** `MenuTriggerButton` reste le **trigger bas-niveau** (inchangé,
juste une variante texte ajoutée). Le composé réclamé par immo est spécifié sous le nom
**`MenuButton`** : il *compose* `MenuTriggerButton` (trigger) + `Portal` (porté body) +
la machinerie d'items de `Menu` (roving tabindex). On ne réécrit pas l'a11y : on la
réutilise. `MenuPopover` n'est **pas** utilisé par `MenuButton` (son `position:absolute`
est précisément le bug) ; on porte le panneau via `Portal` + `position:fixed`.

---

## 1. API `MenuButton`

```ts
/** Item « action / lien » d'un MenuButton. */
export interface MenuButtonItem {
  kind?: "item";
  label: string;
  /** Navigation déclarative. Rendu en <a href>. Mutuellement exclusif avec onSelect. */
  href?: string;
  /** Navigation SPA / action. Reçoit l'item. Mutuellement exclusif avec href. */
  onSelect?: (item: MenuButtonItem) => void;
  /** Cible du lien (href uniquement). */
  target?: "_self" | "_blank";
  /** Item marqué actif (aria-current="page" / surbrillance). */
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  /** Icône Lucide (composant) ou glyphe (string), cohérent avec Menu.MenuIcon. */
  icon?: MenuIcon;
  /**
   * Gating par rôle : rôle(s) requis pour voir/activer l'item.
   * L'item est filtré (ou désactivé, cf. gateMode) si le contexte de rôle
   * ne satisfait pas l'exigence. undefined => toujours visible.
   */
  requiredRole?: string | string[];
}

export interface MenuButtonDivider { kind: "divider"; }
export interface MenuButtonGroup { kind: "group"; label: string; }
export type MenuButtonEntry = MenuButtonItem | MenuButtonDivider | MenuButtonGroup;

export interface MenuButtonProps {
  // ── Trigger ───────────────────────────────────────────────────────────────
  /** Texte du déclencheur (variante nav « pill + chevron »). */
  label?: string;
  /** aria-label obligatoire si pas de label texte (variante icône). */
  "aria-label"?: string;
  /** Apparence du trigger. "nav" = pill texte + chevron (slot nav AppHeader). */
  triggerVariant?: "nav" | "ghost" | "secondary";
  /** Icône optionnelle à gauche du label. */
  triggerIcon?: MenuIcon;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;

  // ── Contenu ───────────────────────────────────────────────────────────────
  items: MenuButtonEntry[];
  /** aria-label du panneau menu (a11y). Défaut = label. */
  menuLabel?: string;

  // ── Gating par rôle (contexte) ────────────────────────────────────────────
  /** Rôles de l'utilisateur courant. ex. ["admin","editor"]. */
  userRoles?: string[];
  /** Prédicat custom (prioritaire sur userRoles). ex. (role)=>store.can(role). */
  can?: (role: string) => boolean;
  /** Que faire d'un item non autorisé. "hide" (défaut) | "disable". */
  gateMode?: "hide" | "disable";

  // ── Ouverture (contrôlé/non-contrôlé, idiome aligné IdentityMenu) ──────────
  open?: boolean;                       // $bindable en Svelte
  onOpenChange?: (open: boolean) => void;

  // ── Positionnement ────────────────────────────────────────────────────────
  /** Ancrage horizontal du panneau vs trigger. */
  align?: "start" | "end" | "center";  // défaut "start"
  /** Côté vertical. */
  side?: "bottom" | "top";             // défaut "bottom"
  /** Cible du portail (test/iframe). Défaut document.body. */
  portalTarget?: string | HTMLElement;

  // ── Fermeture ─────────────────────────────────────────────────────────────
  closeOnSelect?: boolean;             // défaut true
  closeOnOutside?: boolean;            // défaut true
  closeOnEscape?: boolean;             // défaut true

  class?: string;
}
```

Notes API :
- **`href` xor `onSelect`** par item. `href` → `<a>` (SPA-friendly, fonctionne avec
  preventDefault d'un routeur). `onSelect` → `<button>` (nav SPA programmatique).
  Si les deux sont fournis : `onSelect` l'emporte et `href` sert de fallback no-JS.
- **Contexte de rôle** : `can` (prédicat) prioritaire ; sinon `userRoles` +
  `requiredRole` (l'item passe si l'**intersection** est non vide). Pas d'état d'auth
  interne — purement présentationnel/contrôlé (même posture que `IdentityMenu`).
- Le trigger réutilise `MenuTriggerButton` ; `triggerVariant="nav"` ajoute la pill
  texte + `ChevronDown` (classe `.st-appHeader__navLink` réutilisée pour matcher le chrome).

---

## 2. Comportement

### 2.1 Portage body (le fix du décalage)
- Le panneau est rendu dans `Portal` (`target` = `portalTarget` ?? `document.body`).
- Position calculée via `trigger.getBoundingClientRect()` puis appliquée en
  **`position: fixed`** (coordonnées viewport, **sans** `scrollX/scrollY` puisque
  `fixed`). Étant porté en body et en `fixed`, le panneau est **indépendant de
  `navAlign`** et de tout ancêtre `position:relative` → **0 décalage** quelle que soit
  la position du trigger (nav centrée, slot actions, drawer…).
- Recalcul sur `scroll` (capture) + `resize` (réutilise le pattern de `MenuPopover`),
  avec garde anti-débordement viewport (marge 8px, plancher hauteur scrollable comme
  `MenuPopover`/`Menu`).

> Rappel mémoire (MenuPopover viewport cap) : calculer la hauteur dispo dynamiquement et
> rendre le panneau scrollable plutôt que `max-height:100vh`. À reprendre tel quel.

### 2.2 Anchoring
- `side="bottom"` : `top = rect.bottom + GAP`. `side="top"` : panneau remonté de 100%
  de sa hauteur (transform), `top = rect.top - GAP`.
- `align="start"` : `left = rect.left`. `align="end"` : `left = rect.right` + `translateX(-100%)`.
  `align="center"` : `left = rect.left + rect.width/2` + `translateX(-50%)`.
- Si le panneau déborde du viewport côté `align`, flip automatique start↔end.

### 2.3 Ouverture / fermeture
- Clic trigger : toggle (`onOpenChange`). Contrôlé si `open` fourni, sinon état interne.
- Ferme sur : `Escape` (`closeOnEscape`), pointerdown hors trigger+panneau
  (`closeOnOutside`, via `composedPath`), sélection d'un item (`closeOnSelect`).
- À l'ouverture : focus sur le 1er item activable. À la fermeture : focus rendu au trigger.

### 2.4 A11y menu (réutilise la logique `Menu`)
- Trigger : `aria-haspopup="menu"`, `aria-expanded`, `aria-controls=<panelId>` (id stable
  SSR-safe, pattern compteur module comme `AppHeader`/`AppChrome`).
- Panneau : `role="menu"`, `aria-label`. Items `role="menuitem"`. Dividers `role="separator"`.
  Groupes `role="presentation"` (libellé non focusable).
- **Roving tabindex** : un seul item à `tabindex=0`, les autres `-1`.
- Clavier : ↑/↓ navigue (wrap), Home/End extrêmes, Enter/Espace active, Esc ferme,
  Tab ferme et laisse le focus suivre le flux (focus trap **léger** : pas de piège dur,
  on ferme à Tab sortant — cohérent avec un menu de header).
- Items gatés en `disable` : `aria-disabled="true"` + `disabled`, sautés par le roving.
- Items gatés en `hide` : absents du DOM.

---

## 3. Intégration

### 3.1 Dans le slot `nav` d'`AppHeader` (usage immo direct)

```svelte
<AppHeader navAlign="center" {logo} {actions}>
  {#snippet nav()}
    <a class="st-appHeader__navLink" href="/biens" aria-current="page">Biens</a>
    <a class="st-appHeader__navLink" href="/carte">Carte</a>
    <MenuButton
      label="Outils"
      triggerVariant="nav"
      userRoles={user.roles}
      items={[
        { label: "Import",  href: "/import" },
        { label: "Export",  onSelect: () => exportCsv() },
        { kind: "divider" },
        { label: "Admin",   href: "/admin", requiredRole: "admin" },
      ]}
    />
  {/snippet}
</AppHeader>
```

→ Le dropdown « Outils » est porté en body : **aucun décalage** malgré `navAlign="center"`.
L'item « Admin » disparaît si `user.roles` ne contient pas `"admin"`.

### 3.2 Extension `AppChrome.nav` (entrées dropdown non-`href`)

`AppChromeNavItem` devient une **union discriminée rétrocompatible** :

```ts
/** Lien simple (forme historique — kind absent => "link"). */
export interface AppChromeNavLink {
  kind?: "link";
  label: string;
  href: string;
  active?: boolean;
  requiredRole?: string | string[];
}

/** Entrée dropdown (non-href). */
export interface AppChromeNavMenu {
  kind: "menu";
  label: string;
  items: MenuButtonEntry[];      // réutilise le type d'item de MenuButton
  active?: boolean;              // ex. un descendant est la page courante
  requiredRole?: string | string[];
  align?: "start" | "end" | "center";
}

export type AppChromeNavItem = AppChromeNavLink | AppChromeNavMenu;
```

Côté `AppChrome` :
- `navContent` : `{#each}` discrimine `kind` → `<a class="st-appHeader__navLink">` (link)
  ou `<MenuButton triggerVariant="nav" …>` (menu).
- Nouvelles props chrome : `userRoles?: string[]` / `can?` (propagées aux MenuButton **et**
  au filtrage des liens via `requiredRole`).
- **Drawer mobile** : une entrée `menu` se rend en **section accordéon** (libellé + sous-liens
  inline), pas en popover — cohérent avec le rendu actuel du drawer.
- Rétrocompat : `kind` absent ⇒ `link` ⇒ les consommateurs existants ne changent rien.
  La clé `{#each}` passe de `item.href` à un id dérivé (`href` ou `label`).

---

## 4. Plan de portage

Ordre : **Svelte (référence)** → React → Vue → Angular. Source de vérité CSS = bloc publié
dans `styles.css` (markup/classes/tokens byte-identiques entre fw, cf. en-tête `AppChrome`).

| Étape | Contenu | Notes |
| --- | --- | --- |
| 1. Svelte réf | `MenuButton.svelte` (compose `MenuTriggerButton` + `Portal` + items `Menu`) + extension `AppChrome.svelte` (union nav + `userRoles`/`can`). Export `index.ts` + types. | Réutiliser `Portal` et la logique roving de `Menu` (factoriser si besoin un util partagé). |
| 2. Tests unit | gating hide/disable, href vs onSelect, clavier (↑/↓/Home/End/Esc), portail (panneau dans body), fermeture clic-dehors. | Vitest + jsdom. Piège mémoire : tester `style.position==="fixed"`, pas l'offset. |
| 3. React | `MenuButton.tsx` (Portal via createPortal, mêmes classes/tokens) + extension `AppChrome.tsx`. | Aligné sur `MenuPopover.tsx`/`Portal.tsx` existants. |
| 4. Vue | `MenuButton.ts`/`.vue` (Teleport) + extension `AppChrome`. | Idem. |
| 5. Angular | `MenuButton` + extension `AppChrome`. | **Piège mémoire** : `:host{display:contents}` dans les `styles` du `@Component` (pas styles.css), sinon l'hôte `<st-*>` inline casse layout/SVG. |
| 6. Parité pixel | Vérif batch **1 chromium séquentiel** (jamais N subagents × Playwright sur 9222) sur les 3-4 rendus (svelte+react+vue, + angular). Page docs tri-fw. | Cf. mémoire parité Angular. |
| 7. Gate + publish | `svelte-check` + `npm run build` + **suite complète** des packages (pas que le test du composant) → commit → **tags** `v*`/`react-v*`/`vue-v*` (OIDC). Bump pins `apps/docs` + lockfile. | Push main = verify+docs ; npm publie **par tag**. |

---

## 5. ETA réaliste (chiffrée, par étapes)

| Étape | Effort dev | Remarque |
| --- | --- | --- |
| Spec + revue consensus (2 pairs) | 0,5 j | ce document + GO |
| Svelte réf + tests unit | 1,0 j | composé, mais réutilise Portal/Menu |
| Extension `AppChrome.nav` (3-4 fw) | 0,5 j | union + gating + drawer accordéon |
| Port React | 0,5 j | délégable subagent |
| Port Vue | 0,5 j | délégable subagent (parallèle React) |
| Port Angular | 0,5 j | piège `:host display:contents` |
| Parité pixel + page docs tri-fw | 0,5 j | 1 chromium séquentiel |
| Gate complet + publish 4 tags + pins/lockfile | 0,25 j + attente CI | OIDC |
| **Total** | **~4,25 j-dev** | **~2 à 2,5 jours calendaires** avec les 3 ports en parallèle (subagents) |

Chemin critique = Svelte réf → 1 port pilote validé → ports parallèles → parité → publish.
**Bonus immo dispo immédiatement** (§6) : zéro dépendance au build ci-dessus.

---

## 6. Bonus immo immédiat — exemple `AppChrome` (thème + mode couleur + langue + nav)

`AppChrome` couvre **déjà** thème/colorMode/locale + slot nav : immo peut **retirer sa custo
thème/langue dès maintenant**, sans attendre `MenuButton`. Exemple minimal (Svelte ; props
**identiques** en React/Vue, juste la syntaxe du snippet `identity` change) :

```svelte
<script lang="ts">
  import { AppChrome, IdentityMenu } from "@sentropic/design-system-svelte";

  let theme = $state("immo");
  let colorMode = $state<"light" | "dark" | "auto">("auto");
  let locale = $state<"fr" | "en">("fr");
  let mobileOpen = $state(false);
</script>

<AppChrome
  brandName="Radar"
  productName="Immobilier"
  logoSrc="/radar-logo.svg"
  brandHref="/"
  nav={[
    { label: "Biens",  href: "/biens", active: true },
    { label: "Carte",  href: "/carte" },
    { label: "Alertes", href: "/alertes" },
  ]}
  themes={[
    { id: "immo",   label: "Radar" },
    { id: "carbon", label: "Carbon" },
  ]}
  theme={theme}
  onThemeChange={(id) => (theme = id)}
  colorMode={colorMode}
  onColorModeChange={(m) => (colorMode = m)}
  locale={locale}
  onLocaleChange={(l) => (locale = l)}
  mobileMenuOpen={mobileOpen}
  onMobileMenuToggle={() => (mobileOpen = !mobileOpen)}
>
  {#snippet identity()}
    <IdentityMenu
      isAuthenticated={Boolean(user)}
      user={user}
      onLogin={() => signIn()}
      onLogout={() => signOut()}
    />
  {/snippet}
</AppChrome>
```

Ce que ça remplace côté immo : la barre custom (logo + nav + sélecteur thème + toggle
clair/sombre + bascule FR/EN + burger mobile + drawer) → **tout vient du DS**. Il ne reste
qu'à fournir l'état (`theme`/`colorMode`/`locale`) et les callbacks. Quand `MenuButton`
sera publié, les entrées « menu » s'ajouteront dans `nav` (union `kind:"menu"`, §3.2) pour
le dernier 1 % de custo dropdown.

---

## 7. Récap décisions

1. Nouveau composé **`MenuButton`** = `MenuTriggerButton` (trigger) + `Portal` (body) +
   items façon `Menu` (roving). `MenuPopover` **non** utilisé (son `absolute` = le bug).
2. Fix décalage = **`Portal` + `position:fixed`** → indépendant de `navAlign`.
3. Items **`href` xor `onSelect`** ; gating **`requiredRole` + `userRoles`/`can`** ;
   `gateMode` hide|disable.
4. `AppChrome.nav` = **union rétrocompatible** `link | menu` + props `userRoles`/`can` ;
   menu → accordéon dans le drawer mobile.
5. Portage 4 fw, parité pixel 1-chromium-séquentiel, publish **par tags** OIDC + pins docs.
6. **Immo peut migrer son chrome thème/langue tout de suite** via `AppChrome` (§6),
   indépendamment de la livraison `MenuButton` (ETA ~2–2,5 j calendaires).
