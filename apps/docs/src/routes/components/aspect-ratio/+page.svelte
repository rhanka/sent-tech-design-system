<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import type { NodeSpec } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";

  // Démo NodeSpec neutre -> rendue dans le framework actif (onglets svelte/react/vue).
  // Styles inlines (les styles scopés de page ne traversent pas l'island).
  const fillStyle =
    "align-items:center;background:var(--st-semantic-surface-subtle);border:1px dashed var(--st-semantic-border-subtle);color:var(--st-semantic-text-secondary);display:flex;font-weight:600;justify-content:center;height:100%;width:100%";
  const examplesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { style: "display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))" },
      children: [
        { comp: "AspectRatio", props: { ratio: "16/9" }, children: [{ el: "div", props: { style: fillStyle }, children: ["16 / 9"] }] },
        { comp: "AspectRatio", props: { ratio: "1/1" }, children: [{ el: "div", props: { style: fillStyle }, children: ["1 / 1"] }] },
        { comp: "AspectRatio", props: { ratio: "4/3" }, children: [{ el: "div", props: { style: fillStyle }, children: ["4 / 3"] }] }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Layout</p>
    <div class="docs-hero-title">
      <h1>AspectRatio</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Conteneur qui maintient un <strong>ratio d'aspect</strong> constant (via la propriété
      CSS <code>aspect-ratio</code>) pour médias, images ou embeds responsives. Le contenu
      remplit la boîte.
    </p>
  </section>
  <TabbedExample nodes={getExample("aspectratio")?.nodes ?? []} />


  <section class="docs-section">
    <h2>Exemples</h2>
    <TabbedExample nodes={examplesDemo} />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead><tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr></thead>
      <tbody>
        <tr><td><code>ratio</code></td><td><code>string</code> (ex. <code>"16/9"</code>)</td><td><code>"16/9"</code></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td>le contenu</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>
</div>
