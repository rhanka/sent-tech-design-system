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
        "SunburstChart visualise une hiérarchie sous forme d'anneaux radiaux. Il montre les contributions imbriquées tout en gardant la racine et les feuilles dans le même graphique.",
      examplesTitle: "Exemples",
      revenueTitle: "Hiérarchie de revenus",
      revenueDesc: "Arbre à deux niveaux avec une branche détaillée et une feuille accentuée.",
      portfolioTitle: "Portefeuille produit",
      portfolioDesc: "Plusieurs familles peuvent être comparées sans changer de vue.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Les feuilles sont exposées dans une liste accessible avec leur chemin complet dans l'arbre.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Limitez la profondeur pour préserver les libellés. Pour explorer plus de niveaux, combinez le graphique avec une table hiérarchique.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "SunburstChart visualizes a hierarchy as radial rings. It shows nested contributions while keeping the root and leaves in one chart.",
      examplesTitle: "Examples",
      revenueTitle: "Revenue hierarchy",
      revenueDesc: "Two-level tree with one detailed branch and one accented leaf.",
      portfolioTitle: "Product portfolio",
      portfolioDesc: "Multiple families can be compared without switching views.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Leaves are exposed in an accessible list with their full path through the tree.",
      usageTitle: "Usage notes",
      usageNote:
        "Limit depth to preserve labels. For deeper exploration, pair the chart with a hierarchical table.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const revenueData = {
    label: "Revenus",
    children: [
      { label: "Produit", children: [{ label: "Core", value: 40 }, { label: "Addons", value: 20 }] },
      { label: "Services", value: 30, tone: "category8" }
    ]
  };

  const portfolioData = {
    label: "Portefeuille",
    children: [
      {
        label: "Applications",
        children: [
          { label: "Docs", value: 26, tone: "category3" },
          { label: "Console", value: 34 }
        ]
      },
      {
        label: "Plateforme",
        children: [
          { label: "API", value: 42, tone: "category5" },
          { label: "Data", value: 28 }
        ]
      }
    ]
  };

  const revenueDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--radial" },
      children: [
        {
          comp: "SunburstChart",
          props: {
            label: locale.value === "fr" ? "Hiérarchie de revenus" : "Revenue hierarchy",
            data: revenueData,
            legend: true
          }
        }
      ]
    }
  ]);

  const portfolioDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--radial" },
      children: [
        {
          comp: "SunburstChart",
          props: {
            label: locale.value === "fr" ? "Portefeuille produit" : "Product portfolio",
            data: portfolioData
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
      <h1>SunburstChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="sunburstchart" title={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().revenueTitle}</h3>
    <p class="docs-demo-note">{text().revenueDesc}</p>
    <FrameworkDemo nodes={revenueDemo} label={text().revenueTitle} />

    <h3 class="docs-demo-title">{text().portfolioTitle}</h3>
    <p class="docs-demo-note">{text().portfolioDesc}</p>
    <FrameworkDemo nodes={portfolioDemo} label={text().portfolioTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>SunburstChartDatum</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>legend</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>320</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>320</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>SunburstChartDatum</code> = <code>{`{ label: string; value?: number; tone?: SunburstChartTone; children?: SunburstChartDatum[] }`}</code>
      ·
      <code>SunburstChartTone</code> = <code>"category1" | ... | "category8"</code>.
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

  :global(.chart-wrapper--radial) {
    max-width: 420px;
  }
</style>
