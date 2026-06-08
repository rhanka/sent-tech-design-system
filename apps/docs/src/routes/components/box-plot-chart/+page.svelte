<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "BoxPlotChart compare des distributions à partir de leurs quartiles, moustaches et valeurs atypiques. Il est utile pour suivre la dispersion sans afficher chaque observation.",
      examplesTitle: "Exemples",
      latencyTitle: "Distribution de latence",
      latencyDesc: "Deux groupes avec médiane, quartiles et un outlier explicite.",
      cohortsTitle: "Cohortes",
      cohortsDesc: "Le ton peut signaler une série prioritaire ou une anomalie connue.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque boîte est résumée dans une liste accessible avec min, q1, médiane, q3, max et outliers.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez des quartiles déjà calculés. Le composant ne trie pas les observations brutes, ce qui garde le rendu prévisible et rapide.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "BoxPlotChart compares distributions through quartiles, whiskers, and outliers. Use it to track spread without rendering every observation.",
      examplesTitle: "Examples",
      latencyTitle: "Latency distribution",
      latencyDesc: "Two groups with median, quartiles, and one explicit outlier.",
      cohortsTitle: "Cohorts",
      cohortsDesc: "Tone can mark a priority series or a known anomaly.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each box is summarized in an accessible list with min, q1, median, q3, max, and outliers.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide precomputed quartiles. The component does not sort raw observations, keeping rendering predictable and fast.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const latencyData = [
    { label: "API", min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: "category3" },
    { label: "Jobs", min: 15, q1: 24, median: 34, q3: 50, max: 80 }
  ];

  const cohortData = [
    { label: "Starter", min: 4, q1: 9, median: 14, q3: 24, max: 38 },
    { label: "Pro", min: 10, q1: 22, median: 35, q3: 48, max: 66, tone: "category5" },
    { label: "Enterprise", min: 18, q1: 32, median: 46, q3: 70, max: 92, outliers: [120], tone: "category7" }
  ];

  const latencyDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BoxPlotChart",
          props: {
            label: locale.value === "fr" ? "Distribution de latence" : "Latency distribution",
            data: latencyData
          }
        }
      ]
    }
  ]);

  const cohortDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BoxPlotChart",
          props: {
            label: locale.value === "fr" ? "Valeur par cohorte" : "Value by cohort",
            data: cohortData
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
      <h1>BoxPlotChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="boxplotchart" title={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().latencyTitle}</h3>
    <p class="docs-demo-note">{text().latencyDesc}</p>
    <FrameworkDemo nodes={latencyDemo} label={text().latencyTitle} />

    <h3 class="docs-demo-title">{text().cohortsTitle}</h3>
    <p class="docs-demo-note">{text().cohortsDesc}</p>
    <FrameworkDemo nodes={cohortDemo} label={text().cohortsTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>BoxPlotChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>260</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>BoxPlotChartDatum</code> = <code>{`{ label: string; min: number; q1: number; median: number; q3: number; max: number; outliers?: number[]; tone?: BoxPlotChartTone }`}</code>
      ·
      <code>BoxPlotChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-border-interactive</code></li>
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
