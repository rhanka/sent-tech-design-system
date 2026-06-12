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
        "StreamgraphChart (themeriver) empile plusieurs séries temporelles en aires lissées sur une ligne de base centrée de type « wiggle » : la silhouette est symétrique autour de l'axe, ce qui met en valeur l'évolution relative des séries plutôt que des valeurs absolues. Chaque série prend une couleur catégorielle (category1…8) et apparaît dans la légende.",
      examplesTitle: "Exemples",
      trafficTitle: "Trafic par canal",
      trafficDesc: "Six mois de trafic réparti sur quatre canaux. Les aires lissées sont centrées : l'épaisseur de chaque bande reflète la part du canal dans le total du mois.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Une liste accessible hors SVG résume le total de chaque série et le total global. Le streamgraph n'a pas d'axe Y numérique absolu : seul l'axe X (catégories temporelles) est gradué.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Réservez le streamgraph aux séries empilées dont la somme évolue dans le temps (volumes, parts de marché). Les valeurs non finies ou négatives sont ramenées à 0 : un streamgraph n'empile que des grandeurs ≥ 0. `smooth` (true par défaut) lisse les aires ; passez `false` pour des transitions linéaires.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "StreamgraphChart (themeriver) stacks several time-series as smoothed areas on a centred \"wiggle\" baseline: the silhouette is symmetric around the axis, highlighting the relative evolution of series rather than absolute values. Each series takes a categorical colour (category1…8) and appears in the legend.",
      examplesTitle: "Examples",
      trafficTitle: "Traffic by channel",
      trafficDesc: "Six months of traffic split across four channels. The smoothed areas are centred: each band's thickness reflects the channel's share of the monthly total.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. An accessible list outside the SVG summarises each series total and the grand total. A streamgraph has no absolute numeric Y axis: only the X axis (time categories) is labelled.",
      usageTitle: "Usage notes",
      usageNote:
        "Reserve the streamgraph for stacked series whose total evolves over time (volumes, market share). Non-finite or negative values are clamped to 0 : a streamgraph only stacks magnitudes ≥ 0. `smooth` (true by default) smooths the areas; pass `false` for linear transitions.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const trafficData = [
    { category: "Jan", values: [{ label: "Direct", value: 32 }, { label: "Référé", value: 18 }, { label: "Social", value: 12 }, { label: "Email", value: 8 }] },
    { category: "Fév", values: [{ label: "Direct", value: 35 }, { label: "Référé", value: 22 }, { label: "Social", value: 16 }, { label: "Email", value: 10 }] },
    { category: "Mar", values: [{ label: "Direct", value: 30 }, { label: "Référé", value: 28 }, { label: "Social", value: 24 }, { label: "Email", value: 9 }] },
    { category: "Avr", values: [{ label: "Direct", value: 38 }, { label: "Référé", value: 25 }, { label: "Social", value: 30 }, { label: "Email", value: 14 }] },
    { category: "Mai", values: [{ label: "Direct", value: 42 }, { label: "Référé", value: 20 }, { label: "Social", value: 26 }, { label: "Email", value: 18 }] },
    { category: "Juin", values: [{ label: "Direct", value: 40 }, { label: "Référé", value: 30 }, { label: "Social", value: 34 }, { label: "Email", value: 16 }] }
  ];

  const trafficDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "StreamgraphChart",
          props: {
            label: locale.value === "fr" ? "Trafic par canal : 2025" : "Traffic by channel : 2025",
            data: trafficData
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
      <h1>StreamgraphChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().trafficTitle}</h3>
    <p class="docs-demo-note">{text().trafficDesc}</p>
    <TabbedExample nodes={trafficDemo} title={text().trafficTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>StreamgraphChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>smooth</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>showLegend</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>StreamgraphChartDatum</code> = <code>{`{ category: string; values: { label: string; value: number }[] }`}</code>
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
      <li><code>--st-semantic-data-category1</code> … <code>--st-semantic-data-category8</code></li>
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
