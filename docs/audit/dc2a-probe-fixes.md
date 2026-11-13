# PR 277 — A14, A9 et corrections du probe h-cond

Les cartes de composant restent **460 × 200**, y compris repliées. Kicker et
pied ont une ligne, le titre au plus deux, corps et détail partagent le
reste. Une ligne de corps est réservée quand du contenu existe ; le titre
peut alors être borné à une ligne. Les ellipses sont mesurées et préfèrent
une limite de mot. Le texte complet reste dans le titre, la description
accessible et le repli textuel des relations. Les diagnostics de troncature
sont informatifs, avec slot et nombre de caractères masqués. Les zones
dépliées conservent leur taille calculée autour des enfants et leurs budgets
de texte bornés. A14 remplace la croissance des cartes de A5/A11.

A9 est **résolu : V1, minimum vertical 72 / horizontal 96**. Les valeurs des
tokens étaient déjà celles de V1 ; le test d'acceptation les épingle
désormais explicitement. Les paramètres de croissance par flux restent en
place.

## Méthode et témoin négatif

Source navigateur conservée :
/home/antoinefa/src/h2a/tmp/h-cond/appctx-dossier/ds0401-probe-last.md,
captures-ds0401/measurements.json et captures-ds0401/*.png, candidat
26f6182e56df6c44d6356c8c87a79fffb3883b02. Aucun de ces artefacts n'est remplacé.

Les nouvelles mesures ci-dessous viennent de **jsdom**, sur les goldens
h-cond, dans **Svelte et Vue**. Les deux hôtes produisent exactement les
mêmes 8 lignes numériques ; le JSON joint contient les **16 observations**
avec toute leur précision. Les largeurs de labels Noto Sans proviennent du
probe et sont épinglées sur la grille 1/64 ; sa boîte de texte de 24 px sert
au contrôle de ligne. Les positions sont celles du DOM monté et des
waypoints émis. jsdom ne calcule pas les pixels d'une police : ces chiffres
ne constituent pas un nouveau passage Chromium.

Le test de bbox DOM couvre séparément les rectangles rendus, texte Range,
icônes/badges, boutons, règles et strokes SVG, avec conversion depuis le
zoom et arrondi extérieur au 1/64. Le fit garde 1 px écran pour le stroke
non redimensionné et l'arrondi CSS. Le plancher 0,45 ne bloque plus Ajuster ;
le plafond reste 0,62, soit 100 % sur le contrôle.

Le probe d'origine signalait 6 gros dépassements de fit, plus le texte de
rel-arch-16 haut de **0,62 px écran** sur desktop (boîte de texte 24 dans un
chip de 22). Les tests font évoluer ensemble la mesure et le pitch CSS :
**24 / 24 px**, sans dépassement dans le témoin. Les pieds touchés étaient
rel-arch-06/09 et rel-ont-10/14. Leur bande complète, règle incluse, devient
un obstacle de placement pour les labels, y compris dans le replay.

Le premier passage des nouvelles régressions échouait avant correction.
Un contre-test isolé a ensuite rétabli les deux causes dans les sources :
plancher de fit et absence des bandes de pied. Résultat : **16 échecs**,
**12 de fit et 4 de pieds** dans les deux hôtes. Les sources corrigées ont
été restaurées octet pour octet et canvas reconstruit avant la validation
finale. Les 24 cas de la matrice passent avec les corrections.

## Géométrie par vue — identique dans les deux hôtes

Bbox en unités du diagramme ; cadre et marge en px écran. La marge minimale
soustrait déjà 0,75 px pour le stroke de 1,5 px. Tolérance de cadrage du
probe : −0,5 px. Les dimensions sont arrondies ici à 0,001 ; le JSON garde
les valeurs exactes.

| Vue | Bbox L × H | Cadre L × H | Zoom appliqué | Marge minimale |
| --- | ---: | ---: | ---: | ---: |
| 1440 architecture/unfolded | 4370 × 2256 | 1206 × 678.375 | 0.276 | 0.25 |
| 390 architecture/unfolded | 4370 × 2256 | 340 × 191.25 | 0.077 | 0.25 |
| 1440 architecture/folded | 1340 × 664 | 1206 × 413.688 | 0.62 | 0.254 |
| 390 architecture/folded | 1340 × 664 | 340 × 191.25 | 0.252 | 0.25 |
| 1440 ontology/unfolded | 3665.859 × 1572 | 1206 × 678.375 | 0.328 | 0.25 |
| 390 ontology/unfolded | 3665.859 × 1572 | 340 × 191.25 | 0.092 | 0.25 |
| 1440 ontology/folded | 1664 × 808 | 1206 × 502.969 | 0.62 | 0.254 |
| 390 ontology/folded | 1664 × 808 | 340 × 191.25 | 0.203 | 0.25 |

## Invariants par vue — identiques dans les deux hôtes

« Collisions » = label/carte, label/pied (règle incluse), label/label.
Le débordement de texte compare les lignes montées à leur largeur mesurée ;
les hauteurs HTML suivent exactement les line boxes du modèle partagé.
Le texte complet et les références aria-describedby sont vérifiés dans le
DOM et dans le repli textuel. Les suites existantes contrôlent aussi les
en-têtes, le confinement, les trajets et l'arrangement 390/1440.

| Vue | Cartes 460 × 200 | Débordements texte | Labels présents | Collisions | Icônes / nœuds | Écart frère min. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1440 architecture/unfolded | 16/16 | 0 | 16 | 0 / 0 / 0 | 23/23 | 72 |
| 390 architecture/unfolded | 16/16 | 0 | 16 | 0 / 0 / 0 | 23/23 | 72 |
| 1440 architecture/folded | 4/4 | 0 | 3 | 0 / 0 / 0 | 4/4 | 72 |
| 390 architecture/folded | 4/4 | 0 | 3 | 0 / 0 / 0 | 4/4 | 72 |
| 1440 ontology/unfolded | 14/14 | 0 | 23 | 0 / 0 / 0 | 19/19 | 72 |
| 390 ontology/unfolded | 14/14 | 0 | 23 | 0 / 0 / 0 | 19/19 | 72 |
| 1440 ontology/folded | 5/5 | 0 | 6 | 0 / 0 / 0 | 5/5 | 72 |
| 390 ontology/folded | 5/5 | 0 | 6 | 0 / 0 / 0 | 5/5 | 72 |

Les 14 goldens owner (dont 12 README) vérifient également le format fixe,
les icônes, les pieds complets en title/aria et l'absence de refus dans les
deux hôtes. Les goldens d'anatomie A8 incluent les descriptions accessibles
et les line boxes exactes ; le label PR « anatomy change » est présent.

## Vérification finale

- Svelte : **361 tests**, 8 fichiers, tous passants.
- Vue, ERD et tests communs aux hôtes : **259 tests**, 9 fichiers, tous passants.
- Canvas : **523 passants, 1 ignoré**, 48 fichiers ; aucun update de golden pendant ce passage final.
- Component-index : **139 tests**, 15 fichiers ; **430 artefacts à jour** après génération et index:check.
- Layering : **3 tests passants** ; licences : **22 packages** valides, notices présentes dans les tarballs.
- Builds canvas, Svelte, Vue et index ; contrôles TypeScript canvas/Vue et les deux configurations svelte-check : passants. Svelte : 0 erreur, 26 avertissements dans la configuration principale, 0 dans la configuration parity.
- Contrat d'anatomie et git diff --check : passants.

Le défilement de la page et les boîtes d'encre réellement composées seront
mesurés par h-cond au prochain passage navigateur ; jsdom ne fournit pas ces
mesures.

Données complètes : [dc2a-probe-matrix.json](dc2a-probe-matrix.json).
Regénération : exécuter le seul fichier diagram-probe-regressions.test.ts
avec DC2A_PROBE_REPORT pointant vers ce JSON. Les commandes npm de cette
intervention utilisent le cache imposé. Aucun navigateur n'a été lancé.
