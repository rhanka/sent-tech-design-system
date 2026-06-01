<script lang="ts">
  import { AspectRatio, Badge } from "@sentropic/design-system-svelte";
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

  <section class="docs-section">
    <h2>Exemples</h2>
    <div class="docs-ar-grid">
      <AspectRatio ratio="16/9"><div class="docs-ar-fill">16 / 9</div></AspectRatio>
      <AspectRatio ratio="1/1"><div class="docs-ar-fill">1 / 1</div></AspectRatio>
      <AspectRatio ratio="4/3"><div class="docs-ar-fill">4 / 3</div></AspectRatio>
    </div>
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

<style>
  .docs-ar-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
  .docs-ar-fill {
    align-items: center;
    background: var(--st-semantic-surface-subtle);
    border: 1px dashed var(--st-semantic-border-subtle);
    color: var(--st-semantic-text-secondary);
    display: flex;
    font-weight: 600;
    justify-content: center;
  }
</style>
