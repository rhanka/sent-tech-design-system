<script lang="ts">
  import { Badge, BarChart, type BarChartDatum } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Graphique à barres pour comparer des valeurs catégorielles. Orientation verticale ou horizontale, échelle automatique avec graduations « nice », tons sémantiques par barre et infobulle au survol/focus.",
      verticalTitle: "Vertical (par défaut)",
      verticalDesc: "Tokens consommés par jour de la semaine.",
      horizontalTitle: "Horizontal",
      horizontalDesc: "Pratique quand les libellés de catégorie sont longs.",
      tonesTitle: "Tons par barre",
      tonesDesc: "Chaque barre peut porter son propre `tone` (`category1` à `category8`).",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`label` est obligatoire : il alimente l’`aria-label` du conteneur (`role=\"img\"`). Chaque barre expose aussi son propre `aria-label` « libellé : valeur » et est focusable au clavier.",
      usageNote2:
        "L’échelle inclut toujours zéro et les valeurs négatives sont supportées (les barres partent de la ligne du zéro).",
      usageNote3:
        "`width`/`height` définissent le `viewBox` ; le SVG est mis à l’échelle de façon responsive (`preserveAspectRatio`) à 100 % de la largeur du conteneur."
    },
    en: {
      intro:
        "Bar chart for comparing categorical values. Vertical or horizontal orientation, automatic nice-tick scale, per-bar semantic tones, and a hover/focus tooltip.",
      verticalTitle: "Vertical (default)",
      verticalDesc: "Tokens consumed per weekday.",
      horizontalTitle: "Horizontal",
      horizontalDesc: "Useful when category labels are long.",
      tonesTitle: "Per-bar tones",
      tonesDesc: "Each bar can carry its own `tone` (`category1` to `category8`).",
      usageTitle: "Usage notes",
      usageNote1:
        "`label` is required: it feeds the container `aria-label` (`role=\"img\"`). Each bar also exposes its own `aria-label` \"label: value\" and is keyboard focusable.",
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
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "areaChartKicker")}</p>
    <h1>
      BarChart
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={text().verticalTitle}>
      <h3 class="docs-demo-title">{text().verticalTitle}</h3>
      <p class="docs-demo-note">{text().verticalDesc}</p>
      <div class="chart-wrapper">
        <BarChart
          data={weekly}
          label={locale.value === "fr" ? "Tokens consommés par jour" : "Tokens consumed per day"}
          width={520}
          height={260}
        />
      </div>
    </div>

    <div class="docs-example" aria-label={text().horizontalTitle}>
      <h3 class="docs-demo-title">{text().horizontalTitle}</h3>
      <p class="docs-demo-note">{text().horizontalDesc}</p>
      <div class="chart-wrapper">
        <BarChart
          data={byTool}
          orientation="horizontal"
          label={locale.value === "fr" ? "Appels par outil d'agent" : "Calls per agent tool"}
          width={520}
          height={260}
        />
      </div>
    </div>

    <div class="docs-example" aria-label={text().tonesTitle}>
      <h3 class="docs-demo-title">{text().tonesTitle}</h3>
      <p class="docs-demo-note">{text().tonesDesc}</p>
      <div class="chart-wrapper">
        <BarChart
          data={toned}
          label={locale.value === "fr" ? "Issues des exécutions" : "Run outcomes"}
          width={520}
          height={240}
        />
      </div>
    </div>
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

  .chart-wrapper {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
