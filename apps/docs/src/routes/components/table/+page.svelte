<script lang="ts">
  import { Badge, Table } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) =>
    locale.value === "fr" ? frText : enText;

  const columns = [
    { key: "id", label: fr("ID", "ID") },
    { key: "label", label: fr("Libellé", "Label") },
    { key: "status", label: fr("Statut", "Status" ) }
  ];

  const rows = [
    { id: "UI-01", label: fr("Navigation", "Navigation"), status: fr("Stable", "Stable") },
    { id: "UI-02", label: fr("Composants", "Components"), status: fr("Stable", "Stable") },
    { id: "UI-03", label: fr("Tokens", "Tokens"), status: fr("En évolution", "Evolving") }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Données", "Component · Data")}</p>
    <div class="docs-hero-title">
      <h1>Table</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Tableau HTML léger avec colonnes, caption et survol de ligne.",
        "Lightweight HTML table with columns, caption and row hover support."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour afficher des données tabulaires simples sans pagination/tri intégrés.", "To display simple tabular data without built-in pagination/sorting.")}</li>
      <li>{fr("Quand la table doit rester accessible et contrôlable via colonnes personnalisées.", "When table should remain accessible and customizable through explicit columns.")}</li>
      <li>{fr("Pour composer des écrans rapport ou inventaire dans un bloc propre.", "To build reporting/inventory surfaces with a clean tabular block.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={fr("Exemple de table", "Table example")}>
      <Table columns={columns} rows={rows} caption={fr("Données de composants", "Component data")} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{fr("Défaut", "Default")}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>columns</code></td><td><code>TableColumn[]</code></td><td><em>required</em></td><td>{fr("Définit les colonnes du tableau.", "Defines table columns.")}</td></tr>
        <tr><td><code>rows</code></td><td><code>TableRow[]</code></td><td><em>required</em></td><td>{fr("Jeu de lignes à afficher.", "Rows dataset to render.")}</td></tr>
        <tr><td><code>caption</code></td><td><code>string</code></td><td><em>optionnel</em></td><td>{fr("Légende sémantique du tableau.", "Semantic table caption.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td><td>{fr("Classe additionnelle sur <code>table</code>.", "Additional class on the <code>table</code>.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLTableAttributes</code></td><td>N/A</td><td>{fr("Propagés sur l'élément <code>table</code>.", "Spread onto the <code>table</code> element.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-dataTable-rowBackground</code></li>
      <li><code>--st-component-dataTable-border</code></li>
      <li><code>--st-component-dataTable-radius</code></li>
      <li><code>--st-component-dataTable-text</code></li>
      <li><code>--st-component-dataTable-captionText</code></li>
      <li><code>--st-component-dataTable-headerBackground</code></li>
      <li><code>--st-component-dataTable-rowHoverBackground</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
    </ul>
  </section>
</div>
