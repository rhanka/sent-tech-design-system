<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import { storeChartDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { createDashboardStore, type DataModel } from "@sentropic/dataviz-core";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "HeatmapChart croise deux dimensions catégorielles dans une matrice colorée. Utilisez-le pour comparer des volumes, scores ou intensités sans transformer chaque cellule en interaction.",
      examplesTitle: "Exemples",
      matrixTitle: "Matrice catégorielle",
      matrixDesc: "Canaux en colonnes, trimestres en lignes, avec une cellule mise en évidence par ton.",
      legendTitle: "Rampe séquentielle",
      legendDesc: "`scale=\"sequential\"` transforme la matrice en rampe d'intensité mono-teinte pilotée par les variables `--st-heatmapChart-ramp-*`.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Les valeurs sont aussi exposées dans une liste accessible hors SVG, dans l'ordre ligne puis colonne.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Gardez des libellés courts sur les axes. Pour des matrices larges, filtrez les dimensions en amont plutôt que de réduire la typographie.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "HeatmapChart crosses two categorical dimensions in a colored matrix. Use it to compare volumes, scores, or intensity without turning every cell into an interaction.",
      examplesTitle: "Examples",
      matrixTitle: "Categorical matrix",
      matrixDesc: "Channels as columns, quarters as rows, with one cell highlighted by tone.",
      legendTitle: "Sequential ramp",
      legendDesc: "`scale=\"sequential\"` turns the matrix into a single-hue intensity ramp driven by the `--st-heatmapChart-ramp-*` variables.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Values are also exposed in an accessible list outside the SVG, ordered by row then column.",
      usageTitle: "Usage notes",
      usageNote:
        "Keep axis labels short. For wide matrices, filter dimensions upstream instead of shrinking the typography.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const channelData = [
    { x: "Web", y: "Q1", value: 12 },
    { x: "Web", y: "Q2", value: 30, tone: "category5" },
    { x: "Sales", y: "Q1", value: 18 },
    { x: "Sales", y: "Q2", value: 24 },
    { x: "Support", y: "Q1", value: 10 },
    { x: "Support", y: "Q2", value: 16 }
  ];

  const riskData = [
    { x: "API", y: "Low", value: 8 },
    { x: "API", y: "Medium", value: 19, tone: "category3" },
    { x: "API", y: "High", value: 4, tone: "category8" },
    { x: "Workers", y: "Low", value: 14 },
    { x: "Workers", y: "Medium", value: 11 },
    { x: "Workers", y: "High", value: 7, tone: "category6" }
  ];

  const matrixDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "HeatmapChart",
          props: {
            label: locale.value === "fr" ? "Charge par canal et trimestre" : "Load by channel and quarter",
            data: channelData
          }
        }
      ]
    }
  ]);

  const legendDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "HeatmapChart",
          props: {
            label: locale.value === "fr" ? "Risque par système" : "Risk by system",
            data: riskData,
            scale: "sequential",
            legend: true
          }
        }
      ]
    }
  ]);

  // Version adaptateur : les cellules sont dérivées d'un vrai store minimal.
  const storeModel: DataModel = {
    dimensions: [
      { id: "row", label: "Ligne", type: "discrete" },
      { id: "col", label: "Colonne", type: "discrete" }
    ],
    measures: [{ id: "value", label: "Valeur", aggregation: "sum" }]
  };
  const store = createDashboardStore({
    model: storeModel,
    data: [
      { row: "A", col: "X", value: 12 },
      { row: "A", col: "Y", value: 34 },
      { row: "B", col: "X", value: 56 },
      { row: "B", col: "Y", value: 78 }
    ]
  });

  const storeDemo = $derived<NodeSpec[]>(
    storeChartDemoNodes("HeatmapChart", {
      store,
      viewId: "store",
      x: "col",
      y: "row",
      measure: "value",
      label: locale.value === "fr" ? "Matrice (store)" : "Matrix (store)"
    })
  );
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>HeatmapChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().matrixTitle}</h3>
    <p class="docs-demo-note">{text().matrixDesc}</p>
    <TabbedExample nodes={matrixDemo} title={text().matrixTitle} />

    <h3 class="docs-demo-title">{text().legendTitle}</h3>
    <p class="docs-demo-note">{text().legendDesc}</p>
    <TabbedExample nodes={legendDemo} title={text().legendTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>HeatmapChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>scale</code></td><td><code>"categorical" | "sequential"</code></td><td><code>"categorical"</code></td></tr>
        <tr><td><code>legend</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>300</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>HeatmapChartDatum</code> = <code>{`{ x: string; y: string; value: number; tone?: HeatmapChartTone }`}</code>
      ·
      <code>HeatmapChartTone</code> = <code>"category1" | ... | "category8"</code> ({locale.value === "fr" ? "utilisé en mode catégoriel" : "used in categorical mode"}).
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().a11yTitle}</h2>
    <p class="docs-demo-note">{text().a11yNote}</p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote}</p>
  </section>

  <section class="docs-section">
    <h2>{text().tokensTitle}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-data-category1</code> ... <code>--st-semantic-data-category8</code></li>
      <li><code>--st-heatmapChart-ramp-1</code> ... <code>--st-heatmapChart-ramp-8</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-inverse</code></li>
      <li><code>--st-semantic-text-inverse</code></li>
      <li><code>--st-radius-sm</code></li>
    </ul>
  </section>
  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Piloté par store" : "Store-driven"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        La version adaptateur (<code>@sentropic/dataviz-svelte</code>,
        <code>-react</code>, <code>-vue</code>, <code>-angular</code>) dérive les
        cellules d’un <code>DashboardStore</code> partagé : <code>x</code>,
        <code>y</code> et <code>measure</code> désignent les canaux.
      {:else}
        The adapter version (<code>@sentropic/dataviz-svelte</code>,
        <code>-react</code>, <code>-vue</code>, <code>-angular</code>) derives the
        cells from a shared <code>DashboardStore</code>: <code>x</code>,
        <code>y</code>, and <code>measure</code> name the channels.
      {/if}
    </p>
    <TabbedExample nodes={storeDemo} title={locale.value === "fr" ? "Matrice (store)" : "Matrix (store)"} />
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>store</code></td><td><code>DashboardStore</code></td><td>requis</td></tr>
        <tr><td><code>viewId</code></td><td><code>string</code></td><td>non défini</td></tr>
        <tr><td><code>x</code> / <code>y</code> / <code>measure</code></td><td><code>string</code></td><td>requis</td></tr>
        <tr><td><code>legend</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td>natif</td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      {#if locale.value === "fr"}
        Props du natif non reprises par la version store : <code>data</code> (dérivé
        du store via <code>x</code> / <code>y</code> / <code>measure</code>) et
        <code>scale</code> (non exposée : le défaut du natif s’applique).
      {:else}
        Native props not carried by the store version: <code>data</code> (derived
        from the store through <code>x</code> / <code>y</code> / <code>measure</code>)
        and <code>scale</code> (not exposed: the native default applies).
      {/if}
    </p>
  </section>
</div>

<style>
  .docs-demo-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: var(--st-semantic-text-primary);
  }

  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
