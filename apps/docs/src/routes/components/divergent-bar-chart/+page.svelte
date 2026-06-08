<script lang="ts">
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
        "DivergentBarChart affiche des valeurs positives, négatives et neutres autour d'un axe zéro commun. Il convient aux écarts, sentiments, contributions nettes et balances par catégorie.",
      examplesTitle: "Exemples",
      exampleTitle: "Sentiment par équipe",
      exampleDesc: "Les valeurs positives partent vers la droite, les valeurs négatives vers la gauche et les zéros restent ancrés sur l'axe.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Les valeurs filtrées et formatées sont exposées dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les valeurs non finies sont ignorées. Sans `domain`, l'échelle est symétrique autour de zéro; un `domain` fixe est utilisé seulement s'il est fini, ordonné et traverse zéro.",
      tokensTitle: "Tokens CSS"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "DivergentBarChart displays positive, negative and neutral values around a shared zero axis. It fits deltas, sentiment, net contribution and category balance views.",
      examplesTitle: "Examples",
      exampleTitle: "Team sentiment",
      exampleDesc: "Positive values extend right, negative values extend left and zero values stay anchored to the axis.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Filtered and formatted values are exposed in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Non-finite values are ignored. Without `domain`, the scale is symmetric around zero; a fixed `domain` is used only when finite, ordered and spanning zero.",
      tokensTitle: "CSS Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "DivergentBarChart",
          props: {
            label: text().exampleTitle,
            data: [
              { label: "Support", value: 18 },
              { label: "Risk", value: -7 },
              { label: "Neutral", value: 0 },
              { label: "Adoption", value: 12 }
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
      <h1>DivergentBarChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>
    <h3 class="docs-demo-title">{text().exampleTitle}</h3>
    <p class="docs-demo-note">{text().exampleDesc}</p>
    <TriRender nodes={demoNodes} label={text().exampleTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>DivergentBarChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>domain</code></td><td><code>[number, number]</code></td><td>auto</td></tr>
        <tr><td><code>format</code></td><td><code>(value: number) =&gt; string</code></td><td><code>formatTick</code></td></tr>
        <tr><td><code>showLegend</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>260</code></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      <code>DivergentBarChartDatum</code> = <code>{`{ label: string; value: number; tone?: "positive" | "negative" | "neutral" }`}</code>
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
    <table class="docs-table">
      <thead>
        <tr><th>{locale.value === "fr" ? "Variable CSS" : "CSS Variable"}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>--st-component-divergentBarChart-positiveFill</code></td><td>{locale.value === "fr" ? "Couleur des barres positives." : "Positive bar fill."}</td></tr>
        <tr><td><code>--st-component-divergentBarChart-negativeFill</code></td><td>{locale.value === "fr" ? "Couleur des barres négatives." : "Negative bar fill."}</td></tr>
        <tr><td><code>--st-component-divergentBarChart-neutralFill</code></td><td>{locale.value === "fr" ? "Couleur des valeurs zéro/neutres." : "Zero/neutral value fill."}</td></tr>
        <tr><td><code>--st-component-divergentBarChart-zeroStroke</code></td><td>{locale.value === "fr" ? "Trait de l'axe zéro." : "Zero axis stroke."}</td></tr>
        <tr><td><code>--st-component-divergentBarChart-gridStroke</code></td><td>{locale.value === "fr" ? "Couleur de la grille." : "Grid line stroke."}</td></tr>
        <tr><td><code>--st-component-divergentBarChart-labelColor</code></td><td>{locale.value === "fr" ? "Couleur des libellés." : "Label color."}</td></tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .docs-demo-note {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin-top: 0.75rem;
  }

  :global(.chart-wrapper) {
    width: 100%;
  }
</style>
