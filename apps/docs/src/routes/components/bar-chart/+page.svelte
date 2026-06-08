<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, type BarChartDatum } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      intro:
        "Graphique à barres pour comparer des valeurs catégorielles. Orientation verticale ou horizontale, échelle automatique avec graduations « nice », tons sémantiques par barre, infobulle au survol et liste de valeurs accessible.",
      verticalTitle: "Vertical (par défaut)",
      verticalDesc: "Tokens consommés par jour de la semaine.",
      horizontalTitle: "Horizontal",
      horizontalDesc: "Pratique quand les libellés de catégorie sont longs.",
      tonesTitle: "Tons par barre",
      tonesDesc: "Chaque barre peut porter son propre `tone` (`category1` à `category8`).",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`label` est obligatoire : il alimente l’`aria-label` du conteneur (`role=\"img\"`). Les valeurs détaillées sont exposées dans une liste accessible hors SVG, sans multiplier les arrêts de tabulation.",
      usageNote2:
        "L’échelle inclut toujours zéro et les valeurs négatives sont supportées (les barres partent de la ligne du zéro).",
      usageNote3:
        "`width`/`height` définissent le `viewBox` ; le SVG est mis à l’échelle de façon responsive (`preserveAspectRatio`) à 100 % de la largeur du conteneur."
    },
    en: {
      intro:
        "Bar chart for comparing categorical values. Vertical or horizontal orientation, automatic nice-tick scale, per-bar semantic tones, a hover tooltip, and an accessible value list.",
      verticalTitle: "Vertical (default)",
      verticalDesc: "Tokens consumed per weekday.",
      horizontalTitle: "Horizontal",
      horizontalDesc: "Useful when category labels are long.",
      tonesTitle: "Per-bar tones",
      tonesDesc: "Each bar can carry its own `tone` (`category1` to `category8`).",
      usageTitle: "Usage notes",
      usageNote1:
        "`label` is required: it feeds the container `aria-label` (`role=\"img\"`). Detailed values are exposed in an accessible list outside the SVG, without adding a tab stop for every bar.",
      usageNote2:
        "The scale always includes zero and negative values are supported (bars start from the zero line).",
      usageNote3:
        "`width`/`height` set the `viewBox`; the SVG scales responsively (`preserveAspectRatio`) to 100% of the container width."
    }
  } as const;

  const text = () => copy[locale.value];

  const weekly: BarChartDatum[] = [
    { label: "Lun", value: 1240 },
    { label: "Mar", value: 1680 },
    { label: "Mer", value: 980 },
    { label: "Jeu", value: 2100 },
    { label: "Ven", value: 1520 },
    { label: "Sam", value: 420 },
    { label: "Dim", value: 310 }
  ];

  const byTool: BarChartDatum[] = [
    { label: "Recherche web", value: 312 },
    { label: "Lecture fichier", value: 248 },
    { label: "Exécution shell", value: 196 },
    { label: "Édition", value: 154 },
    { label: "Navigateur", value: 88 }
  ];

  const toned: BarChartDatum[] = [
    { label: "Réussi", value: 86, tone: "category4" },
    { label: "Réessais", value: 22, tone: "category6" },
    { label: "Échecs", value: 9, tone: "category8" }
  ];

  // Démos basculées dans le framework actif (arbre NodeSpec neutre).
  const verticalDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BarChart",
          props: {
            data: weekly,
            label: locale.value === "fr" ? "Tokens consommés par jour" : "Tokens consumed per day",
            width: 520,
            height: 260
          }
        }
      ]
    }
  ]);

  const horizontalDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BarChart",
          props: {
            data: byTool,
            orientation: "horizontal",
            label: locale.value === "fr" ? "Appels par outil d'agent" : "Calls per agent tool",
            width: 520,
            height: 260
          }
        }
      ]
    }
  ]);

  const tonesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BarChart",
          props: {
            data: toned,
            label: locale.value === "fr" ? "Issues des exécutions" : "Run outcomes",
            width: 520,
            height: 240
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
      <h1>BarChart</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <h3 class="docs-demo-title">{text().verticalTitle}</h3>
    <p class="docs-demo-note">{text().verticalDesc}</p>
    <TabbedExample nodes={verticalDemo} title={text().verticalTitle} />

    <h3 class="docs-demo-title">{text().horizontalTitle}</h3>
    <p class="docs-demo-note">{text().horizontalDesc}</p>
    <TabbedExample nodes={horizontalDemo} title={text().horizontalTitle} />

    <h3 class="docs-demo-title">{text().tonesTitle}</h3>
    <p class="docs-demo-note">{text().tonesDesc}</p>
    <TabbedExample nodes={tonesDemo} title={text().tonesTitle} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>BarChartDatum[]</code></td><td><code>[]</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "requis" : "required"}</em></td></tr>
        <tr><td><code>orientation</code></td><td><code>"vertical" | "horizontal"</code></td><td><code>"vertical"</code></td></tr>
        <tr><td><code>domain</code></td><td><code>[number, number]</code></td><td><em>auto</em></td></tr>
        <tr><td><code>scale</code></td><td><code>"linear" | "log"</code></td><td><code>"linear"</code></td></tr>
        <tr><td><code>invertAxis</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>referenceLines</code></td><td><code>ChartReferenceLine[]</code></td><td><em>{locale.value === "fr" ? "aucune" : "none"}</em></td></tr>
        <tr><td><code>bands</code></td><td><code>ChartBand[]</code></td><td><em>{locale.value === "fr" ? "aucune" : "none"}</em></td></tr>
        <tr><td><code>goalLine</code></td><td><code>ChartGoalLine</code></td><td><em>{locale.value === "fr" ? "aucune" : "none"}</em></td></tr>
        <tr><td><code>selectedKeys</code></td><td><code>string[]</code></td><td><code>[]</code></td></tr>
        <tr><td><code>onSelect</code></td><td><code>(key: string) =&gt; void</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>showLegend</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>BarChartDatum</code> = <code>{`{ label: string; value: number; tone?: BarChartTone }`}</code>
      ·
      <code>BarChartTone</code> = <code>"category1" | … | "category8"</code>
      {locale.value === "fr"
        ? "(défaut par barre : `category1`)."
        : "(per-bar default: `category1`)."}
    </p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Ajoute `errorLow` / `errorHigh` sur un datum pour dessiner une barre d’erreur. Les overlays utilisent l’axe de valeur : `axis: \"y\"` en vertical, `axis: \"x\"` en horizontal."
        : "Add `errorLow` / `errorHigh` on a datum to draw an error bar. Overlays track the value axis: `axis: \"y\"` in vertical mode, `axis: \"x\"` in horizontal mode."}
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
      <li><code>--st-component-barChart-gridStroke</code></li>
      <li><code>--st-component-barChart-axisStroke</code></li>
      <li><code>--st-component-barChart-labelColor</code></li>
      <li><code>--st-component-barChart-tooltipBackground</code></li>
      <li><code>--st-component-barChart-tooltipText</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-border-interactive</code></li>
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

  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
