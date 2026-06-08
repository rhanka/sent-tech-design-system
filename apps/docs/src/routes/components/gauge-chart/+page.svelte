<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "gauge-demo-row" },
      children: [
        {
          comp: "GaugeChart",
          props: {
            value: 72,
            label: locale.value === "fr" ? "Disponibilité SLA" : "SLA Availability",
            thresholds: [
              { value: 0, tone: "error" },
              { value: 60, tone: "warning" },
              { value: 80, tone: "success" }
            ],
            unit: "%",
            size: 200
          }
        },
        {
          comp: "GaugeChart",
          props: {
            value: 42,
            label: locale.value === "fr" ? "Charge CPU" : "CPU Load",
            thresholds: [
              { value: 0, tone: "success" },
              { value: 70, tone: "warning" },
              { value: 90, tone: "error" }
            ],
            unit: "%",
            size: 200
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>GaugeChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Jauge semi-circulaire affichant une valeur sur un arc coloré par seuils. Les seuils
        (<code>thresholds</code>) définissent des bandes colorées sur la piste pour contextualiser
        immédiatement le niveau mesuré. La valeur et l'unité sont affichées au centre de l'arc.
      {:else}
        Semi-circular gauge displaying a value on a threshold-colored arc. Thresholds define
        colored bands on the track to immediately contextualize the measured level. The value
        and unit are displayed at the center of the arc.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Deux jauges avec seuils inversés : disponibilité SLA (vert au-delà de 80 %) et charge CPU
        (rouge au-delà de 90 %).
      {:else}
        Two gauges with opposite threshold schemes: SLA availability (green above 80%) and CPU
        load (red above 90%).
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Jauges SLA et CPU" : "SLA and CPU gauges"}
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
          <td><code>value</code></td>
          <td><code>number</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Valeur courante de la jauge." : "Current gauge value."}</td>
        </tr>
        <tr>
          <td><code>min</code></td>
          <td><code>number</code></td>
          <td><code>0</code></td>
          <td>{locale.value === "fr" ? "Valeur minimale de l'échelle." : "Minimum scale value."}</td>
        </tr>
        <tr>
          <td><code>max</code></td>
          <td><code>number</code></td>
          <td><code>100</code></td>
          <td>{locale.value === "fr" ? "Valeur maximale de l'échelle." : "Maximum scale value."}</td>
        </tr>
        <tr>
          <td><code>thresholds</code></td>
          <td><code>GaugeChartThreshold[]</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Bandes colorées triées par value croissante." : "Color bands sorted by ascending value."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Description de la jauge (a11y + texte sous valeur)." : "Gauge description (a11y + sub-value text)."}</td>
        </tr>
        <tr>
          <td><code>format</code></td>
          <td><code>"number" | "percent"</code></td>
          <td><code>"number"</code></td>
          <td>{locale.value === "fr" ? "Format de la valeur centrale." : "Center value format."}</td>
        </tr>
        <tr>
          <td><code>unit</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Suffixe d'unité (ignoré pour format percent)." : "Unit suffix (ignored for percent format)."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>220</code></td>
          <td>{locale.value === "fr" ? "Diamètre du SVG en pixels." : "SVG diameter in pixels."}</td>
        </tr>
        <tr>
          <td><code>thickness</code></td>
          <td><code>number</code></td>
          <td><code>22</code></td>
          <td>{locale.value === "fr" ? "Épaisseur de l'arc en pixels." : "Arc thickness in pixels."}</td>
        </tr>
        <tr>
          <td><code>startAngle</code></td>
          <td><code>number</code></td>
          <td><code>180</code></td>
          <td>{locale.value === "fr" ? "Angle de départ en degrés (0 = est, sens horaire)." : "Start angle in degrees (0 = east, clockwise)."}</td>
        </tr>
        <tr>
          <td><code>endAngle</code></td>
          <td><code>number</code></td>
          <td><code>360</code></td>
          <td>{locale.value === "fr" ? "Angle de fin en degrés." : "End angle in degrees."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "GaugeChartThreshold = { value: number; tone: GaugeChartTone } — tone ∈ neutral | info | success | warning | error | category1…8"
        : "GaugeChartThreshold = { value: number; tone: GaugeChartTone } — tone ∈ neutral | info | success | warning | error | category1…8"}
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
          <td><code>--st-component-gaugeChart-trackStroke</code></td>
          <td>{locale.value === "fr" ? "Couleur de la piste de fond (défaut : border-subtle)." : "Background track color (default: border-subtle)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-gaugeChart-valueFill</code></td>
          <td>{locale.value === "fr" ? "Couleur du texte de la valeur centrale." : "Center value text color."}</td>
        </tr>
        <tr>
          <td><code>--st-component-gaugeChart-labelFill</code></td>
          <td>{locale.value === "fr" ? "Couleur du label sous la valeur." : "Sub-value label color."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-success</code> / <code>warning</code> / <code>error</code></td>
          <td>{locale.value === "fr" ? "Couleurs des bandes de seuil sémantiques." : "Semantic threshold band colors."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Couleurs des bandes de seuil catégorielles." : "Categorical threshold band colors."}</td>
        </tr>
      </tbody>
    </table>
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

  :global(.gauge-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-6, 1.5rem);
    align-items: center;
    margin-top: 0.75rem;
  }
</style>
