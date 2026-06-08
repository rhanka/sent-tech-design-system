<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "ParetoChart combine des barres triées par valeur décroissante et une courbe cumulée en pourcentage sur un second axe. Il met en évidence le principe « 80/20 » : la minorité des causes qui produit la majorité des effets.",
      examplesTitle: "Exemples",
      incidentsTitle: "Causes d'incidents",
      incidentsDesc: "Les premières catégories cumulent l'essentiel des incidents.",
      defectsTitle: "Défauts qualité",
      defectsDesc: "La courbe cumulée aide à fixer le seuil d'action prioritaire.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque barre est résumée dans une liste accessible avec sa valeur ; les données sont triées par valeur décroissante.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez des valeurs brutes : le composant trie lui-même et calcule le cumul en pourcentage. Conservez un nombre raisonnable de catégories pour garder la lecture claire.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "ParetoChart combines bars sorted by descending value with a cumulative percentage curve on a secondary axis. It highlights the 80/20 principle: the few causes that drive most of the effects.",
      examplesTitle: "Examples",
      incidentsTitle: "Incident causes",
      incidentsDesc: "The first categories account for most incidents.",
      defectsTitle: "Quality defects",
      defectsDesc: "The cumulative curve helps set the priority action threshold.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each bar is summarized in an accessible list with its value; data is sorted by descending value.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide raw values: the component sorts them and computes the cumulative percentage. Keep a reasonable number of categories for readability.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const incidentData = [
    { label: "Réseau", value: 45, tone: "category1" },
    { label: "Déploiement", value: 30, tone: "category2" },
    { label: "Base de données", value: 15, tone: "category3" },
    { label: "Tiers", value: 7, tone: "category4" },
    { label: "Autre", value: 3, tone: "category5" }
  ];

  const defectData = [
    { label: "Rayures", value: 120, tone: "category1" },
    { label: "Assemblage", value: 80, tone: "category2" },
    { label: "Peinture", value: 50, tone: "category3" },
    { label: "Emballage", value: 28, tone: "category4" },
    { label: "Étiquetage", value: 12, tone: "category5" }
  ];

  const incidentDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ParetoChart",
          props: {
            label: locale.value === "fr" ? "Causes d'incidents" : "Incident causes",
            data: incidentData
          }
        }
      ]
    }
  ]);

  const defectDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ParetoChart",
          props: {
            label: locale.value === "fr" ? "Défauts qualité" : "Quality defects",
            data: defectData
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
      <h1>ParetoChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="paretochart" title={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().incidentsTitle}</h3>
    <p class="docs-demo-note">{text().incidentsDesc}</p>
    <FrameworkDemo nodes={incidentDemo} label={text().incidentsTitle} />

    <h3 class="docs-demo-title">{text().defectsTitle}</h3>
    <p class="docs-demo-note">{text().defectsDesc}</p>
    <FrameworkDemo nodes={defectDemo} label={text().defectsTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>ParetoChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ParetoChartDatum</code> = <code>{`{ label: string; value: number; tone?: ParetoChartTone }`}</code>
      ·
      <code>ParetoChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-border-interactive</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-text-primary</code></li>
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
