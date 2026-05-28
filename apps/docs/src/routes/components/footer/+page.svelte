<script lang="ts">
  import { Badge, Footer, Link } from "@sentropic/design-system-svelte";
</script>

{#snippet footerBrand()}
  <span class="docs-footer-brand">
    <img class="docs-footer-brand-mark" src="/SENT-logo-squared.svg" alt="" aria-hidden="true" />
    <span>Sentropic</span>
  </span>
{/snippet}

{#snippet footerColumns()}
  <div class="docs-footer-col">
    <span class="docs-footer-col-title">Produit</span>
    <Link href="/#components">Composants</Link>
    <Link href="/#foundations">Fondations</Link>
    <Link href="/#tokens">Tokens</Link>
  </div>
  <div class="docs-footer-col">
    <span class="docs-footer-col-title">Ressources</span>
    <Link href="/#contracts">Contrats</Link>
    <Link href="https://github.com/rhanka/sent-tech-design-system">GitHub</Link>
  </div>
{/snippet}

{#snippet footerLegal()}
  <Link href="/#legal">Mentions légales</Link>
  <Link href="/#privacy">Confidentialité</Link>
{/snippet}

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Structure</p>
    <h1>
      Footer
      <Badge tone="neutral">Documenté</Badge>
    </h1>
    <p>
      Le composant <code>Footer</code> fournit la structure du pied de page applicatif
      (région <code>contentinfo</code>) : marque, colonnes de liens, copyright et liens
      légaux. Comme <code>Header</code>, il est piloté par slots — le contenu est injecté
      par le parent. Complète l'app shell (Header + Footer).
    </p>
  </section>

  <section class="docs-section">
    <h2>Exemple complet</h2>
    <p class="docs-demo-context">
      Marque + deux colonnes de liens en zone de tête, copyright + liens légaux en barre du bas.
    </p>
    <Footer
      brand={footerBrand}
      columns={footerColumns}
      legal={footerLegal}
      copyright="© 2026 Sentropic. Tous droits réservés."
    />
  </section>

  <section class="docs-section">
    <h2>Minimal (copyright seul)</h2>
    <p class="docs-demo-context">
      Sans zone de tête : seule la barre du bas s'affiche.
    </p>
    <Footer copyright="© 2026 Sentropic." />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>copyright</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Pied de page"</code></td></tr>
        <tr><td><code>brand</code></td><td><code>Snippet</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>columns</code></td><td><code>Snippet</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>legal</code></td><td><code>Snippet</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td>Autres attributs</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>propagés sur <code>&lt;footer&gt;</code></td></tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .docs-footer-brand {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
    font-weight: 650;
    color: var(--st-semantic-text-primary);
  }
  .docs-footer-brand-mark { height: 1.25rem; width: 1.25rem; }
  .docs-footer-col {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .docs-footer-col-title {
    color: var(--st-semantic-text-primary);
    font-size: 0.8rem;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
</style>
