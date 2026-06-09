<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import type { NodeSpec } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";

  // Démo décrite en arbre NodeSpec neutre -> rendue dans le framework actif
  // (la section bascule en onglets svelte/react/vue, comme les autres pages).
  const tonalitesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        {
          comp: "Highlight",
          props: { title: "À noter" },
          children: [{ el: "p", children: ["Encart neutre, accent sur la couleur d'action primaire du thème."] }]
        },
        {
          comp: "Highlight",
          props: { tone: "info", title: "Information" },
          children: [{ el: "p", children: ["Contexte utile, non bloquant."] }]
        },
        {
          comp: "Highlight",
          props: { tone: "warning", title: "Attention" },
          children: [{ el: "p", children: ["Point de vigilance à signaler."] }]
        },
        {
          comp: "Highlight",
          props: { tone: "error", title: "Important" },
          children: [{ el: "p", children: ["Risque ou erreur à corriger."] }]
        }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Layout · éditorial</p>
    <div class="docs-hero-title">
      <h1>Highlight</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>Highlight</code> est un encart de mise en avant (DSFR « Mise en avant »),
      avec titre optionnel et tonalité d'accent (<code>neutral</code>, <code>info</code>,
      <code>success</code>, <code>warning</code>, <code>error</code>).
    </p>
  </section>
  <TabbedExample nodes={getExample("highlight")?.nodes ?? []} />


  <section class="docs-section">
    <h2>Tonalités</h2>
    <TabbedExample nodes={tonalitesDemo} />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>tone</code></td><td><code>"neutral" | "info" | "success" | "warning" | "error"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td>le contenu</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>
</div>
