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
        "AreaRangeChart trace une bande remplie entre une série basse et une série haute le long d'un axe X continu. Idéal pour visualiser une fourchette qui évolue : températures min/max jour par jour, min/max boursier, intervalles de confiance.",
      examplesTitle: "Exemples",
      basicTitle: "Bande de base",
      basicDesc: "Bande remplie entre low et high sur un axe X ordinal, avec lignes basse et haute.",
      smoothTitle: "Bords lissés",
      smoothDesc: "Passez `smooth` pour des bords de bande courbés (interpolation douce).",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque point est résumé dans une liste accessible avec son libellé et ses bornes basse → haute.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez `low` et `high` par point ; l'ordre est normalisé automatiquement. L'axe X est numérique quand tous les `x` sont des nombres finis, sinon ordinal.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "AreaRangeChart draws a filled band between a low and a high series along a continuous X axis. Ideal for an evolving range: daily min/max temperatures, stock min/max, confidence intervals.",
      examplesTitle: "Examples",
      basicTitle: "Basic band",
      basicDesc: "Filled band between low and high over an ordinal X axis, with low and high lines.",
      smoothTitle: "Smoothed edges",
      smoothDesc: "Pass `smooth` for curved band edges (gentle interpolation).",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each point is summarized in an accessible list with its label and low → high bounds.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide `low` and `high` per point; order is normalized automatically. The X axis is numeric when all `x` are finite numbers, otherwise ordinal.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const tempData = [
    { x: "Lun", low: 8, high: 17 },
    { x: "Mar", low: 9, high: 19 },
    { x: "Mer", low: 11, high: 22 },
    { x: "Jeu", low: 10, high: 20 },
    { x: "Ven", low: 7, high: 16 },
    { x: "Sam", low: 6, high: 14 },
    { x: "Dim", low: 9, high: 18 }
  ];

  const stockData = [
    { x: "Jan", low: 142, high: 168 },
    { x: "Fév", low: 151, high: 179 },
    { x: "Mar", low: 160, high: 191 },
    { x: "Avr", low: 148, high: 174 },
    { x: "Mai", low: 156, high: 188 }
  ];

  const basicDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "AreaRangeChart",
          props: {
            label:
              locale.value === "fr"
                ? "Fourchette de température par jour"
                : "Daily temperature range",
            tone: "category1",
            data: tempData
          }
        }
      ]
    }
  ]);

  const smoothDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "AreaRangeChart",
          props: {
            label:
              locale.value === "fr"
                ? "Min/max boursier mensuel"
                : "Monthly stock min/max",
            tone: "category4",
            smooth: true,
            data: stockData
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
      <h1>AreaRangeChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TabbedExample nodes={basicDemo} title={text().basicTitle} />

    <h3 class="docs-demo-title">{text().smoothTitle}</h3>
    <p class="docs-demo-note">{text().smoothDesc}</p>
    <TabbedExample nodes={smoothDemo} title={text().smoothTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>AreaRangeChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>tone</code></td><td><code>"category1" | ... | "category8"</code></td><td><code>"category1"</code></td></tr>
        <tr><td><code>smooth</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>AreaRangeChartDatum</code> = <code>{`{ x: string | number; low: number; high: number }`}</code>
      ·
      <code>AreaRangeChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-inverse</code></li>
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
