<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "HistogramChart affiche la distribution d'une variable avec des classes explicites ou des classes générées depuis des valeurs numériques.",
      examplesTitle: "Exemples",
      explicitTitle: "Classes explicites",
      explicitDesc: "Utilisez des libellés de classes quand le découpage vient du produit ou du métier.",
      numericTitle: "Classes générées",
      numericDesc: "`bins` découpe une série numérique en intervalles réguliers.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Les classes et leurs effectifs sont rendus dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Évitez de mélanger classes explicites et valeurs brutes dans un même affichage. Choisissez le mode qui correspond à la source des données.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "HistogramChart shows a variable distribution with explicit bins or bins generated from numeric values.",
      examplesTitle: "Examples",
      explicitTitle: "Explicit bins",
      explicitDesc: "Use labeled bins when the grouping comes from the product or business model.",
      numericTitle: "Generated bins",
      numericDesc: "`bins` splits a numeric series into regular intervals.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Bins and counts are rendered in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Avoid mixing explicit bins and raw values in the same display. Pick the mode that matches the data source.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const explicitBins = [
    { label: "0-10", value: 4 },
    { label: "10-20", value: 9, tone: "category6" },
    { label: "20-30", value: 3 },
    { label: "30-40", value: 7 }
  ];

  const numericValues = [1, 2, 3, 8, 9, 10, 12, 14, 15, 16, 20, 21];

  const explicitDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "HistogramChart",
          props: {
            label: locale.value === "fr" ? "Tailles de requête" : "Request sizes",
            data: explicitBins
          }
        }
      ]
    }
  ]);

  const numericDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "HistogramChart",
          props: {
            label: locale.value === "fr" ? "Distribution numérique" : "Numeric distribution",
            data: numericValues,
            bins: 4
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
      <h1>HistogramChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().explicitTitle}</h3>
    <p class="docs-demo-note">{text().explicitDesc}</p>
    <TabbedExample nodes={explicitDemo} title={text().explicitTitle} />

    <h3 class="docs-demo-title">{text().numericTitle}</h3>
    <p class="docs-demo-note">{text().numericDesc}</p>
    <TabbedExample nodes={numericDemo} title={text().numericTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>HistogramChartDatum[] | number[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>bins</code></td><td><code>number</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>HistogramChartDatum</code> = <code>{`{ label: string; value: number; tone?: HistogramChartTone }`}</code>
      ·
      <code>HistogramChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-text-inverse</code></li>
      <li><code>--st-radius-sm</code></li>
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
