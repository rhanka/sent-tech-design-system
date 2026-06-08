<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, type StepLineChartDatum } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "StepLineChart visualise une valeur qui reste stable jusqu'au prochain seuil: paliers de capacité, quotas, états de stock, prix ou SLA. Le rendu suit le contrat LineChart, sans lissage ni aire.",
      examplesTitle: "Exemples",
      retentionTitle: "Rétention hebdomadaire",
      retentionDesc: "Série ordinale où chaque palier conserve sa valeur jusqu'à la semaine suivante.",
      latencyTitle: "Latence par seuil horaire",
      latencyDesc: "Quand tous les `x` sont numériques, l'axe X utilise une échelle linéaire.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Le SVG reste décoratif (`aria-hidden`) et les couples `x : y` sont exposés dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Utilise StepLineChart quand la valeur change à un seuil explicite. Pour une tendance interpolée entre points, garde LineChart.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "StepLineChart visualizes a value that stays stable until the next threshold: capacity steps, quotas, inventory states, pricing, or SLA levels. It follows the LineChart contract without smoothing or area fill.",
      examplesTitle: "Examples",
      retentionTitle: "Weekly retention",
      retentionDesc: "Ordinal series where each step holds its value until the following week.",
      latencyTitle: "Hourly latency thresholds",
      latencyDesc: "When every `x` is numeric, the X axis uses a linear scale.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. The SVG stays decorative (`aria-hidden`) and `x: y` pairs are exposed in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Use StepLineChart when values change at explicit thresholds. For interpolated trends between points, keep LineChart.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const retention: StepLineChartDatum[] = [
    { x: "S1", y: 92 },
    { x: "S2", y: 88 },
    { x: "S3", y: 91 },
    { x: "S4", y: 85 },
    { x: "S5", y: 89 }
  ];

  const latency: StepLineChartDatum[] = [
    { x: 0, y: 180 },
    { x: 4, y: 160 },
    { x: 8, y: 240 },
    { x: 12, y: 210 },
    { x: 16, y: 260 },
    { x: 20, y: 190 }
  ];

  const retentionDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "StepLineChart",
          props: {
            data: retention,
            label: locale.value === "fr" ? "Rétention hebdomadaire" : "Weekly retention",
            tone: "category4",
            width: 520,
            height: 260
          }
        }
      ]
    }
  ]);

  const latencyDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "StepLineChart",
          props: {
            data: latency,
            label: locale.value === "fr" ? "Latence p95 (ms)" : "p95 latency (ms)",
            tone: "category6",
            width: 520,
            height: 260
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
      <h1>StepLineChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().retentionTitle}</h3>
    <p class="docs-demo-note">{text().retentionDesc}</p>
    <TabbedExample nodes={retentionDemo} title={text().retentionTitle} />

    <h3 class="docs-demo-title">{text().latencyTitle}</h3>
    <p class="docs-demo-note">{text().latencyDesc}</p>
    <TabbedExample nodes={latencyDemo} title={text().latencyTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>StepLineChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>tone</code></td><td><code>StepLineChartTone</code></td><td><code>"category1"</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>StepLineChartDatum</code> = <code>{`{ x: number | string; y: number }`}</code>
      ·
      <code>StepLineChartTone</code> = <code>"category1" | ... | "category8"</code>
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
      <li><code>--st-component-stepLineChart-gridStroke</code></li>
      <li><code>--st-component-stepLineChart-axisStroke</code></li>
      <li><code>--st-component-stepLineChart-labelColor</code></li>
      <li><code>--st-component-stepLineChart-tooltipBackground</code></li>
      <li><code>--st-component-stepLineChart-tooltipText</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-default</code></li>
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
