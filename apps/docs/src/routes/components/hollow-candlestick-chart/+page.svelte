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
        "HollowCandlestickChart visualise des données OHLC (Open / High / Low / Close) sous forme de chandeliers creux (convention hollow candlestick). La couleur du trait suit la clôture par rapport à la clôture précédente : verte si elle monte, rouge si elle descend. Le corps est creux quand la bougie est haussière (close ≥ open) et plein quand elle est baissière (close < open).",
      examplesTitle: "Exemples",
      weekTitle: "Semaine de trading",
      weekDesc: "Cinq bougies quotidiennes. La mèche couvre high et low ; le corps relie open et close, creux ou plein selon le sens de la bougie.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque bougie expose ses valeurs O/H/L/C dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "La couleur dépend de la clôture vs la clôture précédente, le remplissage (creux/plein) dépend de close vs open : les deux dimensions sont indépendantes. Garantissez `high ≥ max(open, close)` et `low ≤ min(open, close)` ; le composant clampe silencieusement les valeurs invalides.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "HollowCandlestickChart visualises OHLC (Open / High / Low / Close) data as hollow candlesticks. The outline colour follows the close versus the previous close: green when it rises, red when it falls. The body is hollow when the candle is bullish (close ≥ open) and filled when it is bearish (close < open).",
      examplesTitle: "Examples",
      weekTitle: "Trading week",
      weekDesc: "Five daily candles. The wick spans high and low; the body links open and close, hollow or filled depending on the candle direction.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each candle exposes its O/H/L/C values in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Colour depends on close vs previous close, while fill (hollow/filled) depends on close vs open: the two dimensions are independent. Ensure `high ≥ max(open, close)` and `low ≤ min(open, close)`; the component silently clamps invalid values.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const weekData = [
    { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
    { label: "Mar", open: 146, high: 151, low: 144, close: 143 },
    { label: "Mer", open: 143, high: 152, low: 140, close: 150 },
    { label: "Jeu", open: 150, high: 153, low: 145, close: 147 },
    { label: "Ven", open: 147, high: 155, low: 146, close: 153 }
  ];

  const weekDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "HollowCandlestickChart",
          props: {
            label: locale.value === "fr" ? "Cours SENT : semaine" : "SENT stock: week",
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
      <h1>HollowCandlestickChart</h1>
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
        <tr><td><code>data</code></td><td><code>HollowCandlestickChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>HollowCandlestickChartDatum</code> = <code>{`{ label: string; open: number; high: number; low: number; close: number }`}</code>
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
