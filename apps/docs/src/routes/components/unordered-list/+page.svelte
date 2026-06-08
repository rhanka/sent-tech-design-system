<script lang="ts">
  import { Badge, UnorderedList } from "@sentropic/design-system-svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const items = [
    "Tokens stables",
    "Compilateur de thèmes",
    {
      content: "Primitives Svelte",
      children: ["Actions", "Formulaires", "Navigation"]
    },
    "Contrats marque blanche"
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>UnorderedList</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Liste à puces (non ordonnée), pendant d'<code>OrderedList</code>. Accepte des chaînes
      ou des objets <code>{`{ content, children }`}</code> pour l'imbrication.
    </p>
  </section>
  <FrameworkPreview example="unorderedlist" title="Aperçu live" />


  <section class="docs-section">
    <h2>Avec imbrication</h2>
    <UnorderedList {items} />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead><tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr></thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>(string | UnorderedListItem)[]</code></td><td>requis</td></tr>
        <tr><td><code>nested</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>
</div>
