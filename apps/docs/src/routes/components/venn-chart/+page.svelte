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
        "VennChart (diagramme de Venn / Euler) superpose DEUX ou TROIS ensembles dessinés en cercles semi-transparents. Chaque zone est décrite par les ensembles qu'elle couvre et une valeur : membres d'un seul ensemble, ou intersection de deux ou trois ensembles. Le rayon de chaque cercle est proportionnel à √(taille totale de l'ensemble) ; les positions sont fixes et déterministes (côte à côte pour 2, triangle pour 3).",
      examplesTitle: "Exemples",
      twoTitle: "Deux ensembles",
      twoDesc:
        "Deux cercles côte à côte avec recouvrement. La valeur de chaque membre exclusif et de l'intersection A∩B est étiquetée ; le rayon reflète la taille totale de l'ensemble.",
      threeTitle: "Trois ensembles",
      threeDesc:
        "Trois cercles en triangle. Les sept zones (trois exclusives, trois intersections doubles, une triple) portent chacune leur valeur.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Chaque zone (ensemble → valeur) est rendue dans une liste accessible hors SVG. Au survol d'un cercle, un tooltip indique le nom de l'ensemble et sa taille totale.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Idéal pour montrer le chevauchement entre 2 ou 3 catégories (audiences, compétences, tags). Les zones dont value est non finie ou ≤ 0 sont ignorées ; les ensembles au-delà de 3 ne sont pas dessinés. La géométrie est déterministe : aucun aléatoire, layout identique entre frameworks.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "VennChart (Venn / Euler diagram) overlaps TWO or THREE sets drawn as semi-transparent circles. Each area is described by the sets it covers and a value: members of a single set, or the intersection of two or three sets. Each circle's radius scales with √(total set size); positions are fixed and deterministic (side by side for 2, a triangle for 3).",
      examplesTitle: "Examples",
      twoTitle: "Two sets",
      twoDesc:
        "Two circles side by side with overlap. Each exclusive member and the A∩B intersection value is labeled; the radius reflects the total set size.",
      threeTitle: "Three sets",
      threeDesc:
        "Three circles arranged in a triangle. The seven areas (three exclusive, three pairwise intersections, one triple) each carry their value.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Each area (sets → value) is rendered in an accessible list outside the SVG. Hovering a circle shows a tooltip with the set name and its total size.",
      usageTitle: "Usage notes",
      usageNote:
        "Great for showing overlap between 2 or 3 categories (audiences, skills, tags). Areas with non-finite or ≤ 0 value are ignored; sets beyond 3 are not drawn. The geometry is deterministic: no randomness, identical layout across frameworks.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const twoDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "VennChart",
          props: {
            label: locale.value === "fr" ? "Abonnés par canal" : "Subscribers by channel",
            data: [
              { sets: [locale.value === "fr" ? "Courriel" : "Email"], value: 120 },
              { sets: ["Mobile"], value: 80 },
              { sets: [locale.value === "fr" ? "Courriel" : "Email", "Mobile"], value: 35 }
            ]
          }
        }
      ]
    }
  ]);

  const threeDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "VennChart",
          props: {
            label: locale.value === "fr" ? "Compétences de l'équipe" : "Team skills",
            data: [
              { sets: ["Design"], value: 14 },
              { sets: ["Dev"], value: 18 },
              { sets: ["Data"], value: 10 },
              { sets: ["Design", "Dev"], value: 6 },
              { sets: ["Design", "Data"], value: 3 },
              { sets: ["Dev", "Data"], value: 5 },
              { sets: ["Design", "Dev", "Data"], value: 2 }
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
      <h1>VennChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().twoTitle}</h3>
    <p class="docs-demo-note">{text().twoDesc}</p>
    <TabbedExample nodes={twoDemo} title={text().twoTitle} />

    <h3 class="docs-demo-title">{text().threeTitle}</h3>
    <p class="docs-demo-note">{text().threeDesc}</p>
    <TabbedExample nodes={threeDemo} title={text().threeTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>VennChartArea[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>420</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>VennChartArea</code> = <code>{`{ sets: string[]; value: number }`}</code>.
      Une zone d'un seul ensemble (<code>sets.length === 1</code>) est un membre exclusif ;
      <code>sets.length ≥ 2</code> décrit une intersection.
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
      <li><code>--st-semantic-text-primary</code></li>
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
