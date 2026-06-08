<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge, Quote } from "@sentropic/design-system-svelte";
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Layout · éditorial</p>
    <div class="docs-hero-title">
      <h1>Quote</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>Quote</code> met en forme une citation éditoriale (<code>&lt;figure&gt;</code> +
      <code>&lt;blockquote&gt;</code>) avec attribution optionnelle (auteur, source).
    </p>
  </section>
  <TabbedExample nodes={getExample("quote")?.nodes ?? []} />


  <section class="docs-section">
    <h2>Avec attribution</h2>
    <Quote author="Antoine de Saint-Exupéry" source="Citadelle" cite="https://fr.wikipedia.org/wiki/Citadelle">
      La perfection est atteinte non pas lorsqu'il n'y a plus rien à ajouter, mais
      lorsqu'il n'y a plus rien à retirer.
    </Quote>
  </section>

  <section class="docs-section">
    <h2>Sans attribution</h2>
    <Quote>Un bon design system est invisible : on ne voit que le produit.</Quote>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>author</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>source</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>cite</code></td><td><code>string</code> (URL)</td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td>le texte cité</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>
</div>
