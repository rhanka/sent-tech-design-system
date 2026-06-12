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
        "ItemChart (graphe « parlement » / hémicycle) répartit la somme des sièges en plusieurs rangées concentriques formant un demi-anneau. Chaque groupe occupe un bloc de pastilles CONTIGUËS coloré par ton catégoriel : on lit sa part à la longueur de l'arc occupé, comme une répartition de sièges.",
      examplesTitle: "Exemples",
      basicTitle: "Composition d'une assemblée",
      basicDesc: "Une pastille par siège ; chaque groupe forme un bloc contigu coloré par ton.",
      scaleTitle: "Quelques grands groupes",
      scaleDesc:
        "Les sièges se répartissent sur 3 à 5 rangées, les rangées extérieures portant plus de pastilles pour garder un espacement régulier.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Une légende (label + nombre de sièges) accompagne le visuel, et les libellés/valeurs sont aussi rendus dans une liste accessible hors SVG pour les lecteurs d'écran.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Idéal pour des compositions discrètes (sièges, membres, allocations par catégorie). `value` est arrondie à l'entier le plus proche ; les valeurs négatives ou non finies valent zéro siège.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "ItemChart (parliament / hemicycle chart) lays the total number of seats out across several concentric rows forming a half-ring. Each group takes a CONTIGUOUS block of dots colored by categorical tone: you read its share from the length of the arc it occupies, like a seat allocation.",
      examplesTitle: "Examples",
      basicTitle: "Assembly composition",
      basicDesc: "One dot per seat; each group forms a contiguous block colored by tone.",
      scaleTitle: "A few large groups",
      scaleDesc:
        "Seats are spread over 3 to 5 rows, the outer rows carrying more dots to keep an even spacing.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). A legend (label + seat count) sits alongside the visual, and labels/values are also rendered in an accessible list outside the SVG for screen readers.",
      usageTitle: "Usage notes",
      usageNote:
        "Great for discrete compositions (seats, members, per-category allocations). `value` is rounded to the nearest integer; negative or non-finite values count as zero seats.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const basicDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ItemChart",
          props: {
            label: locale.value === "fr" ? "Sièges par groupe" : "Seats per group",
            data: [
              { label: locale.value === "fr" ? "Gauche" : "Left", value: 40 },
              { label: locale.value === "fr" ? "Centre" : "Centre", value: 22, tone: "category5" },
              { label: locale.value === "fr" ? "Droite" : "Right", value: 80 },
              { label: locale.value === "fr" ? "Indép." : "Indep.", value: 12 }
            ]
          }
        }
      ]
    }
  ]);

  const scaleDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ItemChart",
          props: {
            label: locale.value === "fr" ? "Répartition des membres" : "Member distribution",
            data: [
              { label: "A", value: 65 },
              { label: "B", value: 48 },
              { label: "C", value: 30 }
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
      <h1>ItemChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TabbedExample nodes={basicDemo} title={text().basicTitle} />

    <h3 class="docs-demo-title">{text().scaleTitle}</h3>
    <p class="docs-demo-note">{text().scaleDesc}</p>
    <TabbedExample nodes={scaleDemo} title={text().scaleTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>ItemChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>280</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ItemChartDatum</code> = <code>{`{ label: string; value: number; tone?: ItemChartTone }`}</code>
      ·
      <code>ItemChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-primary</code></li>
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
