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
        "BellCurveChart est un graphique statistique. À partir d'un échantillon de nombres bruts, il calcule la moyenne μ et l'écart-type d'échantillon σ (n-1), puis trace la densité de la loi normale (la « courbe en cloche ») sur l'intervalle μ-4σ → μ+4σ, sous forme d'aire lissée. Des repères marquent μ et les écarts μ±σ, μ±2σ.",
      examplesTitle: "Exemples",
      basicTitle: "Distribution de base",
      basicDesc: "Fournissez un échantillon de valeurs ; μ et σ sont calculés et la densité normale est tracée.",
      tonesTitle: "Teinte personnalisée",
      tonesDesc: "Passez `tone` pour changer la couleur de la courbe et de l'aire.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique ; l'aria-label y ajoute μ, σ et la taille n de l'échantillon. La liste accessible résume μ, σ et n. Un échantillon de moins de 2 valeurs, ou un écart-type nul, rend un état vide accessible sans planter.",
      usageTitle: "Notes d'usage",
      usageNote:
        "`data` est un tableau de nombres bruts (l'échantillon), pas une courbe déjà agrégée : le composant fait lui-même le calcul de μ et σ. Les valeurs non finies sont ignorées. `intervals` règle la finesse d'échantillonnage de la courbe.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "BellCurveChart is a statistical chart. From a raw sample of numbers it computes the mean μ and the sample standard deviation σ (n-1), then draws the normal-distribution density (the “bell curve”) over the μ-4σ → μ+4σ range as a smoothed area. Markers highlight μ and the μ±σ, μ±2σ deviations.",
      examplesTitle: "Examples",
      basicTitle: "Basic distribution",
      basicDesc: "Provide a sample of values; μ and σ are computed and the normal density is drawn.",
      tonesTitle: "Custom tone",
      tonesDesc: "Pass `tone` to change the colour of the curve and area.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart; the aria-label adds μ, σ and the sample size n. The accessible list summarizes μ, σ and n. A sample with fewer than 2 values, or a zero standard deviation, renders an accessible empty state without crashing.",
      usageTitle: "Usage notes",
      usageNote:
        "`data` is an array of raw numbers (the sample), not a pre-aggregated curve: the component computes μ and σ itself. Non-finite values are dropped. `intervals` tunes the curve sampling resolution.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const examScores = [
    62, 68, 71, 73, 74, 75, 76, 77, 78, 79, 80, 80, 81, 82, 83, 84, 85, 86, 88, 91
  ];

  const latencySample = [
    88, 92, 95, 97, 99, 101, 103, 104, 106, 108, 110, 112, 115, 118, 121, 126
  ];

  const basicDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "BellCurveChart",
          props: {
            label:
              locale.value === "fr"
                ? "Distribution des scores d'examen"
                : "Exam score distribution",
            tone: "category1",
            data: examScores
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
          comp: "BellCurveChart",
          props: {
            label:
              locale.value === "fr"
                ? "Distribution des temps de réponse (ms)"
                : "Response time distribution (ms)",
            tone: "category5",
            data: latencySample
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
      <h1>BellCurveChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TabbedExample nodes={basicDemo} title={text().basicTitle} />

    <h3 class="docs-demo-title">{text().tonesTitle}</h3>
    <p class="docs-demo-note">{text().tonesDesc}</p>
    <TabbedExample nodes={tonesDemo} title={text().tonesTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>number[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>tone</code></td><td><code>"category1" | ... | "category8"</code></td><td><code>"category1"</code></td></tr>
        <tr><td><code>smooth</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>intervals</code></td><td><code>number</code></td><td><code>64</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>data</code> = <code>number[]</code> (échantillon brut)
      ·
      <code>BellCurveChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
