<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import TriRender from "$lib/framework/TriRender.svelte";
  import { Badge, Highlight } from "@sentropic/design-system-svelte";
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
  <TriRender nodes={getExample("highlight")?.nodes ?? []} label="Aperçu live" />


  <section class="docs-section">
    <h2>Tonalités</h2>
    <div class="docs-highlight-stack">
      <Highlight title="À noter">
        <p>Encart neutre, accent sur la couleur d'action primaire du thème.</p>
      </Highlight>
      <Highlight tone="info" title="Information">
        <p>Contexte utile, non bloquant.</p>
      </Highlight>
      <Highlight tone="warning" title="Attention">
        <p>Point de vigilance à signaler.</p>
      </Highlight>
      <Highlight tone="error" title="Important">
        <p>Risque ou erreur à corriger.</p>
      </Highlight>
    </div>
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

<style>
  .docs-highlight-stack {
    display: grid;
    gap: 0.75rem;
  }
</style>
