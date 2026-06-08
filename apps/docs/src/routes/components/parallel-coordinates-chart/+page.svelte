<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "ParallelCoordinatesChart trace une polyligne par enregistrement sur des axes verticaux parallèles. Idéal pour détecter des corrélations ou des groupements dans des données multidimensionnelles.",
      examplesTitle: "Exemples",
      vehicleTitle: "Comparaison de véhicules",
      vehicleDesc: "Chaque ligne relie les valeurs d'un véhicule sur quatre axes. La prop `tones` permet d'assigner une couleur par ligne.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque enregistrement est listé avec ses valeurs d'axe dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Utilisez `axes[].min` / `axes[].max` pour forcer les bornes d'un axe. Les valeurs non-finies créent un GAP de segment : la ligne est interrompue sans erreur.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "ParallelCoordinatesChart draws one polyline per record across parallel vertical axes. Ideal for detecting correlations or clusters in multi-dimensional data.",
      examplesTitle: "Examples",
      vehicleTitle: "Vehicle comparison",
      vehicleDesc: "Each line connects a vehicle's values across four axes. The `tones` prop assigns a colour per line.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each record is listed with its axis values in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Use `axes[].min` / `axes[].max` to force axis bounds. Non-finite values create a segment gap: the line is interrupted without error.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const vehicleData = [
    { puissance: 130, poids: 1200, conso: 6.5, prix: 22 },
    { puissance: 190, poids: 1580, conso: 8.2, prix: 38 },
    { puissance: 90, poids: 980, conso: 4.8, prix: 15 }
  ];

  const vehicleDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ParallelCoordinatesChart",
          props: {
            label: locale.value === "fr" ? "Comparaison de véhicules" : "Vehicle comparison",
            axes: [
              { key: "puissance", label: "Puissance (ch)" },
              { key: "poids", label: "Poids (kg)" },
              { key: "conso", label: "Conso (L/100)" },
              { key: "prix", label: "Prix (k€)" }
            ],
            data: vehicleData,
            tones: ["category1", "category3", "category5"]
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
      <h1>ParallelCoordinatesChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().vehicleTitle}</h3>
    <p class="docs-demo-note">{text().vehicleDesc}</p>
    <TabbedExample nodes={vehicleDemo} title={text().vehicleTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>axes</code></td><td><code>ParallelAxis[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>data</code></td><td><code>Record&lt;string, unknown&gt;[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>tones</code></td><td><code>ParallelCoordinatesChartTone[]</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>300</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ParallelAxis</code> = <code>{`{ key: string; label: string; min?: number; max?: number }`}</code>
      ·
      <code>ParallelCoordinatesChartTone</code> = <code>"category1" | ... | "category8"</code>
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
