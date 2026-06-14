<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "solid-gauge-demo-row" },
      children: [
        {
          comp: "SolidGaugeChart",
          props: {
            value: 68,
            label: locale.value === "fr" ? "Progression" : "Progress",
            format: "percent",
            size: 200
          }
        },
        {
          comp: "SolidGaugeChart",
          props: {
            value: 91,
            label: locale.value === "fr" ? "Disponibilité SLA" : "SLA Availability",
            unit: "%",
            thresholds: [
              { value: 0, tone: "error" },
              { value: 60, tone: "warning" },
              { value: 80, tone: "success" }
            ],
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
      <h1>SolidGaugeChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Anneau de progression plein : la piste de fond est recouverte d'un arc rempli proportionnel
        à <code>value</code>. Distinct du <code>GaugeChart</code> à aiguille, il met en avant un
        ratio d'avancement. Les seuils (<code>thresholds</code>) teintent l'arc rempli selon la zone
        atteinte, et la valeur est affichée au centre.
      {:else}
        Solid progress ring: the background track is overlaid by a filled arc proportional to
        <code>value</code>. Unlike the needle-based <code>GaugeChart</code>, it highlights a
        completion ratio. Thresholds tint the filled arc by the reached zone, and the value is
        shown at the center.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Deux anneaux : progression simple en pourcentage et disponibilité SLA teintée par seuils
        (vert au-delà de 80 %).
      {:else}
        Two rings: simple percentage progress and SLA availability tinted by thresholds (green
        above 80%).
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Anneaux de progression" : "Progress rings"}
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
          <td><code>SolidGaugeThreshold[]</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Seuils triés par value croissante : la zone atteinte teinte l'arc rempli." : "Thresholds sorted by ascending value: the reached zone tints the filled arc."}</td>
        </tr>
        <tr>
          <td><code>innerRadius</code></td>
          <td><code>number</code></td>
          <td><code>0.72</code></td>
          <td>{locale.value === "fr" ? "Rayon intérieur de l'anneau, en fraction du rayon (0..1)." : "Inner ring radius, as a fraction of the radius (0..1)."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
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
          <td>–</td>
          <td>{locale.value === "fr" ? "Suffixe d'unité (ignoré pour format percent)." : "Unit suffix (ignored for percent format)."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>220</code></td>
          <td>{locale.value === "fr" ? "Diamètre du SVG en pixels." : "SVG diameter in pixels."}</td>
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
        ? "SolidGaugeThreshold = { value: number; tone: SolidGaugeTone } : tone ∈ neutral | info | success | warning | error | category1…8"
        : "SolidGaugeThreshold = { value: number; tone: SolidGaugeTone } : tone ∈ neutral | info | success | warning | error | category1…8"}
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
          <td><code>--st-semantic-surface-subtle</code></td>
          <td>{locale.value === "fr" ? "Couleur de la piste de fond." : "Background track color."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-action-primary</code></td>
          <td>{locale.value === "fr" ? "Couleur de l'arc rempli sans seuils." : "Filled arc color without thresholds."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-primary</code></td>
          <td>{locale.value === "fr" ? "Couleur du texte de la valeur centrale." : "Center value text color."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-success</code> / <code>warning</code> / <code>error</code></td>
          <td>{locale.value === "fr" ? "Couleurs des zones de seuil sémantiques." : "Semantic threshold zone colors."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Couleurs des zones de seuil catégorielles." : "Categorical threshold zone colors."}</td>
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

  :global(.solid-gauge-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-6, 1.5rem);
    align-items: center;
    margin-top: 0.75rem;
  }
</style>
