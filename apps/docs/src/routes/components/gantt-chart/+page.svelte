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
        "GanttChart visualise un planning : une ligne par tâche, une barre horizontale couvrant `start → end` sur un axe temporel commun (positions numériques — jours, semaines ou index). La couleur suit la catégorie de chaque tâche (jusqu'à huit teintes) ou reste unie. Un marqueur vertical optionnel matérialise « aujourd'hui ».",
      examplesTitle: "Exemples",
      planTitle: "Planning de projet",
      planDesc: "Quatre tâches réparties en deux lots (Étude, Build). Chaque barre démarre à son `start` et s'étend jusqu'à `end` ; le trait pointillé rouge repère le jour courant.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque tâche expose `tâche → start → end` dans une liste accessible hors SVG ; la légende des catégories est une vraie liste HTML.",
      usageTitle: "Notes d'usage",
      usageNote:
        "`start` et `end` sont des positions numériques sur un même axe (jours, semaines, index). Le composant normalise les bornes inversées (`start ≤ end`), ignore les tâches non finies ou sans libellé, et tronque les libellés longs à gauche.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "GanttChart visualises a schedule: one row per task, a horizontal bar spanning `start → end` on a shared time axis (numeric positions — days, weeks or index). Colour follows each task's category (up to eight hues) or stays uniform. An optional vertical marker pins \"today\".",
      examplesTitle: "Examples",
      planTitle: "Project schedule",
      planDesc: "Four tasks across two work packages (Study, Build). Each bar starts at its `start` and extends to `end`; the dashed red line marks the current day.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each task exposes `task → start → end` in an accessible list outside the SVG; the category legend is a real HTML list.",
      usageTitle: "Usage notes",
      usageNote:
        "`start` and `end` are numeric positions on a shared axis (days, weeks, index). The component normalises swapped bounds (`start ≤ end`), drops non-finite or unlabeled tasks, and truncates long labels on the left.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const planData = [
    { task: "Cadrage", start: 0, end: 3, category: "Étude" },
    { task: "Conception", start: 3, end: 8, category: "Étude" },
    { task: "Développement", start: 6, end: 16, category: "Build" },
    { task: "Recette", start: 14, end: 20, category: "Build" }
  ];

  const planDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "GanttChart",
          props: {
            label: locale.value === "fr" ? "Planning projet — semaines" : "Project schedule — weeks",
            data: planData,
            marker: 10
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
      <h1>GanttChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().planTitle}</h3>
    <p class="docs-demo-note">{text().planDesc}</p>
    <TabbedExample nodes={planDemo} title={text().planTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>GanttChartTask[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>640</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>320</code></td></tr>
        <tr><td><code>marker</code></td><td><code>number</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>GanttChartTask</code> = <code>{`{ task: string; start: number; end: number; category?: string }`}</code>
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
      <li><code>--st-semantic-feedback-error</code></li>
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
    max-width: 640px;
    margin-top: 0.75rem;
  }
</style>
