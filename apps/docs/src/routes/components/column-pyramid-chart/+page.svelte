<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      intro:
        "ColumnPyramidChart compare une valeur par catégorie comme un histogramme, mais chaque colonne est un triangle : base large posée sur l'axe X, sommet centré à la hauteur de la valeur. Sa silhouette effilée accentue la pointe et allège l'encre par rapport à une barre pleine.",
      examplesTitle: "Exemples",
      basicTitle: "Colonnes pyramidales",
      basicDesc: "Catégories en abscisse, triangles montant vers la valeur sur l'axe gradué.",
      multiTitle: "Catégories multiples",
      multiDesc: "Une teinte par catégorie pour comparer plusieurs segments d'un coup d'œil.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Chaque colonne est résumée dans une liste accessible avec sa catégorie et sa valeur ; le SVG décoratif reste aria-hidden.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les valeurs non finies ou ≤ 0 sont écartées : un triangle posé sur l'axe X n'a de sens que pour une valeur strictement positive. Fournissez `tone` pour fixer la teinte par défaut des colonnes sans `tone` propre.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "ColumnPyramidChart compares one value per category like a bar chart, but each column is a triangle: a wide base resting on the X axis and an apex centred at the value height. Its tapered silhouette emphasizes the peak and reduces ink compared with a solid bar.",
      examplesTitle: "Examples",
      basicTitle: "Pyramid columns",
      basicDesc: "Categories on the x-axis, triangles rising to the value on the graduated axis.",
      multiTitle: "Multiple categories",
      multiDesc: "One tone per category to compare several segments at a glance.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Each column is summarized in an accessible list with its category and value; the decorative SVG stays aria-hidden.",
      usageTitle: "Usage notes",
      usageNote:
        "Non-finite or ≤ 0 values are dropped: a triangle sitting on the X axis is only meaningful for a strictly-positive value. Pass `tone` to set the default tone for columns without their own `tone`.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const quarterData = [
    { category: "T1", value: 42, tone: "category1" },
    { category: "T2", value: 58, tone: "category1" },
    { category: "T3", value: 73, tone: "category1" },
    { category: "T4", value: 64, tone: "category1" }
  ];

  const segmentData = [
    { category: "Cloud", value: 40, tone: "category1" },
    { category: "Mobile", value: 25, tone: "category2" },
    { category: "Bureau", value: 20, tone: "category3" },
    { category: "IoT", value: 15, tone: "category4" }
  ];

  const basicDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ColumnPyramidChart",
          props: {
            label: locale.value === "fr" ? "Revenu par trimestre" : "Revenue by quarter",
            data: quarterData
          }
        }
      ]
    }
  ]);

  const multiDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ColumnPyramidChart",
          props: {
            label: locale.value === "fr" ? "Part par segment" : "Share by segment",
            data: segmentData
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>ColumnPyramidChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TabbedExample nodes={basicDemo} title={text().basicTitle} />

    <h3 class="docs-demo-title">{text().multiTitle}</h3>
    <p class="docs-demo-note">{text().multiDesc}</p>
    <TabbedExample nodes={multiDemo} title={text().multiTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>ColumnPyramidChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>tone</code></td><td><code>ColumnPyramidChartTone</code></td><td><code>"category1"</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>280</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ColumnPyramidChartDatum</code> = <code>{`{ category: string; value: number; tone?: ColumnPyramidChartTone }`}</code>
      ·
      <code>ColumnPyramidChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-inverse</code></li>
    </ul>
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
