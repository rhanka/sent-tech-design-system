<script lang="ts">
  import { Badge, CodeSnippet } from "@sentropic/design-system-svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const block = `import { Button } from "@sentropic/design-system-svelte";\n\n<Button variant="primary">Envoyer</Button>`;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>CodeSnippet</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Affiche du code en <strong>bloc</strong> (avec bouton de copie) ou <strong>inline</strong>.
      S'appuie sur <code>CopyButton</code> pour la copie.
    </p>
  </section>
  <FrameworkPreview example="codesnippet" title="Aperçu live" />


  <section class="docs-section">
    <h2>Bloc</h2>
    <CodeSnippet code={block} language="svelte" />
  </section>

  <section class="docs-section">
    <h2>Inline</h2>
    <p>
      Installe via <CodeSnippet code="npm i @sentropic/design-system-svelte" inline /> puis importe.
    </p>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead><tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr></thead>
      <tbody>
        <tr><td><code>code</code></td><td><code>string</code></td><td>requis</td></tr>
        <tr><td><code>language</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>inline</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>copyable</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>copyLabel</code> / <code>copiedLabel</code></td><td><code>string</code></td><td><code>"Copy"</code> / <code>"Copied"</code></td></tr>
      </tbody>
    </table>
  </section>
</div>
