<script lang="ts">
  import { Badge, TreeView, type TreeNode } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let selected = $state("tokens");
  const nodes: TreeNode[] = [
    {
      id: "foundations",
      label: "Fondations",
      children: [
        { id: "tokens", label: "Tokens" },
        { id: "anatomy", label: "Anatomie" },
        { id: "themes", label: "Thèmes" }
      ]
    },
    {
      id: "components",
      label: "Composants",
      children: [
        { id: "actions", label: "Actions" },
        {
          id: "navigation",
          label: "Navigation",
          children: [
            { id: "header", label: "Header" },
            { id: "footer", label: "Footer" },
            { id: "tree", label: "TreeView", disabled: true }
          ]
        }
      ]
    },
    { id: "contracts", label: "Contrats" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation</p>
    <div class="docs-hero-title">
      <h1>TreeView</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Arborescence hiérarchique : déplier/replier les branches, sélectionner une feuille,
      navigation clavier (<kbd>↑</kbd>/<kbd>↓</kbd> déplacer, <kbd>→</kbd>/<kbd>←</kbd>
      déplier/replier, <kbd>Entrée</kbd>/<kbd>Espace</kbd> activer, <kbd>Début</kbd>/<kbd>Fin</kbd>).
      Rôles ARIA <code>tree</code>/<code>treeitem</code> + roving tabindex.
    </p>
  </section>
  <section class="docs-section">
    <h2>Démo</h2>
    <p class="docs-demo-context">Sélection : <strong>{selected}</strong></p>
    <div class="docs-tree-box">
      <TreeView {nodes} bind:selected defaultExpanded={["foundations", "components", "navigation"]} />
    </div>
  </section>
  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>nodes</code></td><td><code>TreeNode[]</code></td><td>requis</td></tr>
        <tr><td><code>selected</code></td><td><code>string</code> (bindable)</td><td><em>optionnel</em></td></tr>
        <tr><td><code>defaultExpanded</code></td><td><code>string[]</code></td><td><code>[]</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Arborescence"</code></td></tr>
        <tr><td><code>onselect</code></td><td><code>(id: string) =&gt; void</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>TreeNode</code> = <code>{`{ id, label, children?, disabled? }`}</code>.
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>

<style>
  .docs-tree-box {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 0.5rem;
    max-width: 22rem;
  }
</style>
