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
        "RadarChart compare plusieurs séries sur les mêmes axes polaires. Il convient aux profils de capacité, évaluations multi-critères et écarts cible versus actuel.",
      examplesTitle: "Exemples",
      capabilityTitle: "Capacités produit",
      capabilityDesc: "Deux séries sur des axes communs avec légende intégrée.",
      scoreTitle: "Score opérationnel",
      scoreDesc: "Un radar peut rester lisible avec une seule série quand les axes restent peu nombreux.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque valeur de série est aussi exposée dans une liste accessible associant série, axe et score.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Limitez le nombre d'axes. Au-delà de six axes ou de trois séries, une table ou un graphique en barres groupées sera souvent plus lisible.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "RadarChart compares multiple series across the same polar axes. Use it for capability profiles, multi-criteria assessments, and target versus current gaps.",
      examplesTitle: "Examples",
      capabilityTitle: "Product capabilities",
      capabilityDesc: "Two series across shared axes with an integrated legend.",
      scoreTitle: "Operational score",
      scoreDesc: "A radar can stay readable with one series when the axis count remains low.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each series value is also exposed in an accessible list pairing series, axis, and score.",
      usageTitle: "Usage notes",
      usageNote:
        "Limit the number of axes. Beyond six axes or three series, a table or grouped bar chart is often easier to read.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const capabilityAxes = ["Vitesse", "Qualité", "Coût", "Portée"];
  const capabilitySeries = [
    { label: "Actuel", values: [80, 65, 45, 70] },
    { label: "Cible", values: [90, 85, 70, 86], tone: "category7" }
  ];

  const opsAxes = ["Disponibilité", "Latence", "Coût", "Support", "Sécurité"];
  const opsSeries = [
    { label: "Plateforme", values: [94, 72, 81, 88, 90], tone: "category4" }
  ];

  const capabilityDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "RadarChart",
          props: {
            label: locale.value === "fr" ? "Capacités produit" : "Product capabilities",
            axes: capabilityAxes,
            series: capabilitySeries,
            legend: true
          }
        }
      ]
    }
  ]);

  const scoreDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "RadarChart",
          props: {
            label: locale.value === "fr" ? "Score opérationnel" : "Operational score",
            axes: opsAxes,
            series: opsSeries
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
      <h1>RadarChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <TriRender nodes={getExample("radarchart")?.nodes ?? []} label={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().capabilityTitle}</h3>
    <p class="docs-demo-note">{text().capabilityDesc}</p>
    <TriRender nodes={capabilityDemo} label={text().capabilityTitle} />

    <h3 class="docs-demo-title">{text().scoreTitle}</h3>
    <p class="docs-demo-note">{text().scoreDesc}</p>
    <TriRender nodes={scoreDemo} label={text().scoreTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>axes</code></td><td><code>string[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>series</code></td><td><code>RadarChartSeries[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>legend</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>maxValue</code></td><td><code>number</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>levels</code></td><td><code>number</code></td><td><code>4</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>320</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>RadarChartSeries</code> = <code>{`{ label: string; values: number[]; tone?: RadarChartTone }`}</code>
      ·
      <code>RadarChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
