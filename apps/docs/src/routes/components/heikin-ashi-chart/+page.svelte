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
        "HeikinAshiChart visualise des données OHLC sous forme de chandeliers Heikin-Ashi. Chaque bougie est RECALCULÉE par moyennes lissées, ce qui filtre le bruit et fait ressortir la tendance. Les bougies haussières sont vertes, les baissières rouges.",
      examplesTitle: "Exemples",
      weekTitle: "Semaine de trading",
      weekDesc: "Cinq bougies quotidiennes. Les valeurs affichées (mèches et corps) sont les valeurs Heikin-Ashi calculées, pas les valeurs OHLC brutes.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque bougie expose ses valeurs Heikin-Ashi O/H/L/C dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez les valeurs OHLC brutes ; le composant calcule la version Heikin-Ashi (haClose = moyenne O/H/L/C ; haOpen = moyenne du haOpen et haClose précédents). Les bougies non finies sont filtrées avant le calcul.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "HeikinAshiChart visualises OHLC data as Heikin-Ashi candlesticks. Each candle is RECALCULATED from smoothed averages, filtering noise and surfacing the trend. Bullish candles are green, bearish ones red.",
      examplesTitle: "Examples",
      weekTitle: "Trading week",
      weekDesc: "Five daily candles. The values shown (wicks and bodies) are the computed Heikin-Ashi values, not the raw OHLC inputs.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each candle exposes its Heikin-Ashi O/H/L/C values in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide raw OHLC values; the component computes the Heikin-Ashi version (haClose = mean of O/H/L/C; haOpen = mean of the previous haOpen and haClose). Non-finite candles are dropped before computation.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const weekData = [
    { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
    { label: "Mar", open: 146, high: 151, low: 144, close: 149 },
    { label: "Mer", open: 149, high: 152, low: 140, close: 143 },
    { label: "Jeu", open: 143, high: 147, low: 138, close: 145 },
    { label: "Ven", open: 145, high: 155, low: 144, close: 153 }
  ];

  const weekDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "HeikinAshiChart",
          props: {
            label: locale.value === "fr" ? "Cours SENT — semaine (Heikin-Ashi)" : "SENT stock — week (Heikin-Ashi)",
            data: weekData
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
      <h1>HeikinAshiChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().weekTitle}</h3>
    <p class="docs-demo-note">{text().weekDesc}</p>
    <TabbedExample nodes={weekDemo} title={text().weekTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>HeikinAshiChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>HeikinAshiChartDatum</code> = <code>{`{ label: string; open: number; high: number; low: number; close: number }`}</code>
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
      <li><code>--st-semantic-feedback-success</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
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
