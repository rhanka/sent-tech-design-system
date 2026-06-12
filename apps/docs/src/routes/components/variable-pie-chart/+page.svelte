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
        "VariablePieChart (camembert à rayon variable) encode DEUX métriques par part : l'ANGLE est proportionnel à la première valeur (les angles somment à 360°, comme un camembert classique) et le RAYON est proportionnel à une seconde métrique z, mappée entre un rayon minimum et un rayon maximum.",
      examplesTitle: "Exemples",
      basicTitle: "Deux métriques par part",
      basicDesc:
        "L'angle reflète la part de marché (value) ; le rayon reflète la croissance (z) : une part large mais courte vend beaucoup sans croître.",
      radiusTitle: "Rayon proportionnel à z",
      radiusDesc:
        "À angle égal, la part dont z est le plus grand pousse jusqu'au rayon maximum ; la plus petite reste au rayon minimum.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Les libellés et valeurs sont rendus dans une liste accessible hors SVG. Le texte sur part prend une couleur contrastée calculée par ton.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Idéal quand chaque catégorie porte deux dimensions corrélées (part + intensité, volume + marge). Les parts dont value est non finie ou ≤ 0 sont ignorées ; un z non fini est ramené à 0.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "VariablePieChart (variable-radius pie) encodes TWO metrics per slice: the ANGLE is proportional to the first value (angles sum to 360°, like a classic pie) and the RADIUS is proportional to a second metric z, mapped between a minimum and a maximum radius.",
      examplesTitle: "Examples",
      basicTitle: "Two metrics per slice",
      basicDesc:
        "The angle reflects market share (value); the radius reflects growth (z) : a wide but short slice sells a lot without growing.",
      radiusTitle: "Radius scales with z",
      radiusDesc:
        "At equal angle, the slice with the largest z reaches the maximum radius; the smallest stays at the minimum radius.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Labels and values are rendered in an accessible list outside the SVG. On-slice text uses a per-tone contrasted color.",
      usageTitle: "Usage notes",
      usageNote:
        "Great when each category carries two correlated dimensions (share + intensity, volume + margin). Slices with non-finite or ≤ 0 value are ignored; a non-finite z falls back to 0.",
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
          comp: "VariablePieChart",
          props: {
            label: locale.value === "fr" ? "Part de marché et croissance" : "Market share and growth",
            data: [
              { label: locale.value === "fr" ? "Cloud" : "Cloud", value: 40, z: 12 },
              { label: locale.value === "fr" ? "Mobile" : "Mobile", value: 25, z: 30 },
              { label: locale.value === "fr" ? "Bureau" : "Desktop", value: 20, z: 6 },
              { label: "IoT", value: 15, z: 48 }
            ]
          }
        }
      ]
    }
  ]);

  const radiusDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "VariablePieChart",
          props: {
            label: locale.value === "fr" ? "Rayon piloté par z" : "Radius driven by z",
            data: [
              { label: "A", value: 33, z: 10 },
              { label: "B", value: 33, z: 50 },
              { label: "C", value: 34, z: 100 }
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
      <h1>VariablePieChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TabbedExample nodes={basicDemo} title={text().basicTitle} />

    <h3 class="docs-demo-title">{text().radiusTitle}</h3>
    <p class="docs-demo-note">{text().radiusDesc}</p>
    <TabbedExample nodes={radiusDemo} title={text().radiusTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>VariablePieChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>VariablePieChartDatum</code> = <code>{`{ label: string; value: number; z: number; tone?: VariablePieChartTone }`}</code>
      ·
      <code>VariablePieChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
