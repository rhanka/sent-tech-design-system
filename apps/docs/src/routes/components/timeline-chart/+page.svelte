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
        "TimelineChart positionne des événements le long d'un axe horizontal gradué. Chaque événement reçoit un marqueur sur la frise et un libellé alterné au-dessus ou en dessous, relié par un connecteur. La couleur des marqueurs cycle dans la palette catégorielle ; les événements sont triés par position.",
      examplesTitle: "Exemples",
      historyTitle: "Histoire d'une entreprise",
      historyDesc: "Jalons positionnés par année. Les libellés alternent au-dessus et en dessous de l'axe pour éviter le chevauchement ; les descriptions enrichissent l'info-bulle et la liste accessible.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque événement expose sa position, son libellé et sa description dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "`position` est un nombre (année, jour, index) projeté sur un axe linéaire gradué automatiquement. Les libellés trop longs sont tronqués (ellipsis) pour garder la frise lisible ; le libellé complet reste dans l'info-bulle et la liste accessible.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "TimelineChart positions events along a graduated horizontal axis. Each event gets a marker on the timeline plus a label alternated above or below, joined by a connector. Marker colours cycle through the categorical palette; events are sorted by position.",
      examplesTitle: "Examples",
      historyTitle: "Company history",
      historyDesc: "Milestones positioned by year. Labels alternate above and below the axis to avoid overlap; descriptions enrich the tooltip and the accessible list.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each event exposes its position, label and description in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "`position` is a number (year, day, index) projected onto an automatically graduated linear axis. Overly long labels are truncated (ellipsis) to keep the timeline readable; the full label stays in the tooltip and the accessible list.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const historyData = [
    { position: 2018, label: "Fondation", description: "Création de SENT à Montréal." },
    { position: 2020, label: "Série A", description: "Levée de 5 M$." },
    { position: 2021, label: "Lancement v1" },
    { position: 2022, label: "Expansion EU", description: "Ouverture du bureau de Paris." },
    { position: 2024, label: "Série B", description: "Levée de 22 M$." }
  ];

  const historyDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "TimelineChart",
          props: {
            label: locale.value === "fr" ? "Histoire de SENT" : "SENT history",
            data: historyData
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
      <h1>TimelineChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().historyTitle}</h3>
    <p class="docs-demo-note">{text().historyDesc}</p>
    <TabbedExample nodes={historyDemo} title={text().historyTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>TimelineChartEvent[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>640</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>TimelineChartEvent</code> = <code>{`{ position: number; label: string; description?: string; tone?: "category1".."category8" }`}</code>
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
      <li><code>--st-semantic-data-category1</code> … <code>--st-semantic-data-category8</code></li>
      <li><code>--st-semantic-border-strong</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-primary</code></li>
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
    max-width: 640px;
    margin-top: 0.75rem;
  }
</style>
