<script lang="ts">
  import {
    Badge,
    ForceGraph,
    type ForceGraphNode,
    type ForceGraphEdge
  } from "@sentropic/design-system-svelte";

  // Petit graphe d'ontologie de démo : trois groupes (communautés).
  const nodes: ForceGraphNode[] = [
    { id: "person", label: "Person", group: "core", weight: 2 },
    { id: "org", label: "Organisation", group: "core", weight: 2 },
    { id: "project", label: "Project", group: "core", weight: 1.5 },
    { id: "alice", label: "Alice", group: "people" },
    { id: "bob", label: "Bob", group: "people" },
    { id: "acme", label: "Acme", group: "orgs" },
    { id: "globex", label: "Globex", group: "orgs" },
    { id: "atlas", label: "Atlas", group: "projects" }
  ];

  const edges: ForceGraphEdge[] = [
    { source: "alice", target: "person", relation: "instance_of" },
    { source: "bob", target: "person", relation: "instance_of" },
    { source: "acme", target: "org", relation: "instance_of" },
    { source: "globex", target: "org", relation: "instance_of" },
    { source: "atlas", target: "project", relation: "instance_of" },
    { source: "alice", target: "acme", relation: "works_at" },
    { source: "bob", target: "globex", relation: "works_at" },
    { source: "acme", target: "atlas", relation: "owns" },
    { source: "bob", target: "atlas", relation: "contributes_to", weak: true }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <h1>
      ForceGraph
      <Badge tone="neutral">Documenté</Badge>
    </h1>
    <p>
      Graphe à force dirigée pour visualiser une ontologie (nœuds + liens). La
      simulation de force est <strong>autonome</strong> (aucune dépendance type
      d3 ajoutée au paquet) : répulsion entre nœuds, ressorts sur les liens,
      gravité douce vers le centre, refroidissement progressif. Nœuds colorés
      par <code>group</code>/<code>tone</code> (palette data-vis), focusables au
      clavier, tooltip au survol/focus, liens faibles en pointillé. Le layout
      est déterministe (graine fixe) et figé sous
      <code>prefers-reduced-motion</code>.
    </p>
  </section>

  <section class="docs-section">
    <h2>Exemple</h2>
    <div class="docs-graph-box">
      <ForceGraph {nodes} {edges} label="Ontologie de démo" width={520} height={380} />
    </div>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>nodes</code></td><td><code>ForceGraphNode[]</code></td><td>requis</td></tr>
        <tr><td><code>edges</code></td><td><code>ForceGraphEdge[]</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td><code>480</code> / <code>360</code></td></tr>
        <tr><td><code>nodeRadius</code></td><td><code>number</code></td><td><code>7</code></td></tr>
        <tr><td><code>showLabels</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>iterations</code></td><td><code>number</code></td><td><code>300</code></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>ForceGraphNode</code> =
      <code>{`{ id, label?, group?, tone?, weight?, fx?, fy? }`}</code>.
      <code>ForceGraphEdge</code> =
      <code>{`{ source, target, relation?, weak? }`}</code>.
      Les nœuds partageant un <code>group</code> reçoivent la même tonalité ;
      <code>tone</code> force une couleur explicite ; <code>weak: true</code>
      affiche un lien faible (pointillé).
    </p>
  </section>
</div>

<style>
  .docs-graph-box { max-width: 36rem; }
</style>
