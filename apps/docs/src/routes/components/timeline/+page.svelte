<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const items = $derived(
    locale.value === "fr"
      ? [
          { title: "Dossier créé", meta: "12 mai 2026 · 09:14", description: "Ouverture du dossier par l'agent.", tone: "info" },
          { title: "Documents reçus", meta: "14 mai 2026", description: "Pièces justificatives complètes.", tone: "success" },
          { title: "En révision", meta: "16 mai 2026", description: "Analyse en cours par le comité.", tone: "warning" },
          { title: "Refusé", meta: "20 mai 2026", description: "Critères de revenu non atteints.", tone: "danger" },
          { title: "Archivé", meta: "30 mai 2026" }
        ]
      : [
          { title: "Case opened", meta: "May 12, 2026 · 09:14", description: "Case opened by the agent.", tone: "info" },
          { title: "Documents received", meta: "May 14, 2026", description: "Supporting documents complete.", tone: "success" },
          { title: "Under review", meta: "May 16, 2026", description: "Committee analysis in progress.", tone: "warning" },
          { title: "Declined", meta: "May 20, 2026", description: "Income criteria not met.", tone: "danger" },
          { title: "Archived", meta: "May 30, 2026" }
        ]
  );

  const horizontalItems = $derived(
    locale.value === "fr"
      ? [
          { title: "Commande", meta: "J0", tone: "info" },
          { title: "Préparée", meta: "J1", tone: "success" },
          { title: "Expédiée", meta: "J2", tone: "success" },
          { title: "Livrée", meta: "J4", tone: "neutral" }
        ]
      : [
          { title: "Ordered", meta: "D0", tone: "info" },
          { title: "Packed", meta: "D1", tone: "success" },
          { title: "Shipped", meta: "D2", tone: "success" },
          { title: "Delivered", meta: "D4", tone: "neutral" }
        ]
  );

  const verticalNodes = $derived<NodeSpec[]>([{ comp: "Timeline", props: { items } }]);
  const horizontalNodes = $derived<NodeSpec[]>([
    { comp: "Timeline", props: { items: horizontalItems, orientation: "horizontal" } }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Feedback" : "Component · Feedback"}
    </p>
    <div class="docs-hero-title">
      <h1>Timeline</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Liste d'<strong>événements datés</strong> reliés par une ligne de connexion — façon
        <code>Ant Design Timeline</code> / <code>MUI Timeline</code>. Chaque item porte une pastille
        de statut (ton), un titre, une méta (date/heure) et une description optionnelle. Sémantique
        <code>&lt;ol&gt;</code>/<code>&lt;li&gt;</code>, pastilles <code>aria-hidden</code>. Distinct
        de <code>TimelineChart</code> (dataviz à échelle temporelle continue) : ici c'est une liste
        chronologique d'événements discrets.
      {:else}
        A list of <strong>dated events</strong> connected by a rail — like
        <code>Ant Design Timeline</code> / <code>MUI Timeline</code>. Each item carries a status dot
        (tone), a title, a meta (date/time) and an optional description. Semantic
        <code>&lt;ol&gt;</code>/<code>&lt;li&gt;</code>, dots are <code>aria-hidden</code>. Distinct
        from <code>TimelineChart</code> (continuous time-scale dataviz): this is a chronological list
        of discrete events.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Vertical" : "Vertical"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Orientation par défaut : chaque événement empile méta, titre et description, relié à la
        pastille suivante par une ligne verticale.
      {:else}
        Default orientation: each event stacks meta, title and description, linked to the next dot
        by a vertical rail.
      {/if}
    </p>
    <TabbedExample
      nodes={verticalNodes}
      title={locale.value === "fr" ? "Suivi de dossier" : "Case history"}
    />
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Horizontal" : "Horizontal"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Avec <code>orientation="horizontal"</code>, les événements se déploient sur une ligne, idéal
        pour un suivi compact d'étapes.
      {:else}
        With <code>orientation="horizontal"</code>, events lay out along a row — handy for a compact
        step tracker.
      {/if}
    </p>
    <TabbedExample
      nodes={horizontalNodes}
      title={locale.value === "fr" ? "Suivi de livraison" : "Delivery tracker"}
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
          <td><code>items</code></td>
          <td><code>TimelineItem[]</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Événements affichés, dans l'ordre." : "Events to display, in order."}</td>
        </tr>
        <tr>
          <td><code>orientation</code></td>
          <td><code>'vertical' | 'horizontal'</code></td>
          <td><code>'vertical'</code></td>
          <td>{locale.value === "fr" ? "Sens de déploiement de la ligne." : "Direction the rail unfolds."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
      </tbody>
    </table>
    <h3 class="api-subhead">TimelineItem</h3>
    <table class="docs-table">
      <thead>
        <tr>
          <th>{locale.value === "fr" ? "Champ" : "Field"}</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td>{locale.value === "fr" ? "Titre de l'événement (requis)." : "Event title (required)."}</td>
        </tr>
        <tr>
          <td><code>meta</code></td>
          <td><code>string</code></td>
          <td>{locale.value === "fr" ? "Date, heure ou libellé court." : "Date, time or short label."}</td>
        </tr>
        <tr>
          <td><code>description</code></td>
          <td><code>string</code></td>
          <td>{locale.value === "fr" ? "Texte secondaire optionnel." : "Optional secondary text."}</td>
        </tr>
        <tr>
          <td><code>tone</code></td>
          <td><code>'neutral' | 'info' | 'success' | 'warning' | 'danger'</code></td>
          <td>{locale.value === "fr" ? "Couleur de la pastille (token de statut, défaut 'neutral')." : "Dot color (status token, defaults to 'neutral')."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Accessibilité : structure <ol>/<li> ; la pastille et la ligne sont aria-hidden."
        : "Accessibility: <ol>/<li> structure; the dot and rail are aria-hidden."}
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
          <td><code>--st-semantic-feedback-info / success / warning / error</code></td>
          <td>{locale.value === "fr" ? "Couleur de pastille selon le ton." : "Dot color per tone."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-subtle</code></td>
          <td>{locale.value === "fr" ? "Ligne de connexion." : "Connecting rail."}</td>
        </tr>
        <tr>
          <td><code>--st-spacing-3 / --st-spacing-4</code></td>
          <td>{locale.value === "fr" ? "Espacement entre pastille, contenu et items." : "Spacing between dot, content and items."}</td>
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

  .api-subhead {
    font-size: 1rem;
    margin: 1.5rem 0 0.5rem;
  }

  .docs-demo-note {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.75rem;
  }
</style>
