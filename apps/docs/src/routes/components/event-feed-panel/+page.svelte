<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const base = Date.UTC(2026, 5, 14, 9, 0, 0);

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-feed-box" },
      children: [
        {
          comp: "EventFeedPanel",
          props: {
            label: locale.value === "fr" ? "Activité du service" : "Service activity",
            maxHeight: 220,
            data: [
              {
                at: base,
                type: "deploy",
                severity: "info",
                message: locale.value === "fr" ? "Déploiement de la v2.4.0" : "Deployed v2.4.0"
              },
              {
                at: base + 90_000,
                type: "scale",
                severity: "success",
                message: locale.value === "fr" ? "Montée en charge (4 → 8 réplicas)" : "Scaled up (4 → 8 replicas)"
              },
              {
                at: base + 180_000,
                type: "latency",
                severity: "warning",
                message: locale.value === "fr" ? "Latence p99 au-dessus de 800 ms" : "p99 latency above 800 ms"
              },
              {
                at: base + 240_000,
                type: "alert",
                severity: "error",
                message: locale.value === "fr" ? "Pic d'erreurs 5xx sur /checkout" : "5xx spike on /checkout"
              },
              {
                at: base + 300_000,
                type: "recover",
                severity: "success",
                message: locale.value === "fr" ? "Erreurs résorbées, latence nominale" : "Errors cleared, latency nominal"
              }
            ]
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
      <h1>EventFeedPanel</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Flux d'événements datés et défilable (façon observabilité / New Relic). PANNEAU (liste DOM),
        pas un graphe SVG : chaque événement est trié par date décroissante (le plus récent en tête),
        teinté par sa <code>severity</code> (pastille + bordure sémantique), avec son <code>type</code>,
        son horodatage et son <code>message</code>. La hauteur est bornée par <code>maxHeight</code>
        (ou <code>height</code>) pour activer le défilement vertical. a11y : <code>role="feed"</code>
        sur la liste, <code>role="article"</code> par item.
      {:else}
        Scrollable dated event feed (observability / New Relic style). A PANEL (DOM list), not an SVG
        chart: each event is sorted by descending timestamp (newest first), tinted by its
        <code>severity</code> (badge + semantic border), with its <code>type</code>, timestamp and
        <code>message</code>. Height is capped by <code>maxHeight</code> (or <code>height</code>) to
        enable vertical scrolling. a11y: <code>role="feed"</code> on the list,
        <code>role="article"</code> per item.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Cinq événements d'un service sur quelques minutes : déploiement, montée en charge, alerte de
        latence, pic d'erreurs et reprise — chaque ligne colorée par sa sévérité.
      {:else}
        Five service events over a few minutes: deploy, scale-up, latency warning, error spike and
        recovery — each row colored by its severity.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Activité du service" : "Service activity"}
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
          <td><code>EventFeedPanelEvent[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Événements : { at, type, severity, message }." : "Events: { at, type, severity, message }."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellé accessible du flux." : "Accessible feed label."}</td>
        </tr>
        <tr>
          <td><code>maxHeight</code></td>
          <td><code>number</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Hauteur max (px) déclenchant le défilement." : "Max height (px) that triggers scrolling."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Alias de maxHeight." : "Alias of maxHeight."}</td>
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
        ? "EventFeedPanelEvent = { at: number; type: string; severity: 'info' | 'success' | 'warning' | 'error' | string; message: string } : une severity inconnue retombe sur le ton neutre."
        : "EventFeedPanelEvent = { at: number; type: string; severity: 'info' | 'success' | 'warning' | 'error' | string; message: string } : an unknown severity falls back to the neutral tone."}
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
          <td>{locale.value === "fr" ? "Fond des items du flux." : "Feed item background."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-info</code> / <code>success</code> / <code>warning</code> / <code>error</code></td>
          <td>{locale.value === "fr" ? "Couleurs de pastille et de bordure par sévérité." : "Badge and border colors per severity."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-strong</code></td>
          <td>{locale.value === "fr" ? "Bordure/pastille du ton neutre (sévérité inconnue)." : "Neutral-tone border/badge (unknown severity)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-primary</code> / <code>secondary</code></td>
          <td>{locale.value === "fr" ? "Type/horodatage et message." : "Type/timestamp and message text."}</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-feed-box) {
    max-width: 28rem;
  }

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
