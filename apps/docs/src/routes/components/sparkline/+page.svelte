<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      intro:
        "Mini-graphique en ligne, sans axes ni libellés, conçu pour s’insérer dans une phrase, une cellule de table ou une carte de métrique. Tons sémantiques neutral/success/warning/error et remplissage d’aire optionnel.",
      inlineTitle: "En ligne dans une phrase",
      inlineDesc: "Le Sparkline s’aligne sur la ligne de texte (`vertical-align: middle`).",
      tonesTitle: "Tons",
      tonesDesc: "`tone` mappe sur les couleurs de feedback du thème.",
      areaTitle: "Avec aire",
      areaDesc: "`area` ajoute un remplissage léger sous la courbe.",
      cardsTitle: "Cartes de métrique",
      cardsDesc: "Cas d’usage typique : une tendance hebdomadaire sous un chiffre clé.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "Le conteneur a `role=\"img\"`. Fournissez `label` pour décrire la tendance aux lecteurs d’écran ; le SVG interne est alors masqué (`aria-hidden`).",
      usageNote2:
        "`data` est un tableau de nombres bruts, normalisé automatiquement sur l’amplitude min/max. Pas d’interaction ni d’infobulle : c’est une visualisation purement décorative/indicative.",
      week: "Cette semaine",
      tokensConsumed: "Tokens consommés",
      successRate: "Taux de réussite",
      avgLatency: "Latence moyenne"
    },
    en: {
      intro:
        "Tiny inline chart with no axes or labels, designed to sit inside a sentence, a table cell, or a metric card. Semantic neutral/success/warning/error tones and an optional area fill.",
      inlineTitle: "Inline within a sentence",
      inlineDesc: "The Sparkline aligns to the text line (`vertical-align: middle`).",
      tonesTitle: "Tones",
      tonesDesc: "`tone` maps to the theme feedback colors.",
      areaTitle: "With area",
      areaDesc: "`area` adds a light fill below the curve.",
      cardsTitle: "Metric cards",
      cardsDesc: "Typical use case: a weekly trend under a headline figure.",
      usageTitle: "Usage notes",
      usageNote1:
        "The container has `role=\"img\"`. Provide `label` to describe the trend to screen readers; the inner SVG is then hidden (`aria-hidden`).",
      usageNote2:
        "`data` is an array of raw numbers, auto-normalized over the min/max span. No interaction or tooltip: it is a purely decorative/indicative visualization.",
      week: "This week",
      tokensConsumed: "Tokens consumed",
      successRate: "Success rate",
      avgLatency: "Avg latency"
    }
  } as const;

  const text = () => copy[locale.value];

  const trendUp = [12, 18, 14, 22, 19, 28, 34];
  const trendDown = [48, 44, 46, 38, 30, 26, 21];
  const wobble = [30, 42, 35, 50, 38, 44, 41];

  // Démos basculées dans le framework actif (arbre NodeSpec neutre). Les textes
  // bilingues sont dérivés de la locale.
  const inlineDemo = $derived<NodeSpec[]>([
    {
      el: "p",
      props: { class: "inline-demo" },
      children: [
        locale.value === "fr" ? "Consommation de tokens " : "Token usage ",
        {
          comp: "Sparkline",
          props: {
            data: trendUp,
            tone: "success",
            label: locale.value === "fr" ? "Tendance à la hausse sur 7 jours" : "Upward 7-day trend"
          }
        },
        locale.value === "fr" ? " en hausse, et latence " : " rising, and latency ",
        {
          comp: "Sparkline",
          props: {
            data: trendDown,
            tone: "error",
            label: locale.value === "fr" ? "Tendance à la baisse sur 7 jours" : "Downward 7-day trend"
          }
        },
        locale.value === "fr" ? " en baisse." : " falling."
      ]
    }
  ]);

  const tonesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "tone-row" },
      children: [
        {
          el: "span",
          children: [
            { el: "code", children: ["neutral"] },
            " ",
            { comp: "Sparkline", props: { data: wobble, tone: "neutral", label: "neutral" } }
          ]
        },
        {
          el: "span",
          children: [
            { el: "code", children: ["success"] },
            " ",
            { comp: "Sparkline", props: { data: trendUp, tone: "success", label: "success" } }
          ]
        },
        {
          el: "span",
          children: [
            { el: "code", children: ["warning"] },
            " ",
            { comp: "Sparkline", props: { data: wobble, tone: "warning", label: "warning" } }
          ]
        },
        {
          el: "span",
          children: [
            { el: "code", children: ["error"] },
            " ",
            { comp: "Sparkline", props: { data: trendDown, tone: "error", label: "error" } }
          ]
        }
      ]
    }
  ];

  const areaDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "tone-row" },
      children: [
        {
          comp: "Sparkline",
          props: {
            data: trendUp,
            tone: "success",
            area: true,
            width: 160,
            height: 40,
            strokeWidth: 2,
            label: locale.value === "fr" ? "Tendance avec aire remplie" : "Trend with filled area"
          }
        }
      ]
    }
  ]);

  const cardsDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "card-row" },
      children: [
        {
          el: "div",
          props: { class: "metric-card" },
          children: [
            { el: "span", props: { class: "metric-label" }, children: [text().tokensConsumed] },
            { el: "span", props: { class: "metric-value" }, children: ["8,2k"] },
            {
              comp: "Sparkline",
              props: {
                data: trendUp,
                tone: "success",
                width: 140,
                height: 32,
                area: true,
                label: `${text().tokensConsumed}: ${text().week}`
              }
            }
          ]
        },
        {
          el: "div",
          props: { class: "metric-card" },
          children: [
            { el: "span", props: { class: "metric-label" }, children: [text().avgLatency] },
            { el: "span", props: { class: "metric-value" }, children: ["412 ms"] },
            {
              comp: "Sparkline",
              props: {
                data: trendDown,
                tone: "warning",
                width: 140,
                height: 32,
                area: true,
                label: `${text().avgLatency}: ${text().week}`
              }
            }
          ]
        },
        {
          el: "div",
          props: { class: "metric-card" },
          children: [
            { el: "span", props: { class: "metric-label" }, children: [text().successRate] },
            { el: "span", props: { class: "metric-value" }, children: ["98,4 %"] },
            {
              comp: "Sparkline",
              props: {
                data: wobble,
                tone: "neutral",
                width: 140,
                height: 32,
                label: `${text().successRate}: ${text().week}`
              }
            }
          ]
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "areaChartKicker")}</p>
    <div class="docs-hero-title">
      <h1>Sparkline</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <h3 class="docs-demo-title">{text().inlineTitle}</h3>
    <p class="docs-demo-note">{text().inlineDesc}</p>
    <TabbedExample nodes={inlineDemo} title={text().inlineTitle} />

    <h3 class="docs-demo-title">{text().tonesTitle}</h3>
    <p class="docs-demo-note">{text().tonesDesc}</p>
    <TabbedExample nodes={tonesDemo} title={text().tonesTitle} />

    <h3 class="docs-demo-title">{text().areaTitle}</h3>
    <p class="docs-demo-note">{text().areaDesc}</p>
    <TabbedExample nodes={areaDemo} title={text().areaTitle} />

    <h3 class="docs-demo-title">{text().cardsTitle}</h3>
    <p class="docs-demo-note">{text().cardsDesc}</p>
    <TabbedExample nodes={cardsDemo} title={text().cardsTitle} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>number[]</code></td><td><em>{locale.value === "fr" ? "requis" : "required"}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>120</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>28</code></td></tr>
        <tr><td><code>tone</code></td><td><code>"neutral" | "success" | "warning" | "error"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>strokeWidth</code></td><td><code>number</code></td><td><code>1.5</code></td></tr>
        <tr><td><code>area</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-sparkline-neutralStroke</code></li>
      <li><code>--st-component-sparkline-successStroke</code></li>
      <li><code>--st-component-sparkline-warningStroke</code></li>
      <li><code>--st-component-sparkline-errorStroke</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-feedback-success</code></li>
      <li><code>--st-semantic-feedback-warning</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
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

  /* Les démos sont rendues dans des composants enfants (SvelteNode) ou des îles
     React/Vue : leurs styles doivent être globaux pour traverser la frontière. */
  :global(.inline-demo) {
    line-height: 2.2;
    color: var(--st-semantic-text-primary);
  }

  :global(.tone-row) {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
    margin-top: 0.75rem;
  }

  :global(.tone-row span) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--st-semantic-text-secondary);
  }

  :global(.card-row) {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  :global(.metric-card) {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    background: var(--st-semantic-surface-default);
    min-width: 160px;
  }

  :global(.metric-label) {
    font-size: 0.8125rem;
    color: var(--st-semantic-text-secondary);
  }

  :global(.metric-value) {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary);
  }
</style>
