<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge, SkipLink } from "@sentropic/design-system-svelte";
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation · a11y</p>
    <div class="docs-hero-title">
      <h1>SkipLink</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Le <code>SkipLink</code> (lien d'évitement) permet aux utilisateurs clavier de
      sauter la navigation et d'atteindre directement le contenu principal. Il est
      <strong>hors écran jusqu'au focus clavier</strong>, puis apparaît en haut de page.
      À placer en tout premier élément focusable du document.
    </p>
  </section>
  <TabbedExample nodes={getExample("skiplink")?.nodes ?? []} />


  <section class="docs-section">
    <h2>Démo</h2>
    <p class="docs-demo-context">
      Appuie sur <kbd>Tab</kbd> en haut de cette page : le lien apparaît. Ici, rendu
      avec une cible personnalisée.
    </p>
    <SkipLink href="#main-content">Aller au contenu principal</SkipLink>
    <p class="docs-demo-context">
      (Le lien est en <code>position: fixed</code> ; il ne s'affiche qu'au focus.)
    </p>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>href</code></td><td><code>string</code></td><td><code>"#main-content"</code></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>"Aller au contenu principal"</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>
</div>
