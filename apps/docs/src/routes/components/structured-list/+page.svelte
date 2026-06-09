<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import type { NodeSpec } from "$lib/framework/examples";
  import { Badge, type StructuredListItem } from "@sentropic/design-system-svelte";

  const items: StructuredListItem[] = [
    { key: "Nom", value: "Sentropic Design System" },
    { key: "Version", value: "0.9.0" },
    { key: "Licence", value: "Propriétaire" },
    { key: "Composants", value: "70+" }
  ];

  // Démo NodeSpec neutre -> rendue dans le framework actif (onglets svelte/react/vue).
  const exampleDemo: NodeSpec[] = [{ comp: "StructuredList", props: { items } }];
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
  <TabbedExample nodes={getExample("structuredlist")?.nodes ?? []} />


  <section class="docs-section">
    <h2>Exemple</h2>
    <TabbedExample nodes={exampleDemo} />
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
