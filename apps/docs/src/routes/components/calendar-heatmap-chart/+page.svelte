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
        "CalendarHeatmapChart présente une grille semaine × jour-de-semaine (style GitHub) colorée selon l'intensité d'une valeur quotidienne. Idéal pour visualiser l'activité ou la densité d'événements dans le temps.",
      examplesTitle: "Exemples",
      activityTitle: "Activité de contribution",
      activityDesc: "Chaque cellule représente un jour ; l'intensité de couleur reflète la valeur. Les jours sans donnée sont grisés.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque date et sa valeur sont listées dans une région accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les dates doivent être au format `\"YYYY-MM-DD\"`. La grille s'étend du dimanche de la première semaine au samedi de la dernière. Les dates invalides sont ignorées silencieusement.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "CalendarHeatmapChart shows a week × day-of-week grid (GitHub style) coloured by the intensity of a daily value. Ideal for visualising activity or event density over time.",
      examplesTitle: "Examples",
      activityTitle: "Contribution activity",
      activityDesc: "Each cell represents a day; colour intensity reflects the value. Days without data are greyed out.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each date and its value are listed in an accessible region outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Dates must use the `\"YYYY-MM-DD\"` format. The grid spans from the Sunday of the first week to the Saturday of the last. Invalid dates are silently ignored.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const activityData = [
    { date: "2025-01-06", value: 3 },
    { date: "2025-01-07", value: 8 },
    { date: "2025-01-08", value: 5 },
    { date: "2025-01-09", value: 12 },
    { date: "2025-01-10", value: 2 },
    { date: "2025-01-13", value: 7 },
    { date: "2025-01-14", value: 15 },
    { date: "2025-01-15", value: 9 },
    { date: "2025-01-16", value: 4 },
    { date: "2025-01-17", value: 11 },
    { date: "2025-01-20", value: 6 },
    { date: "2025-01-21", value: 14 },
    { date: "2025-01-22", value: 1 },
    { date: "2025-01-23", value: 10 },
    { date: "2025-01-24", value: 8 }
  ];

  const activityDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "CalendarHeatmapChart",
          props: {
            label: locale.value === "fr" ? "Activité de contribution" : "Contribution activity",
            data: activityData
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
      <h1>CalendarHeatmapChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="calendarheatmapchart" title={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().activityTitle}</h3>
    <p class="docs-demo-note">{text().activityDesc}</p>
    <FrameworkDemo nodes={activityDemo} label={text().activityTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>CalendarHeatmapChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>140</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>CalendarHeatmapChartDatum</code> = <code>{`{ date: string; value: number }`}</code>
      · <code>date</code> au format <code>"YYYY-MM-DD"</code>
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
