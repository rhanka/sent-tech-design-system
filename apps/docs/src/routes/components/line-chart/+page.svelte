<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge, type LineChartDatum } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      intro:
        "Graphique en ligne pour visualiser une série temporelle ou numérique. Axe X ordinal (libellés) ou numérique (échelle linéaire), lissage Bézier optionnel, remplissage d’aire optionnel, tons sémantiques, infobulle au survol et liste de valeurs accessible.",
      simpleTitle: "Ligne simple",
      simpleDesc: "Série hebdomadaire avec axe X ordinal.",
      smoothTitle: "Lissage + aire",
      smoothDesc: "`smooth` active la courbe Bézier ; `area` remplit sous la ligne.",
      numericTitle: "Axe X numérique",
      numericDesc: "Quand tous les `x` sont des nombres, l’axe utilise une échelle linéaire et n’affiche qu’une sélection de graduations.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`label` est obligatoire : il alimente l’`aria-label` du conteneur (`role=\"img\"`). Les couples `x : y` sont exposés dans une liste accessible hors SVG, sans multiplier les arrêts de tabulation.",
      usageNote2:
        "L’axe Y est rembourré (~8 %) autour des valeurs et utilise des graduations « nice » ; le domaine ne force pas le zéro.",
      usageNote3:
        "`width`/`height` définissent le `viewBox` ; le SVG est mis à l’échelle de façon responsive (`preserveAspectRatio`) à 100 % de la largeur du conteneur."
    },
    en: {
      intro:
        "Line chart for a temporal or numeric series. Ordinal X axis (labels) or numeric X axis (linear scale), optional Bezier smoothing, optional area fill, semantic tones, a hover tooltip, and an accessible value list.",
      simpleTitle: "Simple line",
      simpleDesc: "Weekly series with an ordinal X axis.",
      smoothTitle: "Smoothing + area",
      smoothDesc: "`smooth` enables the Bezier curve; `area` fills below the line.",
      numericTitle: "Numeric X axis",
      numericDesc: "When every `x` is a number, the axis uses a linear scale and renders only a subset of ticks.",
      usageTitle: "Usage notes",
      usageNote1:
        "`label` is required: it feeds the container `aria-label` (`role=\"img\"`). The `x: y` pairs are exposed in an accessible list outside the SVG, without adding a tab stop for every point.",
      usageNote2:
        "The Y axis is padded (~8%) around values and uses nice ticks; the domain does not force zero.",
      usageNote3:
        "`width`/`height` set the `viewBox`; the SVG scales responsively (`preserveAspectRatio`) to 100% of the container width."
    }
  } as const;

  const text = () => copy[locale.value];

  const weekly: LineChartDatum[] = [
    { x: "Lun", y: 42 },
    { x: "Mar", y: 65 },
    { x: "Mer", y: 30 },
    { x: "Jeu", y: 85 },
    { x: "Ven", y: 55 },
    { x: "Sam", y: 20 },
    { x: "Dim", y: 15 }
  ];

  const monthlyCost: LineChartDatum[] = [
    { x: "Jan", y: 1.8 },
    { x: "Fév", y: 2.4 },
    { x: "Mar", y: 2.1 },
    { x: "Avr", y: 3.2 },
    { x: "Mai", y: 4.6 },
    { x: "Jui", y: 4.1 }
  ];

  const latency: LineChartDatum[] = [
    { x: 0, y: 320 },
    { x: 4, y: 290 },
    { x: 8, y: 410 },
    { x: 12, y: 380 },
    { x: 16, y: 510 },
    { x: 20, y: 470 },
    { x: 24, y: 350 }
  ];

  // Démos basculées dans le framework actif (arbre NodeSpec neutre).
  const simpleDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "LineChart",
          props: {
            data: weekly,
            label: locale.value === "fr" ? "Requêtes par jour" : "Requests per day",
            width: 520,
            height: 260
          }
        }
      ]
    }
  ]);

  const smoothDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "LineChart",
          props: {
            data: monthlyCost,
            smooth: true,
            area: true,
            tone: "category3",
            label: locale.value === "fr" ? "Coût mensuel (k$)" : "Monthly cost (k$)",
            width: 520,
            height: 260
          }
        }
      ]
    }
  ]);

  const numericDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "LineChart",
          props: {
            data: latency,
            tone: "category5",
            label: locale.value === "fr" ? "Latence (ms) sur 24 h" : "Latency (ms) over 24h",
            width: 520,
            height: 260
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "areaChartKicker")}</p>
    <div class="docs-hero-title">
      <h1>LineChart</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TriRender nodes={getExample("linechart")?.nodes ?? []} label="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <h3 class="docs-demo-title">{text().simpleTitle}</h3>
    <p class="docs-demo-note">{text().simpleDesc}</p>
    <TriRender nodes={simpleDemo} label={text().simpleTitle} />

    <h3 class="docs-demo-title">{text().smoothTitle}</h3>
    <p class="docs-demo-note">{text().smoothDesc}</p>
    <TriRender nodes={smoothDemo} label={text().smoothTitle} />

    <h3 class="docs-demo-title">{text().numericTitle}</h3>
    <p class="docs-demo-note">{text().numericDesc}</p>
    <TriRender nodes={numericDemo} label={text().numericTitle} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>LineChartDatum[]</code></td><td><code>[]</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "requis" : "required"}</em></td></tr>
        <tr><td><code>tone</code></td><td><code>LineChartTone</code></td><td><code>"category1"</code></td></tr>
        <tr><td><code>smooth</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>area</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>domain</code></td><td><code>[number, number]</code></td><td><em>auto</em></td></tr>
        <tr><td><code>scale</code></td><td><code>"linear" | "log"</code></td><td><code>"linear"</code></td></tr>
        <tr><td><code>invertAxis</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>referenceLines</code></td><td><code>ChartReferenceLine[]</code></td><td><em>{locale.value === "fr" ? "aucune" : "none"}</em></td></tr>
        <tr><td><code>bands</code></td><td><code>ChartBand[]</code></td><td><em>{locale.value === "fr" ? "aucune" : "none"}</em></td></tr>
        <tr><td><code>goalLine</code></td><td><code>ChartGoalLine</code></td><td><em>{locale.value === "fr" ? "aucune" : "none"}</em></td></tr>
        <tr><td><code>trend</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>data[].forecast</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>showLegend</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>LineChartDatum</code> = <code>{`{ x: number | string; y: number; forecast?: boolean }`}</code>
      ·
      <code>LineChartTone</code> = <code>"category1" | … | "category8"</code>.
      {locale.value === "fr"
        ? "Si tous les `x` sont numériques, l’axe X devient linéaire ; sinon il est ordinal (réparti uniformément)."
        : "If every `x` is numeric the X axis becomes linear; otherwise it is ordinal (evenly distributed)."}
    </p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Les overlays sont ajoutés à la liste accessible : lignes de référence, bandes, ligne d’objectif et tendance linéaire."
        : "Overlays are also exposed in the accessible list: reference lines, bands, goal line, and linear trend."}
    </p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Chaque point peut porter `forecast: true` : il est alors rendu en prévision — segment(s) pointillé(s) avec le ton prévision dédié, y compris le segment entre le dernier point réel et le premier point de prévision (transition continue). Les valeurs concernées sont annoncées « … (prévision) » dans la liste accessible. Sans point en prévision, le rendu est inchangé."
        : "Each datum may carry `forecast: true`: it then renders as a forecast — dashed segment(s) in the dedicated forecast tone, including the segment between the last actual point and the first forecast point (continuous transition). Affected values are announced as “… (prévision)” in the accessible list. Without any forecast datum, rendering is unchanged."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">{text().usageNote3}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-data-category1</code> … <code>--st-semantic-data-category8</code></li>
      <li><code>--st-component-lineChart-gridStroke</code></li>
      <li><code>--st-component-lineChart-axisStroke</code></li>
      <li><code>--st-component-lineChart-labelColor</code></li>
      <li><code>--st-component-lineChart-forecastStroke</code></li>
      <li><code>--st-component-lineChart-tooltipBackground</code></li>
      <li><code>--st-component-lineChart-tooltipText</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-border-interactive</code></li>
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

  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
