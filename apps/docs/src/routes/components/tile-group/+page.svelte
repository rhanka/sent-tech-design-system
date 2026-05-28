<script lang="ts">
  import { Badge, TileGroup, type TileGroupItem } from "@sentropic/design-system-svelte";

  let plan = $state("pro");
  const items: TileGroupItem[] = [
    { value: "free", label: "Gratuit", description: "Pour démarrer." },
    { value: "pro", label: "Pro", description: "Pour les équipes." },
    { value: "ent", label: "Entreprise", description: "Sur devis.", disabled: true }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaires</p>
    <h1>
      TileGroup
      <Badge tone="neutral">Documenté</Badge>
    </h1>
    <p>
      Groupe de <strong>tuiles sélectionnables</strong> (sémantique radio dans un
      <code>&lt;fieldset&gt;</code> + légende). Sélection unique <code>value</code> bindable.
      Pour une tuile isolée, voir <code>Tile</code>.
    </p>
  </section>

  <section class="docs-section">
    <h2>Exemple</h2>
    <p class="docs-demo-context">Sélection : <strong>{plan}</strong></p>
    <TileGroup {items} bind:value={plan} legend="Choisir une formule" />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead><tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr></thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>TileGroupItem[]</code></td><td>requis</td></tr>
        <tr><td><code>value</code></td><td><code>string</code> (bindable)</td><td><em>optionnel</em></td></tr>
        <tr><td><code>legend</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>legendHidden</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onchange</code></td><td><code>(value: string) =&gt; void</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>TileGroupItem</code> = <code>{`{ value, label, description?, disabled? }`}</code>.
    </p>
  </section>
</div>
