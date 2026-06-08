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
        "SankeyChart représente des flux pondérés entre des nœuds catégoriels. Il sert à visualiser acquisitions, transferts, allocations ou parcours agrégés.",
      examplesTitle: "Exemples",
      acquisitionTitle: "Flux d'acquisition",
      acquisitionDesc: "Un flux simple avec deux liens pondérés et un nœud accentué.",
      allocationTitle: "Allocation de budget",
      allocationDesc: "Plusieurs destinations partagent une même source.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le diagramme. Les liens sont exposés dans une liste accessible sous la forme source, cible, valeur.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Gardez les graphes petits et agrégés. Pour des réseaux denses, ForceGraph ou une table de flux filtrable seront plus adaptés.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "SankeyChart represents weighted flows between categorical nodes. Use it for acquisition, transfers, allocations, or aggregated journeys.",
      examplesTitle: "Examples",
      acquisitionTitle: "Acquisition flow",
      acquisitionDesc: "A simple flow with two weighted links and one accented node.",
      allocationTitle: "Budget allocation",
      allocationDesc: "Multiple destinations share the same source.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the diagram. Links are exposed in an accessible list as source, target, value.",
      usageTitle: "Usage notes",
      usageNote:
        "Keep graphs small and aggregated. For dense networks, ForceGraph or a filterable flow table will be more appropriate.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const acquisitionNodes = [
    { id: "visit", label: "Visites" },
    { id: "trial", label: "Essais", tone: "category4" },
    { id: "paid", label: "Payants" }
  ];

  const acquisitionLinks = [
    { source: "visit", target: "trial", value: 120 },
    { source: "trial", target: "paid", value: 48 }
  ];

  const budgetNodes = [
    { id: "platform", label: "Plateforme", tone: "category2" },
    { id: "compute", label: "Calcul" },
    { id: "data", label: "Données" },
    { id: "security", label: "Sécurité", tone: "category8" }
  ];

  const budgetLinks = [
    { source: "platform", target: "compute", value: 64 },
    { source: "platform", target: "data", value: 42 },
    { source: "platform", target: "security", value: 18 }
  ];

  const acquisitionDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "SankeyChart",
          props: {
            label: locale.value === "fr" ? "Flux d'acquisition" : "Acquisition flow",
            nodes: acquisitionNodes,
            links: acquisitionLinks
          }
        }
      ]
    }
  ]);

  const allocationDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "SankeyChart",
          props: {
            label: locale.value === "fr" ? "Allocation de budget" : "Budget allocation",
            nodes: budgetNodes,
            links: budgetLinks
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
      <h1>SankeyChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().acquisitionTitle}</h3>
    <p class="docs-demo-note">{text().acquisitionDesc}</p>
    <TabbedExample nodes={acquisitionDemo} title={text().acquisitionTitle} />

    <h3 class="docs-demo-title">{text().allocationTitle}</h3>
    <p class="docs-demo-note">{text().allocationDesc}</p>
    <TabbedExample nodes={allocationDemo} title={text().allocationTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>nodes</code></td><td><code>SankeyChartNode[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>links</code></td><td><code>SankeyChartLink[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>560</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>280</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>SankeyChartNode</code> = <code>{`{ id: string; label: string; tone?: SankeyChartTone }`}</code>
      ·
      <code>SankeyChartLink</code> = <code>{`{ source: string; target: string; value: number; tone?: SankeyChartTone }`}</code>.
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
</style>
