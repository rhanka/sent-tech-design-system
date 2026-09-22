# Plan de migration graph/dataviz — ordre d’exécution ratifié

_Date : 18 septembre 2026. Statut : planification active ; M1 a déjà rapatrié `@sentropic/graph` et `@sentropic/dataviz-core` sans refonte._

## Décision d’ordre

La première version de diagrammes **ne réimplémente pas un moteur Sentropic**. Elle s’appuie explicitement sur **xyflow** pour le canevas et sur **bpmn-js** pour le parcours BPMN demandé. La consolidation `graph-core` / `graph-engine` et le moteur propriétaire restent des travaux ultérieurs, après une première verticale utilisable et ses preuves de comportement.

La migration conservatoire graph/dataviz peut continuer en parallèle, mais elle ne doit pas remplacer ou bloquer cette verticale. Le travail est donc organisé en deux étapes strictes :

1. **Étape A — intégration XYFlow + BPMN-js** : rendre, éditer, importer/exporter et qualifier une première verticale dans le design system.
2. **Étape B — capitalisation spécifique Sentropic** : extraire seulement les contrats et comportements effectivement validés en A, puis remplacer progressivement les dépendances de rendu par les sous-chemins de la cible consolidée. Aucun « moteur maison » n’est commencé avant les critères de sortie A.

## Étape A — verticale XYFlow + BPMN-js

### Objectif produit

Offrir un éditeur de diagramme thème-portable utilisant les primitives DS et un cas BPMN éditable/documenté. La première version priorise les interactions réelles : viewport, sélection, création de liens, déplacement, clavier, palette, inspecteur, undo/redo, import/export BPMN, erreurs de conversion et état non sauvegardé.

### Intégrations explicitement autorisées

Les dépendances suivantes sont **explicites, déclarées et isolées** ; elles ne sont pas des dépendances transitives involontaires :

- `@xyflow/svelte` pour le pilote Svelte ;
- `bpmn-js` et son socle `diagram-js` pour le scénario BPMN ;
- les adaptations React/Vue/Angular sont décidées à partir du même contrat de scène, sans prétendre qu’un package xyflow officiel existe pour Angular.

Elles ne sont importées ni par `@sentropic/dataviz-*`, ni par les barrels des composants DS, ni par les noyaux purs. Les exports doivent permettre le chargement différé des éditeurs.

### Contrat transversal à figer avant UI

```ts
export interface DiagramDocumentV1 {
  documentId: string;
  revision: number;
  profile: "generic" | "bpmn";
  nodes: readonly DiagramNodeV1[];
  edges: readonly DiagramEdgeV1[];
}

export interface DiagramCommandV1 {
  expectedRevision: number;
  type: string;
  targetId?: string;
  payload: unknown;
}
```

Ce contrat est indépendant du format xyflow et du XML BPMN. Les adaptateurs effectuent des conversions avec un rapport : `converted`, `preserved-extension`, `degraded`, `ignored`, `unsupported`. L’état métier et la persistance restent derrière des ports.

### Lots A0–A6

| Lot | Résultat | Critère de sortie |
|---|---|---|
| A0 — spike contrôlé | Host Svelte isolé avec CSP documentée, xyflow et bpmn-js chargés à la demande. | Mesure navigateur : politique CSP, violations, taille initiale/lazy et SSR placeholder capturés. |
| A1 — chrome DS | `DiagramShell`, toolbar, palette, inspector, minimap/outline, états vides/erreur, tokens et thèmes. | Aucun style visuel du DS réimplémenté ; navigation clavier et focus observables. |
| A2 — xyflow générique | Scène générique, pan/zoom, sélection, drag, connexion, handles, commandes/revisions, undo/redo. | Une interaction produit une commande typée et un undo atomique ; aucune mutation d’état métier hors contrôleur. |
| A3 — BPMN | Viewer/modeler bpmn-js encapsulé, import/export XML+DI et rapport de conversion. | Fixture BPMN importée, modifiée, exportée ; pertes ou extensions signalées. |
| A4 — intégration quatre frameworks | Contrat identique ; pilotes adaptés au framework. | Svelte est le pilote de référence ; React/Vue/Angular ne sont déclarés équivalents qu’après scénario vertical réellement exécuté. |
| A5 — sécurité/a11y | CSP, clavier, focus, IME, reduced motion, SSR et thèmes. | Gaps framework explicités ; aucune déclaration de parité seulement par types. |
| A6 — docs & migration | Pages docs, recettes privées, chemin de migration graphify. | Une application consommatrice utilise l’API publique, sans importer les détails xyflow/bpmn-js. |

### CSP : condition de passage obligatoire

La mesure existante sous `style-src-attr 'none'` a trouvé une violation xyflow au chargement. Donc :

- la scène statique SVG CSP-safe demeure disponible et est le fallback/documentation ;
- l’éditeur xyflow est derrière une capability explicite (`interactiveDiagram`), désactivable par host ;
- aucune dérogation CSP globale n’est ajoutée ; une exception limitée doit être mesurée, documentée et validée avant activation ;
- bpmn-js est soumis au même spike, car son DOM et ses styles doivent être observés dans le navigateur réel.

## Étape B — capitalisation spécifique Sentropic

La cible consolidée à 14 packages est conservée comme architecture de publication, non comme ordre de build :

- `@sentropic/graph-core` : modèle, profils, processing, codecs ;
- `@sentropic/graph-engine` : scène, routing, layout, worker, compilation ;
- `@sentropic/graph` : API historique et backends par sous-chemins ;
- `@sentropic/graph-editor` et `@sentropic/graph-export` isolés ;
- quatre adaptateurs graph et les cinq packages `dataviz-*` conservés.

Les extractions ne commencent qu’après A0–A3. Chaque extraction doit prouver qu’elle retire une duplication réelle entre intégrations, conserve les contrats publics et ne fait pas dépendre dataviz du moteur, de l’éditeur ou de l’export graph.

## Migration en parallèle : M1 dataviz / graph

| Tranche | Action conservatoire | Garde-fou |
|---|---|---|
| M1.1 | Finaliser les cinq packages dataviz dans le workspace, sans renommage d’API. | `@sentropic/dataviz-*` inchangés ; pins docs/lockfile synchronisés. |
| M1.2 | Qualifier tarballs, exports, CSS, peers et SSR par framework. | Aucun rattachement à xyflow/bpmn-js. |
| M1.3 | Rapatrier les consommateurs de `@sentropic/graph` derrière son API existante. | Graphify devient consommateur après preuve, pas avant. |
| M2 | Extraire les contrats validés par l’étape A vers `graph-core`/`graph-engine`. | Pas de deuxième implémentation active divergente. |

## Gates et dépendances d’exécution

1. Finaliser d’abord la spécification et le plan de l’étape A par la consultation Astra xhigh demandée.
2. Obtenir le consensus Fable 5.1 sur ce plan — en particulier CSP, dépendances explicites, 4-frameworks et frontières dataviz.
3. Seulement alors lancer le build Astra medium de A0/A1, puis les lots séquentiels A2–A6.
4. Les consultations doivent utiliser exactement Astra et Fable 5.1 : aucun modèle local différent ne peut être présenté comme leur avis.

## Invariants

- D8 : dataviz/charts ne tirent jamais la pile graph interactive.
- Les noms `@sentropic/graph` et `@sentropic/dataviz-*` sont préservés.
- Les deux dépendances de la première étape sont visibles dans les manifests et isolées des entrées légères ; elles ne deviennent jamais implicites.
- Les références de couverture ELK, Graphviz et JointJS restent des références jusqu’à une décision explicite distincte.
- Les recettes et les specs restent exhaustives, même si elles ne deviennent pas des packages publiables.
