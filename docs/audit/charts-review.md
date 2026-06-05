# Revue adversariale — 6 visualisations BI Svelte (commit c9f8db3)

Périmètre : `packages/components-svelte/src/lib/{KpiCard,ComboChart,GaugeChart,FunnelChart,WaterfallChart,TreemapChart}.svelte` + tests `src/*.test.ts`.
Référence de conventions : `BarChart.svelte`, `LineChart.svelte`, `DonutChart.svelte`.
Méthode : lecture du code, vérification des tokens dans `packages/themes/css/*.css`, reproduction des algos (squarify, waterfall, funnel %, gauge geometry) en Node, exécution des 41 tests (tous verts).

Reviewer : Opus 4.8 — lecture seule, aucun commit.

---

## Synthèse par sévérité

| Sévérité | Nombre |
|----------|--------|
| BLOQUANT | 3 |
| MAJEUR   | 6 |
| MINEUR   | 7 |
| **Total** | **16** |

Note : les 41 tests passent, mais **aucun** ne détecte les bugs BLOQUANT B1/B2/B3 — jsdom ne résout pas les variables CSS (donc un token cassé reste vert) et aucun test n'assert le rendu visuel du token fill/gap.

---

## Top-10 priorisé

| # | Composant | Constat | Sévérité | Correction |
|---|-----------|---------|----------|------------|
| 1 | WaterfallChart | **Token `--st-semantic-feedback-danger` inexistant SANS fallback secondaire.** L.382/422 : `fill: var(--st-component-waterfallChart-decreaseFill, var(--st-semantic-feedback-danger))`. Ni le token composant ni `feedback-danger` ne sont définis dans aucun thème (`grep` sur `packages/themes/css/`). Résultat : **les barres « décroissance » et le swatch légende rendent SANS fill (transparent)** sur tous les thèmes par défaut. | BLOQUANT | Remplacer par `var(--st-semantic-feedback-error)` (le token réellement défini), comme KpiCard l.286 le fait déjà en cascade. |
| 2 | ComboChart | **Échelle de spacing inexistante.** L.546/548/557 : `--st-spacing-300 / -200 / -100`. La grille réelle est `--st-spacing-0,1,2,3,4,6,8,12,16` (cf. thèmes). `spacing-300` n'existe pas → fallback littéral utilisé (0.75rem/0.5rem/0.25rem), donc visuellement OK mais **token mort = dette/zéro-token réel respecté**. Les autres charts utilisent `--st-spacing-3/2/1`. | BLOQUANT (cohérence tokens) | Renommer en `--st-spacing-3 / -2 / -1` pour matcher la grille et la convention des autres charts. |
| 3 | GaugeChart | **Token `--st-semantic-surface-muted` inexistant** (l.278, band `neutral`). Fallback présent vers `text-secondary`, donc pas de crash, mais le ton « neutre » d'une jauge ressort en gris-texte foncé au lieu d'un gris-surface → contraste/lisibilité incorrects par rapport à l'intention. | BLOQUANT (token cassé) | Utiliser `var(--st-semantic-surface-subtle)` (défini) ou `var(--st-semantic-border-subtle)` selon l'effet voulu. |
| 4 | WaterfallChart | **Type `total` non vérifié vs cumul.** Un bar `total` réinitialise `cumulative = d.value` (valeur absolue saisie), ancré à zéro, *sans* contrôler qu'elle égale le cumul courant. Reproduit : suite `100 → +60 → -40` (cumul réel 120) avec un `Final` saisi à 999 affiche une barre 0→999 ; **le connecteur arrive à 120, la barre totale montre 999, sans avertissement** → graphe trompeur. | MAJEUR | Soit auto-calculer la barre `total` à partir du cumul courant (option `autoTotal`), soit documenter explicitement que `value` d'un `total` est ignorée/recalculée. À minima exposer un dev-warning si `value !== cumulative`. |
| 5 | KpiCard | **Sémantique `format="percent"` piège.** Intl multiplie par 100 → il faut passer `0.42` pour afficher « 42 % » (confirmé : `0.426 → "42.6%"`). Le JSDoc l.32 ne le précise pas ; un appelant passant `42` obtiendra « 4 200 % ». Idem `delta` en mode percent (l.89-94) : `delta: 0.12 → +12%`. | MAJEUR | Documenter dans le JSDoc que value/delta percent attendent une **fraction** (0–1), pas un pourcentage. Aligner les exemples des docs. |
| 6 | FunnelChart | **Trapèze s'inverse si la suite n'est pas monotone décroissante.** `botHalf` dérive de `data[i+1]` ; si une étape *augmente* (`value[i+1] > value[i]`), le bas du trapèze devient plus large que le haut → l'entonnoir s'élargit, ce qui contredit la sémantique « funnel » et brouille la lecture. Aucune garde ni tri. | MAJEUR | Documenter l'hypothèse de monotonie décroissante, et/ou clamper `botHalf ≤ topHalf` (forme strictement décroissante) ou trier optionnellement. |
| 7 | GaugeChart | **Orientation par défaut contre-intuitive.** Défauts `startAngle=180, endAngle=360` → en SVG (sin vers le bas) l'arc trace le **demi-cercle SUPÉRIEUR** ; geometry calcule `vbTop=2, vbHeight=108` et place valeur/label/hub au **bas** du viewBox (y≈98–110). C'est une jauge « bol inversé » (ouverture en bas) là où l'attendu BI est une demi-jauge classique ouverture en haut (180→0 ou -180→0). | MAJEUR | Revoir les angles par défaut pour une demi-jauge standard (p. ex. `startAngle=180, endAngle=360` avec repère trigo inversé, ou documenter/illustrer l'orientation réelle). Vérifier non-clip de l'aiguille (`needle` pointe à `r+thickness/2`, hub au centre-bas). |
| 8 | TreemapChart | **Labels en blanc codé en dur + pas de clip.** L.356/363 : `fill: var(--st-component-treemapChart-labelColor, #fff)` et `valueColor, #fff`. (a) `#fff` en fallback ≈ Donut/Funnel mais ici **pas de garantie de contraste** : catégories claires (category jaune/clair) + texte blanc = illisible (WCAG). (b) Le texte n'est pas tronqué/clippé au rect → débordement sur les cellules voisines pour labels longs (seul un seuil `LABEL_MIN_W=44` masque les très petites cellules). | MAJEUR | (a) Utiliser un token texte sur fond data garantissant le contraste, ou un `text-inverse`/`text-primary` selon le ton. (b) Ajouter `clip-path`/`textLength` ou tronquer le label à la largeur du rect. |
| 9 | FunnelChart | **Contraste labels sur segments.** L.270/277 : labels/valeurs en `text-inverse`/`#fff` posés *sur* les couleurs catégorielles. Pour les tons clairs de la palette `data-category*`, blanc sur clair échoue WCAG AA. Même classe de problème que #8. | MAJEUR | Choisir la couleur de texte en fonction de la luminance du ton (ou n'autoriser le label intra-segment que pour les tons sombres ; sinon label externe). |
| 10 | GaugeChart | **`aria-valuetext` ne communique pas la bande de seuil.** Avec `thresholds`, le lecteur d'écran entend « Score: 55 » sans savoir que 55 tombe dans la bande `warning`. L'info de zone (succès/alerte/erreur) — la valeur métier de la jauge — est invisible en a11y. | MAJEUR | Inclure le ton/label de la bande active dans `aria-valuetext` (p. ex. « Score : 55, zone alerte »). |

---

## Constats complémentaires (hors top-10)

| Composant | Constat | Sévérité | Correction |
|-----------|---------|----------|------------|
| ComboChart / WaterfallChart vs FunnelChart / TreemapChart | **Parité `aria-hidden` des légendes incohérente.** Combo + Waterfall : `<ul …__legend aria-hidden="true">`. Funnel + Treemap : légende **non** masquée → doublon lu par le lecteur d'écran avec le `ChartDataList`. | MINEUR | Uniformiser : légende décorative `aria-hidden="true"` partout (les valeurs sont déjà dans `ChartDataList`). |
| TreemapChart | `role="group"` sur le conteneur visuel sans descendant focusable. `group` n'apporte pas de sémantique exploitable ici ; les autres charts utilisent `role="img"`. | MINEUR | Passer à `role="img"` (parité Bar/Line/Donut/Funnel) puisque le SVG est `aria-hidden` et l'accessibilité passe par `ChartDataList`. |
| KpiCard | `ariaLabel` (l.118-122) concatène `unit` après `formattedValue` : pour un format `currency`/`percent` déjà autosuffisant, ajouter `unit` est redondant/contradictoire ; et `formattedDelta` colle au `trendLabel` même quand `trend` explicite contredit le signe (delta +5, trend down → « +5% en baisse »). | MINEUR | Ne pas inclure `unit` quand `format ∈ {currency, percent}` ; cohérer signe delta ↔ trendLabel quand `trend` est forcé. |
| WaterfallChart | Inférence de type sur `d.value >= 0 ? increase : decrease` : une étape à **valeur exactement 0** est classée `increase` (barre de hauteur `Math.max(h,0.5)` = filet à 0.5px) — visuellement un artefact, pas un « no-op ». | MINEUR | Traiter `value === 0` comme cas neutre (pas de barre, ou ton neutre) ou documenter. |
| ComboChart | Tons par défaut des lignes : `category${((bars.length + li) % 8) + 1}`. Si `bars.length` ≥ 8 ou combinaisons spécifiques, une ligne peut **réutiliser la couleur d'une barre** → ambiguïté catégorielle (contraste catégoriel). Pas de dé-duplication bar/line. | MINEUR | Documenter, ou décaler/différencier les palettes barres vs lignes (la forme bar/line aide déjà, mais la couleur peut collider). |
| GaugeChart | Bande de seuils : si le dernier `threshold.value < max`, un segment final est ajouté avec le **ton du dernier seuil** (l.121-124). Comportement raisonnable mais non documenté ; un seuil unique `{value: 40}` colore donc 0→max entièrement de ce ton, pas seulement 0→40. | MINEUR | Documenter la sémantique « la bande s'étend jusqu'au seuil suivant ou au max ». |
| KpiCard | `value` typé `number | string` ; en `string` (« N/A ») les formats currency/percent sont ignorés silencieusement (passthrough). OK fonctionnellement, mais `format` devient un no-op trompeur. | MINEUR | Documenter que `format` ne s'applique qu'aux `number`. |

---

## Points conformes (vérifiés, RAS)

- **Squarify (TreemapChart)** : algorithme Bruls-Huizing-van-Wijk correct — reproduit en Node : couverture 100 % de l'aire, ratios d'aspect bornés (worstAR ≈ 2.0 sur 50/30/20 ; cas dégénéré 1000/1/1/1 → couverture 100 %). `sumValue` agrège bien les enfants ; filtrage des valeurs ≤ 0. Bon.
- **Waterfall cumul/baseline** : `increase`/`decrease` flottent depuis le cumul courant, `total` ancré à zéro, connecteurs au niveau `computed[i].end`, ligne `zeroY` présente. Cumul correct (hors réserve #4 sur la confiance du total).
- **ComboChart double-axe** : `leftScale` inclut zéro (barres) ; `rightScale` padding façon LineChart — **échelles réellement indépendantes**, ticks droite positionnés sur le domaine droit. Correct.
- **Funnel % ofFirst vs ofPrevious** : `ofFirst` = `value/first`, `ofPrevious` = `value/value[i-1]` ; division par zéro → `NaN` → « — ». Premier élément `ofPrevious` = 100 % (cohérent). Correct.
- **Gauge clamp** : `clamped = min(max(value,min),max)`, `aria-valuenow` clampé (testé 150→100, -20→0). `frac` géré pour `span=0`. Bon.
- **KpiCard Intl** : currency/percent/number via `Intl.NumberFormat`, signe delta `+`/`-`, trend dérivé du signe, `prefers-reduced-motion` respecté (Gauge/Combo/Funnel/Waterfall/Treemap ont tous le media query). Bon.
- **Types exportés** : `index.ts` exporte tous les types publics (datum + tone + format/threshold/series) — parité complète avec Bar/Line/Donut.
- **ChartDataList** : présent et correct dans les 6 (visually-hidden, `aria-label` « Data values for … »).
- **Empty data** : Treemap/Funnel/Waterfall/Combo gèrent `data: []` sans crash (tests dédiés Treemap/Waterfall verts ; Funnel/Combo idem par construction `data.length === 0 → []`).
