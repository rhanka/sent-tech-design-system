<script lang="ts">
  import { Badge, OrderedList } from "@sentropic/design-system-svelte";

  const steps = [
    "Installer les packages",
    "Importer le ThemeProvider",
    {
      content: "Configurer le thème",
      children: ["Choisir un thème existant", "Ou en créer un de façon assistée"]
    },
    "Consommer les composants"
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <h1>
      OrderedList
      <Badge tone="neutral">Documenté</Badge>
    </h1>
    <p>
      Liste <strong>ordonnée</strong> numérotée (complément de <code>UnorderedList</code>).
      Accepte des chaînes ou des objets <code>{`{ content, children }`}</code> pour
      l'imbrication. Numérotation via compteur CSS (tabular-nums).
    </p>
  </section>

  <section class="docs-section">
    <h2>Avec imbrication</h2>
    <OrderedList items={steps} />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>(string | OrderedListItem)[]</code></td><td>requis</td></tr>
        <tr><td><code>nested</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>
</div>
