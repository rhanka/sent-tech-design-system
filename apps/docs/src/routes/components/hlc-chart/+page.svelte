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
        "HLCChart visualise des données HLC (High / Low / Close) sous forme de bâtons financiers : une barre verticale du low au high et un tick à droite au niveau de la clôture, sans tick d'ouverture (variante d'OHLC). Les périodes en hausse (close ≥ clôture précédente) sont vertes, celles en baisse rouges.",
      examplesTitle: "Exemples",
      weekTitle: "Semaine de trading",
      weekDesc: "Cinq bâtons quotidiens. La barre verticale couvre high et low ; le tick droite marque close. La couleur compare close à la clôture précédente.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque bâton expose ses valeurs H/L/C dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Garantissez `high ≥ close` et `low ≤ close`. Le composant corrige silencieusement les bâtons invalides en clampant high/low. La première barre est considérée en hausse.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "HLCChart visualises HLC (High / Low / Close) data as financial bars: a vertical low-to-high bar and a right tick at the close level, with no open tick (an OHLC variant). Periods that rose (close ≥ previous close) are green, those that fell red.",
      examplesTitle: "Examples",
      weekTitle: "Trading week",
      weekDesc: "Five daily bars. The vertical bar spans high and low; the right tick marks close. Colour compares close to the previous close.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each bar exposes its H/L/C values in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Ensure `high ≥ close` and `low ≤ close`. The component silently clamps invalid high/low values. The first bar is treated as rising.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const weekData = [
    { label: "Lun", high: 148, low: 139, close: 146 },
    { label: "Mar", high: 151, low: 144, close: 149 },
    { label: "Mer", high: 152, low: 140, close: 143 },
    { label: "Jeu", high: 147, low: 138, close: 145 },
    { label: "Ven", high: 155, low: 144, close: 153 }
  ];

  const weekDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "HLCChart",
          props: {
            label: locale.value === "fr" ? "Cours SENT — semaine" : "SENT stock — week",
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
      <h1>HLCChart</h1>
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
        <tr><td><code>data</code></td><td><code>HLCChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>HLCChartDatum</code> = <code>{`{ label: string; high: number; low: number; close: number }`}</code>
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
