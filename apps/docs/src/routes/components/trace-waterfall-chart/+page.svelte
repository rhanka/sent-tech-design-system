<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "TraceWaterfallChart",
      props: {
        label: locale.value === "fr" ? "Trace distribuée" : "Distributed trace",
        width: 560,
        height: 240,
        data: {
          spans: [
            { spanId: "a", parentSpanId: null, service: "gateway", start: 0, duration: 120 },
            { spanId: "b", parentSpanId: "a", service: "auth", start: 8, duration: 22 },
            { spanId: "c", parentSpanId: "a", service: "orders", start: 34, duration: 64 },
            { spanId: "d", parentSpanId: "c", service: "db", start: 42, duration: 38 },
            { spanId: "e", parentSpanId: "a", service: "render", start: 100, duration: 18 }
          ]
        }
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>TraceWaterfallChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Spans distribués imbriqués (trace waterfall, façon Grafana Tempo / Jaeger). Chaque span est
        une barre sur l'axe temps (<code>start → start + duration</code>) ; les spans sont ordonnés
        par parcours en profondeur depuis les racines (<code>parentSpanId == null</code>), indentés
        par profondeur, une ligne par span (libellé = <code>service</code>). Couleur stable par
        service. Axe temps gradué comme le GanttChart.
      {:else}
        Nested distributed spans (trace waterfall, Grafana Tempo / Jaeger style). Each span is a bar
        on the time axis (<code>start → start + duration</code>); spans are ordered by depth-first
        traversal from the roots (<code>parentSpanId == null</code>), indented by depth, one row per
        span (label = <code>service</code>). Stable color per service. Ticked time axis like the
        GanttChart.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Une requête traversant cinq services : la passerelle englobe tout, et la requête base de
        données est imbriquée sous le service de commandes.
      {:else}
        A request crossing five services: the gateway wraps everything, and the database call is
        nested under the orders service.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Trace distribuée" : "Distributed trace"}
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
          <td><code>{"{ spans: TraceSpan[] }"}</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Spans de la trace (hiérarchie parent→enfant)." : "Trace spans (parent→child hierarchy)."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellé accessible du graphe." : "Accessible chart label."}</td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td><code>number</code></td>
          <td><code>640</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>320</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Alias de width (largeur du viewBox)." : "Alias of width (viewBox width)."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "TraceSpan = { spanId: string; parentSpanId?: string | null; service: string; start: number; duration: number }"
        : "TraceSpan = { spanId: string; parentSpanId?: string | null; service: string; start: number; duration: number }"}
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
          <td>{locale.value === "fr" ? "Couleurs des barres (par service)." : "Bar colors (by service)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-secondary</code></td>
          <td>{locale.value === "fr" ? "Étiquettes de service + graduations de l'axe." : "Service labels + axis ticks."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-inverse</code></td>
          <td>{locale.value === "fr" ? "Fond de l'infobulle au survol." : "Hover tooltip background."}</td>
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
</style>
