<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "BumpChart visualise des classements dans le temps avec des courbes qui montent et descendent. Le rang 1 est toujours affiché en haut. Les rangs invalides créent un GAP dans la courbe.",
      examplesTitle: "Exemples",
      frameworkTitle: "Classement des frameworks JS",
      frameworkDesc: "Évolution des classements de popularité sur quatre ans. Les étiquettes de début et fin identifient chaque série.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque série liste ses classements par catégorie dans une région accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les rangs doivent être des entiers ≥ 1. Un `null` ou un nombre non-entier crée un GAP propre sur la ligne concernée. `categories` et `ranks` sont alignés par position.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "BumpChart visualises rankings over time with rising and falling curves. Rank 1 is always displayed at the top. Invalid ranks create a gap in the line.",
      examplesTitle: "Examples",
      frameworkTitle: "JS framework rankings",
      frameworkDesc: "Popularity ranking evolution over four years. Start and end labels identify each series.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each series lists its rankings per category in an accessible region outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Ranks must be integers ≥ 1. A `null` or non-integer number creates a clean gap on that line. `categories` and `ranks` are aligned by position.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const frameworkData = [
    { label: "React", ranks: [1, 1, 1, 1], tone: "category1" },
    { label: "Vue", ranks: [3, 2, 2, 2], tone: "category2" },
    { label: "Svelte", ranks: [5, 4, 3, 3], tone: "category3" },
    { label: "Angular", ranks: [2, 3, 4, 4], tone: "category4" }
  ];

  const frameworkDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BumpChart",
          props: {
            label: locale.value === "fr" ? "Classement des frameworks JS" : "JS framework rankings",
            categories: ["2022", "2023", "2024", "2025"],
            data: frameworkData
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
      <h1>BumpChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <TriRender nodes={getExample("bumpchart")?.nodes ?? []} label={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().frameworkTitle}</h3>
    <p class="docs-demo-note">{text().frameworkDesc}</p>
    <TriRender nodes={frameworkDemo} label={text().frameworkTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>BumpChartSeries[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>categories</code></td><td><code>string[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>300</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>BumpChartSeries</code> = <code>{`{ label: string; ranks: (number | null | undefined)[]; tone?: BumpChartTone }`}</code>
      ·
      <code>BumpChartTone</code> = <code>"category1" | ... | "category8"</code>
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
