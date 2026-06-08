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
        "ChordDiagram représente des flux pondérés entre nœuds disposés sur un cercle. Chaque nœud occupe un arc proportionnel à la somme de ses flux, et chaque flux est un ruban reliant deux arcs.",
      examplesTitle: "Exemples",
      regionsTitle: "Échanges entre régions",
      regionsDesc: "Quelques flux dirigés ; les arcs sont dimensionnés par la somme des flux du nœud.",
      labelsTitle: "Libellés personnalisés",
      labelsDesc: "Les identifiants techniques restent stables tandis que `labels` fournit l'affichage.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Chaque flux est exposé dans une liste accessible au format « source -> cible : valeur ».",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les flux dont la valeur n'est pas finie ou est négative/nulle sont ignorés. Limitez le nombre de nœuds pour préserver la lisibilité des rubans.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "ChordDiagram shows weighted flows between nodes laid out on a circle. Each node occupies an arc sized by the sum of its flows, and each flow is a ribbon linking two arcs.",
      examplesTitle: "Examples",
      regionsTitle: "Trade between regions",
      regionsDesc: "A few directed flows; arcs are sized by the node's total flow.",
      labelsTitle: "Custom labels",
      labelsDesc: "Stable technical ids while `labels` supplies the display text.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Each flow is exposed in an accessible list as “source -> target: value”.",
      usageTitle: "Usage notes",
      usageNote:
        "Flows with non-finite or non-positive values are ignored. Keep the node count modest to keep ribbons readable.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const regionsData = [
    { from: "Europe", to: "Asie", value: 24 },
    { from: "Asie", to: "Amérique", value: 18 },
    { from: "Amérique", to: "Europe", value: 12 },
    { from: "Europe", to: "Amérique", value: 9 }
  ];

  const labelsData = [
    { from: "eu", to: "as", value: 24 },
    { from: "as", to: "am", value: 18 },
    { from: "am", to: "eu", value: 12 }
  ];

  const regionsDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--radial" },
      children: [
        {
          comp: "ChordDiagram",
          props: {
            label: locale.value === "fr" ? "Échanges entre régions" : "Trade between regions",
            data: regionsData
          }
        }
      ]
    }
  ]);

  const labelsDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--radial" },
      children: [
        {
          comp: "ChordDiagram",
          props: {
            label: locale.value === "fr" ? "Libellés personnalisés" : "Custom labels",
            data: labelsData,
            labels: { eu: "Europe", as: "Asie", am: "Amérique" }
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
      <h1>ChordDiagram</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().regionsTitle}</h3>
    <p class="docs-demo-note">{text().regionsDesc}</p>
    <TabbedExample nodes={regionsDemo} title={text().regionsTitle} />

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
        <tr><td><code>data</code></td><td><code>ChordDiagramFlow[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>labels</code></td><td><code>Record&lt;string, string&gt;</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ChordDiagramFlow</code> = <code>{`{ from: string; to: string; value: number }`}</code>.
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

  :global(.chart-wrapper--radial) {
    max-width: 420px;
  }
</style>
