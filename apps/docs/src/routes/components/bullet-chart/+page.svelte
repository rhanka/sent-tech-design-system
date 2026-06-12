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
        "BulletChart est un bullet graph qui compare une mesure à une cible et la positionne par rapport à des bandes qualitatives (faible / moyen / élevé). Idéal pour les tableaux de bord KPI.",
      examplesTitle: "Exemples",
      horizontalTitle: "Orientation horizontale",
      horizontalDesc: "Chaque rang affiche la mesure (barre foncée), la cible (trait vertical) et les bandes de fond qualitatives.",
      verticalTitle: "Orientation verticale",
      verticalDesc: "Passez `orientation=\"vertical\"` pour un affichage en colonnes.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Les valeurs (value / target) sont exposées dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez au moins un élément dans `ranges` par donnée pour contextualiser la mesure. La barre démarre toujours à 0 pour refléter l'amplitude réelle.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "BulletChart is a bullet graph that compares a measure to a target and positions it against qualitative range bands (low / medium / high). Ideal for KPI dashboards.",
      examplesTitle: "Examples",
      horizontalTitle: "Horizontal orientation",
      horizontalDesc: "Each row shows the measure (dark bar), target (vertical marker) and qualitative background bands.",
      verticalTitle: "Vertical orientation",
      verticalDesc: "Pass `orientation=\"vertical\"` for a column-based display.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Values (value / target) are also exposed in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide at least one `ranges` entry per datum to contextualise the measure. The bar always starts at 0 to reflect the true magnitude.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const horizontalDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BulletChart",
          props: {
            label: locale.value === "fr" ? "Objectifs trimestriels" : "Quarterly targets",
            data: [
              { label: "Revenu", value: 82, target: 100, ranges: [50, 80, 110] },
              { label: "NPS", value: 67, target: 75, ranges: [40, 65, 90] },
              { label: "Uptime", value: 99.2, target: 99.5, ranges: [95, 99, 100] }
            ]
          }
        }
      ]
    }
  ]);

  const verticalDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BulletChart",
          props: {
            label: locale.value === "fr" ? "Objectifs : vertical" : "Targets: vertical",
            orientation: "vertical",
            data: [
              { label: "Revenu", value: 82, target: 100, ranges: [50, 80, 110] },
              { label: "NPS", value: 67, target: 75, ranges: [40, 65, 90] },
              { label: "Uptime", value: 99.2, target: 99.5, ranges: [95, 99, 100] }
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
      <h1>BulletChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().horizontalTitle}</h3>
    <p class="docs-demo-note">{text().horizontalDesc}</p>
    <TabbedExample nodes={horizontalDemo} title={text().horizontalTitle} />

    <h3 class="docs-demo-title">{text().verticalTitle}</h3>
    <p class="docs-demo-note">{text().verticalDesc}</p>
    <TabbedExample nodes={verticalDemo} title={text().verticalTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>BulletChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>orientation</code></td><td><code>"horizontal" | "vertical"</code></td><td><code>"horizontal"</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>BulletChartDatum</code> = <code>{`{ label: string; value: number; target: number; ranges?: number[] }`}</code>
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
      <li><code>--st-semantic-data-category1</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
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
