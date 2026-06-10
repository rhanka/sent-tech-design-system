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
        "DependencyWheelChart répartit des nœuds sur un cercle et relie chaque dépendance par un ruban dont l'épaisseur croît avec le poids. Chaque nœud occupe un arc proportionnel à la somme des poids de ses liens, et le ruban prend la couleur du nœud source.",
      examplesTitle: "Exemples",
      modulesTitle: "Dépendances de modules",
      modulesDesc: "Imports pondérés entre modules ; les arcs sont dimensionnés par le poids cumulé du nœud.",
      labelsTitle: "Libellés personnalisés",
      labelsDesc: "Les identifiants techniques restent stables tandis que `labels` fournit l'affichage.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Chaque lien est exposé dans une liste accessible au format « source -> cible : poids ».",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les liens dont le poids n'est pas fini ou est négatif/nul sont ignorés. Limitez le nombre de nœuds pour préserver la lisibilité des rubans.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "DependencyWheelChart lays nodes out on a circle and links each dependency with a ribbon whose thickness grows with the weight. Each node occupies an arc sized by the sum of its link weights, and the ribbon takes the source node's colour.",
      examplesTitle: "Examples",
      modulesTitle: "Module dependencies",
      modulesDesc: "Weighted imports between modules; arcs are sized by the node's cumulative weight.",
      labelsTitle: "Custom labels",
      labelsDesc: "Stable technical ids while `labels` supplies the display text.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Each link is exposed in an accessible list as “source -> target: weight”.",
      usageTitle: "Usage notes",
      usageNote:
        "Links with non-finite or non-positive weights are ignored. Keep the node count modest to keep ribbons readable.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const modulesData = [
    { from: "ui", to: "core", weight: 8 },
    { from: "api", to: "core", weight: 5 },
    { from: "core", to: "utils", weight: 3 },
    { from: "api", to: "utils", weight: 2 }
  ];

  const labelsData = [
    { from: "ui", to: "core", weight: 8 },
    { from: "api", to: "core", weight: 5 },
    { from: "core", to: "utils", weight: 3 }
  ];

  const modulesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--wheel" },
      children: [
        {
          comp: "DependencyWheelChart",
          props: {
            label: locale.value === "fr" ? "Dépendances de modules" : "Module dependencies",
            data: modulesData
          }
        }
      ]
    }
  ]);

  const labelsDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--wheel" },
      children: [
        {
          comp: "DependencyWheelChart",
          props: {
            label: locale.value === "fr" ? "Libellés personnalisés" : "Custom labels",
            data: labelsData,
            labels: { ui: "Interface", core: "Noyau", utils: "Utilitaires", api: "API" }
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
      <h1>DependencyWheelChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().modulesTitle}</h3>
    <p class="docs-demo-note">{text().modulesDesc}</p>
    <TabbedExample nodes={modulesDemo} title={text().modulesTitle} />

    <h3 class="docs-demo-title">{text().labelsTitle}</h3>
    <p class="docs-demo-note">{text().labelsDesc}</p>
    <TabbedExample nodes={labelsDemo} title={text().labelsTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>DependencyWheelChartLink[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>labels</code></td><td><code>Record&lt;string, string&gt;</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>DependencyWheelChartLink</code> = <code>{`{ from: string; to: string; weight: number }`}</code>.
      Un nœud est créé pour chaque identifiant <code>from</code>/<code>to</code> cité.
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

  :global(.chart-wrapper--wheel) {
    max-width: 480px;
  }
</style>
