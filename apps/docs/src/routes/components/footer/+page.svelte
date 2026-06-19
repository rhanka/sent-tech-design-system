<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Structure</p>
    <div class="docs-hero-title">
      <h1>Footer</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Le composant <code>Footer</code> fournit la structure du pied de page applicatif
      (région <code>contentinfo</code>) : marque, colonnes de liens, copyright et liens
      légaux. Complète l'app shell (Header + Footer).
    </p>
  </section>

  <TabbedExample
    nodes={getExample("footer")?.nodes ?? []}
    title="Exemple complet"
    code={getExample("footer")?.code}
  />

  <TabbedExample
    nodes={getExample("footerMinimal")?.nodes ?? []}
    title="Minimal (copyright seul)"
    code={getExample("footerMinimal")?.code}
  />

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>copyright</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Pied de page"</code></td></tr>
        <tr><td><code>brand</code></td><td><code>Snippet</code> / <code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>columns</code></td><td><code>Snippet</code> / <code>Array</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>legalLinks</code></td><td><code>Array&lt;&lbrace;label, href&rbrace;&gt;</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>legal</code></td><td><code>Snippet</code> (Svelte)</td><td><em>optionnel</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td>Autres attributs</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>propagés sur <code>&lt;footer&gt;</code></td></tr>
      </tbody>
    </table>
  </section>
</div>
