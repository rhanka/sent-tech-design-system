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
        "CandlestickChart visualise des données OHLC (Open / High / Low / Close) sous forme de bougies japonaises. Les bougies haussières sont vertes, les baissières rouges.",
      examplesTitle: "Exemples",
      weekTitle: "Semaine de trading",
      weekDesc: "Cinq bougies quotidiennes. Les bâtons (mèches) indiquent high et low ; les corps indiquent open et close.",
      combinedTitle: "Annotations, étiquettes et navigation clavier",
      combinedDesc: "Une ligne de résistance et une zone de prix (annotations), l'étiquette close au-dessus de chaque bougie (dataLabels) et la navigation clavier des bougies (←/→, Entrée). Le crosshair se pilote via hoverKey/onHoverKeyChange.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque bougie expose ses valeurs O/H/L/C dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Garantissez `high ≥ max(open, close)` et `low ≤ min(open, close)`. Le composant corrige silencieusement les bougies invalides en clampant high/low.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "CandlestickChart visualises OHLC (Open / High / Low / Close) data as Japanese candlesticks. Bullish candles are green, bearish ones red.",
      examplesTitle: "Examples",
      weekTitle: "Trading week",
      weekDesc: "Five daily candles. Wicks show high and low; bodies show open and close.",
      combinedTitle: "Annotations, data labels and keyboard navigation",
      combinedDesc: "A resistance line and a price zone (annotations), the close label above each candle (dataLabels) and keyboard navigation of the candles (←/→, Enter). The crosshair is driven through hoverKey/onHoverKeyChange.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each candle exposes its O/H/L/C values in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Ensure `high ≥ max(open, close)` and `low ≤ min(open, close)`. The component silently clamps invalid high/low values.",
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
          comp: "CandlestickChart",
          props: {
            label: locale.value === "fr" ? "Cours SENT — semaine" : "SENT stock — week",
            data: weekData
          }
        }
      ]
    }
  ]);

  const combinedDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "CandlestickChart",
          props: {
            label: locale.value === "fr" ? "Cours SENT — analyse" : "SENT stock — analysis",
            data: weekData,
            dataLabels: true,
            keyboardNav: true,
            annotations: [
              { kind: "line", axis: "y", value: 151, label: locale.value === "fr" ? "Résistance" : "Resistance" },
              { kind: "region", axis: "y", from: 138, to: 142, label: locale.value === "fr" ? "Support" : "Support" }
            ]
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
      <h1>CandlestickChart</h1>
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
        <tr><td><code>data</code></td><td><code>CandlestickChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>CandlestickChartDatum</code> = <code>{`{ label: string; open: number; high: number; low: number; close: number }`}</code>
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
