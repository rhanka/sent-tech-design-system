<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import { storeChartDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { createDashboardStore, type DataModel } from "@sentropic/dataviz-core";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "FunnelChart",
          props: {
            label: locale.value === "fr" ? "Entonnoir de conversion" : "Conversion funnel",
            data: [
              {
                label: locale.value === "fr" ? "Visiteurs" : "Visitors",
                value: 8400,
                tone: "category1"
              },
              {
                label: locale.value === "fr" ? "Prospects" : "Prospects",
                value: 3200,
                tone: "category2"
              },
              {
                label: locale.value === "fr" ? "Leads qualifiés" : "Qualified leads",
                value: 940,
                tone: "category3"
              },
              {
                label: locale.value === "fr" ? "Clients" : "Customers",
                value: 210,
                tone: "category4"
              }
            ],
            showPercentages: true,
            width: 480,
            height: 300
          }
        }
      ]
    }
  ]);

  // Version adaptateur : les étapes sont dérivées d'un vrai store minimal.
  const storeModel: DataModel = {
    dimensions: [{ id: "stage", label: "Étape", type: "discrete" }],
    measures: [{ id: "count", label: "Effectif", aggregation: "sum" }]
  };
  const store = createDashboardStore({
    model: storeModel,
    data: [
      { stage: "Visiteurs", count: 8400 },
      { stage: "Prospects", count: 3200 },
      { stage: "Clients", count: 210 }
    ]
  });

  const storeDemo = $derived<NodeSpec[]>(
    storeChartDemoNodes("FunnelChart", {
      store,
      viewId: "store",
      category: "stage",
      measure: "count",
      label: locale.value === "fr" ? "Entonnoir (store)" : "Funnel (store)"
    })
  );
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>FunnelChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Entonnoir vertical ou horizontal représentant les étapes d'un processus de conversion.
        Chaque étape affiche sa valeur et optionnellement son pourcentage (par rapport à la
        première étape ou à l'étape précédente). Légende et tooltip de survol inclus.
      {:else}
        Vertical or horizontal funnel representing the steps of a conversion process. Each step
        shows its value and optionally its percentage (relative to the first step or the
        previous one). Legend and hover tooltip included.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Entonnoir de conversion en 4 étapes : visiteurs, prospects, leads qualifiés et clients.
        Les pourcentages affichés sont relatifs à la première étape (<code>percentMode="ofFirst"</code>).
      {:else}
        4-step conversion funnel: visitors, prospects, qualified leads, and customers. Displayed
        percentages are relative to the first step (<code>percentMode="ofFirst"</code>).
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Entonnoir de conversion" : "Conversion funnel"}
    />
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{locale.value === "fr" ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>data</code></td>
          <td><code>FunnelChartDatum[]</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Tableau des étapes de l'entonnoir." : "Array of funnel steps."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Label aria-label du graphique (a11y)." : "Chart aria-label (a11y)."}</td>
        </tr>
        <tr>
          <td><code>orientation</code></td>
          <td><code>"vertical" | "horizontal"</code></td>
          <td><code>"vertical"</code></td>
          <td>{locale.value === "fr" ? "Orientation de l'entonnoir." : "Funnel orientation."}</td>
        </tr>
        <tr>
          <td><code>showPercentages</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>{locale.value === "fr" ? "Affiche les pourcentages de conversion par étape." : "Show per-step conversion percentages."}</td>
        </tr>
        <tr>
          <td><code>percentMode</code></td>
          <td><code>"ofFirst" | "ofPrevious"</code></td>
          <td><code>"ofFirst"</code></td>
          <td>{locale.value === "fr" ? "Référence pour le calcul des pourcentages." : "Reference for percentage calculation."}</td>
        </tr>
        <tr>
          <td><code>legend</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>{locale.value === "fr" ? "Affiche une légende sous le graphique." : "Show a legend below the chart."}</td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td><code>number</code></td>
          <td><code>480</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>280</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "FunnelChartDatum = { label: string; value: number; tone?: FunnelChartTone } : tone ∈ category1…8"
        : "FunnelChartDatum = { label: string; value: number; tone?: FunnelChartTone } : tone ∈ category1…8"}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Tokens CSS" : "CSS Tokens"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>{locale.value === "fr" ? "Variable CSS" : "CSS Variable"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Palette catégorielle des segments d'entonnoir." : "Categorical palette for funnel segments."}</td>
        </tr>
        <tr>
          <td><code>--st-component-funnelChart-labelColor</code></td>
          <td>{locale.value === "fr" ? "Couleur des étiquettes de valeur." : "Value label text color."}</td>
        </tr>
        <tr>
          <td><code>--st-component-funnelChart-tooltipBackground</code></td>
          <td>{locale.value === "fr" ? "Fond du tooltip de survol." : "Hover tooltip background."}</td>
        </tr>
        <tr>
          <td><code>--st-component-funnelChart-tooltipText</code></td>
          <td>{locale.value === "fr" ? "Texte du tooltip." : "Tooltip text color."}</td>
        </tr>
      </tbody>
    </table>
  </section>
  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Piloté par store" : "Store-driven"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        La version adaptateur (<code>@sentropic/dataviz-svelte</code>,
        <code>-react</code>, <code>-vue</code>, <code>-angular</code>) dérive les étapes
        d’un <code>DashboardStore</code> partagé : <code>category</code> et
        <code>measure</code> désignent les canaux, le reste du contrat est inchangé.
      {:else}
        The adapter version (<code>@sentropic/dataviz-svelte</code>,
        <code>-react</code>, <code>-vue</code>, <code>-angular</code>) derives the steps
        from a shared <code>DashboardStore</code>: <code>category</code> and
        <code>measure</code> name the channels, the rest of the contract is unchanged.
      {/if}
    </p>
    <TabbedExample nodes={storeDemo} title={locale.value === "fr" ? "Entonnoir (store)" : "Funnel (store)"} />
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>store</code></td><td><code>DashboardStore</code></td><td>requis</td></tr>
        <tr><td><code>viewId</code></td><td><code>string</code></td><td>requis</td></tr>
        <tr><td><code>category</code></td><td><code>string</code></td><td>requis</td></tr>
        <tr><td><code>measure</code></td><td><code>string</code></td><td>requis</td></tr>
        <tr><td><code>sort</code></td><td><code>PartWholeSort</code></td><td>non défini</td></tr>
        <tr><td><code>orientation</code></td><td><code>"vertical" | "horizontal"</code></td><td><code>"vertical"</code></td></tr>
        <tr><td><code>showPercentages</code></td><td><code>boolean</code></td><td>natif</td></tr>
        <tr><td><code>percentMode</code></td><td><code>"ofFirst" | "ofPrevious"</code></td><td>natif</td></tr>
        <tr><td><code>legend</code></td><td><code>boolean</code></td><td>natif</td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td>natif</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      {#if locale.value === "fr"}
        Props du natif non reprises par la version store : <code>data</code> (dérivé
        du store via <code>category</code> / <code>measure</code>).
      {:else}
        Native props not carried by the store version: <code>data</code> (derived
        from the store through <code>category</code> / <code>measure</code>).
      {/if}
    </p>
  </section>
</div>

<style>
  .section-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .docs-demo-note {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.75rem;
  }

  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
