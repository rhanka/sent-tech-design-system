<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import TriRender from "$lib/framework/TriRender.svelte";
  import { Badge, StructuredList, type StructuredListItem } from "@sentropic/design-system-svelte";

  const items: StructuredListItem[] = [
    { key: "Nom", value: "Sentropic Design System" },
    { key: "Version", value: "0.9.0" },
    { key: "Licence", value: "Propriétaire" },
    { key: "Composants", value: "70+" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>StructuredList</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Liste structurée de paires <strong>clé / valeur</strong> (sémantique
      <code>&lt;dl&gt;</code>/<code>&lt;dt&gt;</code>/<code>&lt;dd&gt;</code>). La valeur
      accepte une chaîne ou un <code>Snippet</code>.
    </p>
  </section>
  <TriRender nodes={getExample("structuredlist")?.nodes ?? []} label="Aperçu live" />


  <section class="docs-section">
    <h2>Exemple</h2>
    <StructuredList {items} />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead><tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr></thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>StructuredListItem[]</code></td><td>requis</td></tr>
        <tr><td><code>bordered</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>StructuredListItem</code> = <code>{`{ key: string; value: string | Snippet }`}</code>.
    </p>
  </section>
</div>
