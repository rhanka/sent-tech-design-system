# Extraction de l'ossature docs en template « Read the Docs » réutilisable

Statut : proposition (PR draft). Pendant côté sentropic : `spec/SPEC_EVOL_DOCS_TEMPLATE.md`
(PR draft rhanka/sentropic), qui porte la décision d'architecture du package partagé.
Premier client visé hors DS : **dataviz.sent-tech.ca** (repo rhanka/dataviz).

## 1. Objectif

`apps/docs` est aujourd'hui le site de documentation du design system. Son ossature
(rendu déclaratif tri-framework, chrome thématisable, navigation/sidebar, i18n FR/EN,
thème+framework pilotés par l'URL, chat assistant) est en grande partie **générique** :
elle peut documenter n'importe quelle bibliothèque de composants Svelte/React/Vue.

Ce document inventorie ce qui est générique vs DS-spécifique, définit les **points
d'extension** qu'un template réutilisable doit exposer, et décrit le **module de
recherche chat-ui** dont le scaffold est livré dans cette PR
(`apps/docs/src/lib/chat/DocsSearch.svelte` + `docs-search-index.ts`).

Rien n'est extrait dans cette PR : on prépare l'extractabilité (contrats nommés,
scaffold recherche, frontières documentées) sans casser le build ni bouger de fichier.

## 2. Inventaire : générique vs DS-spécifique

| Module (`apps/docs/src/lib/...`) | Rôle | Verdict | Détail |
| --- | --- | --- | --- |
| `framework/examples.ts` (types) | DSL `NodeSpec` (arbre déclaratif comp/el/props/children) | **Générique** | Les types `NodeSpec`, `ComponentNodeSpec`, `ElementNodeSpec`, `FrameworkExample`, `FrameworkId` ne dépendent de rien. Seuls le registre `EXAMPLES` et l'union `ComponentName` sont DS-spécifiques. |
| `framework/SvelteNode.svelte` | Rendu inline d'un arbre NodeSpec en Svelte | **À paramétrer** | Le mécanisme est générique ; la table de résolution `ComponentName -> composant` doit devenir injectable (registry passée par le client). |
| `framework/react-island.ts`, `vue-island.ts` | Îles React/Vue (mount/unmount, imports dynamiques) | **Générique** | Même besoin d'injection de la table de composants. Contrat `IslandHandle { unmount() }` stable. |
| `framework/nodeToCode.ts` | Sérialisation NodeSpec vers code source lisible (3 syntaxes) | **Générique** | Fonction pure. |
| `framework/TabbedExample.svelte`, `FrameworkPreview.svelte` | Démos à onglets framework + code + copy | **Générique** | Consomme uniquement le DSL + les îles. |
| `components-catalog.ts` | Catalogue (`ComponentEntry { name, slug, status, category, groupSlug, description.fr/en }`) | **Schéma générique, données DS** | Le schéma + `groupByCategory` + `componentHref` partent dans le template ; le tableau `COMPONENTS` reste chez chaque client (le DS ici, la registry chez dataviz). |
| `docs-navigation.ts` | Top nav, nav fondations, groupes sidebar, breadcrumb | **Schéma générique, données DS** | `DocsNavItem`/`ComponentNavGroup` génériques ; les tableaux `DOCS_TOP_NAV` etc. sont du contenu client. |
| `i18n.ts`, `locale.svelte.ts` | Copie FR/EN + store locale | **Générique** | Le mécanisme (`t(locale, key)`, store Svelte 5) part tel quel ; le dictionnaire est du contenu client. |
| `url-state.ts`, `framework.svelte.ts`, `color-mode.svelte.ts` | Thème + framework + mode couleur dans l'URL (source de vérité), anti-FOUC, re-estampillage à la navigation | **Générique** | Paramétrable : liste des thèmes valides et des frameworks valides fournie par le client. |
| `chrome/Chrome{Airbus,Canada,Carbon,Dsfr,Quebec}.svelte` | Chrome documentaire par thème | **DS-spécifique** | Visuels propriétaires par tenant. Le template n'exporte que le **contrat de chrome** (props ci-dessous) + un chrome par défaut bâti sur `AppChrome` de la lib. |
| `chat/ChatWidget.svelte`, `chat-config.ts`, `chat-i18n.ts`, `anon-counter` | Assistant conversationnel light-auth | **Générique** | Déjà découplé : endpoint externe configurable (`PUBLIC_CHAT_ENDPOINT`), contrat wire JSON minimal, gating anonyme localStorage. |
| `chat/DocsSearch.svelte`, `docs-search-index.ts`, `docs-search-i18n.ts` (cette PR) | Recherche chat-ui | **Générique** | Voir section 4. Seul `buildDocsSearchIndex()` connaît le contenu du DS. |
| `compare/` | Comparaison de thèmes côte à côte | **DS-spécifique** | Lié aux overlays de fidélité des thèmes tenant ; hors périmètre template v1. |
| `auth/` | OAuth RP (placeholder phase 1) | **Générique optionnel** | À embarquer comme option du template (gating chat). |
| `routes/components/[slug]`, `routes/views`, `routes/preview` | Pages | **Squelette générique, contenu DS** | Le pattern (entries() de prerender depuis le catalogue, page stub par défaut, pages riches dédiées) part dans le template. |

## 3. Points d'extension du template

Un client du template fournit, et seulement cela :

1. **Une source de contenu** : tableau `ComponentEntry[]` (ou équivalent registry,
   cf. dataviz `apps/site/src/lib/registry/`) + dictionnaire i18n + pages riches
   optionnelles. Tout le reste (sidebar, breadcrumb, index de recherche, entries
   de prerender) en dérive.
2. **Une registry de composants par framework** : `Record<ComponentName, Component>`
   pour Svelte (rendu inline) et pour les îles React/Vue. C'est l'inversion de
   dépendance qui libère `SvelteNode`/les îles du couplage `@sentropic/design-system-*`.
3. **Zéro ou plusieurs chromes** respectant le contrat existant (extrait de
   `ChromeCarbon.svelte`, à publier tel quel comme type du template) :

   ```ts
   type DocsChromeProps = {
     children: Snippet;
     activeThemeId: string;
     isThemeOpen: boolean;
     onThemeToggle: () => void;
     themeSwitcher: Snippet;
     frameworkSwitcher: Snippet;
     localeSwitcher: Snippet;
     compareButton: Snippet;
     mobileMenuOpen: boolean;
     onMobileMenuToggle: () => void;
   };
   ```

   Le chrome par défaut du template est celui bâti sur `AppChrome`/`AppHeader`
   (déjà publiés dans `@sentropic/design-system-svelte`, déjà consommés par dataviz).
4. **La liste des thèmes et frameworks valides** pour `url-state` (le DS en a 6 et 3 ;
   dataviz a 4 tenants et 3 frameworks : même mécanisme).
5. **Un endpoint chat optionnel** (`PUBLIC_CHAT_ENDPOINT`) : sans lui, le widget et
   la recherche restent fonctionnels en mode dégradé (démo locale / lexical seul).

## 4. Module de recherche chat-ui (scaffold livré ici)

Architecture en deux étages, alignée sur le site statique (adapter-static, pas de
runtime serveur) :

1. **Index lexical statique** (`docs-search-index.ts`) :
   - contrat `DocsSearchDocument { id, url, kind, title.fr/en, excerpt.fr/en, keywords }` ;
   - `buildDocsSearchIndex()` dérive l'index des sources déclaratives existantes
     (catalogue composants + nav fondations) : aucun contenu dupliqué, l'index suit
     le catalogue automatiquement ;
   - `searchDocs(index, query, locale, limit)` : scoring lexical pur (titre exact >
     préfixe > inclusion > mots-clés > extrait), insensible aux accents, sémantique
     AND multi-termes. Testé (`docs-search-index.test.ts`).
2. **Escalade conversationnelle** (`DocsSearch.svelte`) :
   - réutilise le composant `Search` publié du DS pour le champ ;
   - bouton « Demander à l'assistant » : `buildAssistantPrompt()` emballe la question
     plus les meilleurs résultats (titre, URL, extrait) et l'envoie via
     `sendChatMessage()` de `chat-config.ts`, soit exactement le même endpoint et le
     même contrat wire que le ChatWidget (pattern RAG côté client : le backend reste
     libre, le grounding voyage dans le message) ;
   - non configuré : la recherche lexicale reste pleinement fonctionnelle, l'escalade
     affiche une note explicite. Jamais de blocage dur.

Décisions d'intégration volontairement laissées ouvertes (tracées dans la spec
sentropic) : montage dans le header vs page `/search` dédiée ; passage à un index
full-text buildé (prose des pages riches) vs index catalogue ; mutualisation du
grounding côté backend (le serveur indexe la doc) vs côté client (statu quo scaffold).

## 5. Besoins dataviz (premier client, résumé)

Le site dataviz (`apps/site`, Vite + Svelte 5, SPA router maison de 62 lignes) a déjà
une registry déclarative (`DemoEntry { slug, section, name, group, tagline, useCase,
demo, code.svelte/react/vue }`) qui mappe naturellement sur le contenu attendu par le
template. Il consomme déjà `AppChrome` et les tokens DS. Ses manques actuels que le
template comble directement : recherche (aucune), i18n (FR seul), démos live React/Vue
(îles : le template les a), prerender statique (le template est en adapter-static),
pages guides structurées. Restent spécifiques à dataviz : son dataset de démo, ses
stores BI (dataviz-core) et ses entrées de registry.

## 6. Chemin d'extraction proposé (par étapes, hors périmètre de cette PR)

1. **Étape 0 (cette PR)** : contrats nommés + scaffold recherche + inventaire.
2. **Étape 1** : inversion de dépendance dans `apps/docs` même (la table
   `ComponentName -> composant` devient une registry passée en haut de l'arbre) ;
   aucun changement visible.
3. **Étape 2** : extraction du package template (nom de travail
   `@sentropic/docs-template`, emplacement à décider côté sentropic) : DSL NodeSpec,
   îles, moteur de recherche, url-state, i18n, layout + chrome par défaut.
   `apps/docs` devient son premier consommateur (dogfooding).
4. **Étape 3** : adoption par dataviz : sa registry alimente catalogue + index de
   recherche ; ses 4 tenants alimentent url-state ; gain immédiat : recherche,
   i18n, îles live React/Vue, prerender.

## 7. Garde-fous

- Le DS reste contrôlé/présentationnel : le template est une ossature de SITE de
  docs, pas un composant de la lib. Il vit hors de `packages/`.
- Versionnement indépendant du DS (le template épingle une version de
  `@sentropic/design-system-svelte` pour son chrome par défaut, comme dataviz).
- Le scaffold recherche de cette PR n'est pas monté dans le layout : zéro impact
  rendu, zéro impact build (vérifié : `svelte-check` + `vitest`).
