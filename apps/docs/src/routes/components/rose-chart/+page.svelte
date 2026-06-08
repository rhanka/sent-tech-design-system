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
        "RoseChart (rose de Nightingale / polar area) répartit les catégories en secteurs d'angle ÉGAL et fait varier le RAYON selon la valeur — c'est le rayon qui porte l'information, pas l'angle, ce qui le distingue d'un camembert.",
      examplesTitle: "Exemples",
      basicTitle: "Rose mensuelle",
      basicDesc: "Une catégorie par secteur ; le rayon (et donc l'aire) reflète la valeur.",
      scaleTitle: "Échelle de l'aire",
      scaleDesc:
        "Le rayon vaut sqrt(value / maxValue) × R, donc l'AIRE du secteur est proportionnelle à la valeur — une lecture honnête perceptuellement.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Les libellés et valeurs sont rendus dans une liste accessible hors SVG. Le texte sur secteur prend une couleur contrastée calculée par ton.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Idéal pour des données cycliques (mois, heures) à magnitude variable. Les valeurs non finies ou négatives sont ignorées (aucun secteur dessiné).",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "RoseChart (Nightingale / polar area) splits categories into EQUAL-angle sectors and varies the RADIUS by value — the radius carries the information, not the angle, which is what sets it apart from a pie chart.",
      examplesTitle: "Examples",
      basicTitle: "Monthly rose",
      basicDesc: "One category per sector; the radius (and therefore the area) reflects the value.",
      scaleTitle: "Area scaling",
      scaleDesc:
        "The radius is sqrt(value / maxValue) × R, so the sector AREA is proportional to the value — a perceptually honest reading.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Labels and values are rendered in an accessible list outside the SVG. On-sector text uses a per-tone contrasted color.",
      usageTitle: "Usage notes",
      usageNote:
        "Great for cyclic data (months, hours) with varying magnitude. Non-finite or negative values are ignored (no sector drawn).",
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
          comp: "RoseChart",
          props: {
            label: locale.value === "fr" ? "Activité par mois" : "Activity per month",
            data: [
              { label: "Jan", value: 40 },
              { label: locale.value === "fr" ? "Fév" : "Feb", value: 22, tone: "category5" },
              { label: "Mar", value: 80 },
              { label: locale.value === "fr" ? "Avr" : "Apr", value: 55 }
            ]
          }
        }
      ]
    }
  ]);

  const scaleDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "RoseChart",
          props: {
            label: locale.value === "fr" ? "Aire proportionnelle" : "Proportional area",
            data: [
              { label: "A", value: 25 },
              { label: "B", value: 50 },
              { label: "C", value: 100 }
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
      <h1>RoseChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <TriRender nodes={getExample("rosechart")?.nodes ?? []} label={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TriRender nodes={basicDemo} label={text().basicTitle} />

    <h3 class="docs-demo-title">{text().scaleTitle}</h3>
    <p class="docs-demo-note">{text().scaleDesc}</p>
    <TriRender nodes={scaleDemo} label={text().scaleTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>RoseChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>320</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>320</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>RoseChartDatum</code> = <code>{`{ label: string; value: number; tone?: RoseChartTone }`}</code>
      ·
      <code>RoseChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
