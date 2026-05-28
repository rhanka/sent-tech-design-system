# Backlog de décisions à porter (utilisateur)

Décisions/actions **irréversibles, coûteuses, ambiguës ou engageantes** mises de
côté pendant le loop autonome. Les décisions **réversibles** sont prises seules et
non listées ici (voir commits/tracker). Mis à jour au fil du loop.

> Convention : 🔴 bloque une suite · 🟠 à trancher quand possible · 🟢 info/quand tu veux.

## Décisions en attente

### D1 — 🟠 Bump + publication npm (DS coeur + thèmes)
Le contenu sur `main` (anatomie v1.2.0, builder, alias, thèmes anatomiques) n'est
**pas publié**. Proposition : tokens/themes/svelte `0.9.0`→**`0.10.0`** (tag `v0.10.0`),
theme-dsfr/carbon `0.1.0`→**`0.2.0`** (tag `themes-v0.2.0`), via OIDC (sans token).
**Action attendue** : ton « go » → je bump les package.json + lockfile + commit + tags.
*(Irréversible — unpublish npm difficile. Ne rien taguer sans go.)*

### D2 — 🟠 Alignement du composer chat sur `sentropic/chat-ui`
Écart **architectural** : chat-ui = surface **rich-text ProseMirror à slots**
(`renderComposerSurface/FloatingLayer/LeftControls/RightActions`, modes `ai|comments`,
floating layer mentions). Le nôtre = `<textarea>` autosize + Send/Stop (autosize OK).
**Options** : (a) garder notre composer simple (textarea), (b) adopter la surface
rich à slots de chat-ui (gros chantier : ProseMirror, floating layer, slots, modes),
(c) hybride (slots de contrôle + textarea, sans rich-text). 
**Action attendue** : choisir la cible. *(Engageant — (b) = réécriture majeure.)*

### D3 — 🟢 Résidus de fidélité (escapes documentés)
DSFR : soulignement de lien **animé** (D2 matrice) ; technique du filet bas input
(box-shadow vs border-bottom) + radius 4px réel. Carbon : hover de carte via `$layer`
(C4). Accepter comme échappements gouvernés ou chercher à fermer ? *(Mineur.)*

### D4 — 🔴 Thèmes clients privés (Airbus / Scalian / CGI)
Bloqué : besoin des assets/tokens (Airbus fourni par toi, Scalian/CGI à récupérer)
+ confirmation **hors git** (mémoire/gitignore). *(Bloqué sur fourniture.)*

### D5 — 🟠 WP12 templates docs & slides (ESN)
Format de sortie `.pptx` + `.doc` à valider ; typologie slides ESN (decks Scalian/CGI
en réf, hors colorimétrie). Cadrage à faire avec toi avant tout dev.

### D6 — 🟢 Phase 2 rollout anatomie (~55 composants restants)
Schéma `ComponentAnatomy` figé v1.2.0 → rollout possible par clusters. Quand lancer,
et dans quel ordre de clusters ? *(Je peux avancer par cluster réversible si tu veux.)*

## Journal du loop (réversible, fait en autonomie)

- (init) Backlog créé ; comparaison composer chat menée → D2 ouverte.
- WP2 : composant **Footer** livré (P1 gap analysis) — `4487c9c`.
- WP2 : composant **Tile** unitaire livré (P1 gap analysis : static/clickable/selectable).
