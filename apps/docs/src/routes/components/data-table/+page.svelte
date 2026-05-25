<script lang="ts">
  import { Badge, DataTable, type DataTableColumn, type DataTableRow, type DataTableSort } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Tableau de données avec en-têtes triables, sélection et pagination intégrée.",
      basicCaption: "Services actifs",
      interactiveCaption: "Selection + pagination",
      noSelection: "Aucune sélection",
      clickedPrefix: "Ligne cliquée",
      usageTitle: "Notes d’usage",
      usageSort:
        "Le tri est géré localement via `sortBy` (aucune source de vérité externe imposée).",
      usageSelection:
        "`selectable=\"multiple\"` ajoute la colonne de cases à cocher et active la sélection groupée.",
      usagePaging:
        "Quand `pageSize` est fourni, la pagination se calcule côté composant; `page` peut être bindé pour contrôler l’état externe.",
      usageRows:
        "Chaque ligne doit fournir un `id` stable et unique; il sert à l’identifiant d’accessibilité et de sélection."
    },
    en: {
      intro:
        "Data table with sortable headers, selectable rows, and built-in paging.",
      basicCaption: "Active services",
      interactiveCaption: "Selection + pagination",
      noSelection: "No selection",
      clickedPrefix: "Last clicked row",
      usageTitle: "Usage notes",
      usageSort: "Sorting is handled locally via `sortBy` (no external source-of-truth required).",
      usageSelection:
        "`selectable=\"multiple\"` adds a checkbox column and enables bulk select behavior.",
      usagePaging:
        "When `pageSize` is set, paging is computed internally; bind `page` to share pager state externally.",
      usageRows:
        "Each row must provide a stable, unique `id`; it is used for accessibility attributes and selection state."
    }
  } as const;

  const text = () => copy[locale.value];

  const dataColumns: DataTableColumn[] = [
    { key: "name", label: "Service", sortable: true },
    { key: "team", label: "Equipe", sortable: true },
    { key: "region", label: "Région" },
    { key: "uptime", label: "Disponibilité", align: "end", sortable: true, width: "8rem" },
    { key: "status", label: "Statut", align: "center" }
  ];

  const rows: DataTableRow[] = [
    { id: "api-search", name: "Search API", team: "Platform", region: "EU", uptime: 99.96, status: "Stable" },
    { id: "api-graph", name: "Graph API", team: "Platform", region: "US", uptime: 99.71, status: "Stable" },
    { id: "chat-core", name: "Chat Core", team: "Chat", region: "EU", uptime: 98.44, status: "Warning" },
    { id: "ingest", name: "Ingest", team: "Data", region: "EU", uptime: 97.88, status: "Stable" },
    { id: "billing", name: "Billing", team: "Finance", region: "US", uptime: 99.12, status: "Stable" },
    { id: "stream", name: "Streaming", team: "Data", region: "APAC", uptime: 95.05, status: "Degraded" }
  ];

  let selectedIds = $state<string[]>([]);
  let page = $state(1);
  let clickedRow = $state<string>("");
  let sortBy = $state<DataTableSort | null>(null);

  function rowLabel(row: DataTableRow) {
    clickedRow = String(row.name);
  }

  const selectionCount = $derived(`${selectedIds.length}`);
  const sortState = $derived(
    sortBy ? `${sortBy.key} (${sortBy.direction})` : locale.value === "fr" ? "aucun" : "none"
  );
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <h1>
      DataTable
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div
      class="docs-example docs-dataTable-example"
      aria-label={locale.value === "fr" ? "Tableau de base" : "Basic data table"}
    >
      <DataTable
        columns={dataColumns}
        rows={rows}
        caption={text().basicCaption}
        size="sm"
      />
      <p>
        <strong>{locale.value === "fr" ? "Format de ligne" : "Row format"}:</strong>
        <code>ID, name, team, region, uptime, status</code>
      </p>
    </div>

    <div
        class="docs-example docs-dataTable-example"
        aria-label={locale.value === "fr" ? "Tableau interactif" : "Interactive data table"}
    >
      <DataTable
        caption={text().interactiveCaption}
        columns={dataColumns}
        rows={rows}
        size="md"
        selectable="multiple"
        bind:selectedIds
        bind:page
        bind:sortBy
        pageSize={3}
        onRowClick={rowLabel}
        selectAllLabel={locale.value === "fr" ? "Sélectionner toutes les lignes" : "Select all rows"}
        selectRowLabel={locale.value === "fr" ? "Sélectionner la ligne" : "Select row"}
        sortAscendingLabel={locale.value === "fr" ? "Tri ascendant" : "Sorted ascending"}
        sortDescendingLabel={locale.value === "fr" ? "Tri descendant" : "Sorted descending"}
        sortNoneLabel={locale.value === "fr" ? "Sans tri" : "Not sorted"}
        previousLabel={locale.value === "fr" ? "Précédent" : "Previous"}
        nextLabel={locale.value === "fr" ? "Suivant" : "Next"}
        rangeLabel={({ start, end, total }) =>
          locale.value === "fr" ? `${start}-${end} sur ${total}` : `${start}-${end} of ${total}`
        }
      />
      <div>
        <p>
          {text().clickedPrefix}: <code>{clickedRow || text().noSelection}</code> ·
          {locale.value === "fr" ? "Tri" : "Sort"}: <code>{sortState}</code> ·
          {locale.value === "fr" ? "Sélection" : "Selection"}: <code>{selectionCount}</code>
        </p>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>columns</code></td><td><code>DataTableColumn[]</code></td><td><em>requis</em></td></tr>
        <tr><td><code>rows</code></td><td><code>DataTableRow[]</code></td><td><em>requis</em></td></tr>
        <tr><td><code>caption</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>selectable</code></td><td><code>"none" | "single" | "multiple"</code></td><td><code>"none"</code></td></tr>
        <tr><td><code>selectedIds</code></td><td><code>string[]</code> (<code>$bindable</code>)</td><td><code>[]</code></td></tr>
        <tr><td><code>sortable</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>sortBy</code></td><td><code>DataTableSort | null</code> (<code>$bindable</code>)</td><td><code>null</code></td></tr>
        <tr><td><code>pageSize</code></td><td><code>number</code></td><td><em>désactivé</em></td></tr>
        <tr><td><code>page</code></td><td><code>number</code> (<code>$bindable</code>)</td><td><code>1</code></td></tr>
        <tr><td><code>onRowClick</code></td><td><code>(row: DataTableRow) => void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>selectAllLabel</code></td><td><code>string</code></td><td><code>"Select all rows"</code></td></tr>
        <tr><td><code>selectRowLabel</code></td><td><code>string</code></td><td><code>"Select row"</code></td></tr>
        <tr><td><code>previousLabel</code></td><td><code>string</code></td><td><code>"Previous"</code></td></tr>
        <tr><td><code>nextLabel</code></td><td><code>string</code></td><td><code>"Next"</code></td></tr>
        <tr><td><code>rangeLabel</code></td><td><code>(range: &#123; start: number; end: number; total: number &#125;) =&gt; string</code></td><td><code>(&#123; start, end, total &#125;) =&gt; "start-end of total"</code></td></tr>
        <tr><td><code>emptyLabel</code></td><td><code>string</code></td><td><code>"No data"</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p>
      Les cellules sont triables par défaut si <code>sortable</code> reste vrai; une
      colonne triable bascule <code>ascending</code> → <code>descending</code> → sans
      tri. Les lignes disposent d’un état cliquable quand <code>onRowClick</code> est
      fourni.
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <ul class="docs-token-list">
      <li>{text().usageSort}</li>
      <li>{text().usageSelection}</li>
      <li>{text().usagePaging}</li>
      <li>{text().usageRows}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-dataTable-border</code></li>
      <li><code>--st-component-dataTable-captionText</code></li>
      <li><code>--st-component-dataTable-headerBackground</code></li>
      <li><code>--st-component-dataTable-rowBackground</code></li>
      <li><code>--st-component-dataTable-rowHoverBackground</code></li>
      <li><code>--st-component-dataTable-text</code></li>
      <li><code>--st-component-dataTable-radius</code></li>
      <li><code>--st-component-pagination-background</code></li>
      <li><code>--st-component-pagination-border</code></li>
      <li><code>--st-component-pagination-text</code></li>
      <li><code>--st-component-pagination-radius</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-semantic-action-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
    </ul>
  </section>
</div>

<style>
  .docs-dataTable-example {
    align-items: stretch;
    display: grid;
    gap: 0.75rem;
  }
</style>
