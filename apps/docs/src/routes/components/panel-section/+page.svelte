<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // Le stack est en block-size:100% et ne défile jamais lui-même : il lui faut
  // donc un parent à hauteur bornée. C'est exactement ce que fait un panneau
  // latéral d'application ; la démo le reproduit avec un cadre de 20rem.
  const frame = (children: NodeSpec[]): NodeSpec => ({
    el: "div",
    props: {
      style:
        "block-size:20rem;inline-size:min(100%, 26rem);border:1px solid var(--st-semantic-border-subtle);border-radius:0.5rem;padding:0 0.5rem;overflow:hidden"
    },
    children
  });

  // Aperçu Angular de CETTE documentation : l'île passe les sections au stack en
  // noeuds projetés (projectableNodes), que @ContentChildren ne résout pas. Le
  // stack ne voit donc aucune section et chacune garde ses défauts hors stack.
  // Le composant publié n'est pas en cause : chez un consommateur qui déclare ses
  // sections dans son template, la coordination a lieu (tests de rendu du paquet
  // Angular). Tant que l'île n'est pas refaite, la page le dit là où on regarde.
  const angularPreviewNote = (symptom: { fr: string; en: string }) =>
    fr
      ? `Aperçu Angular incomplet : cette documentation injecte les sections dans le stack d'une manière que PanelStack ne voit pas, donc la coordination PanelStack ↔ PanelSection n'est pas reproduite ici — ${symptom.fr} Le composant Angular, lui, réalise cette coordination chez un consommateur réel qui déclare ses PanelSection dans son template (voir la limite connue sous l'API de PanelStack).`
      : `Incomplete Angular preview: this documentation injects the sections into the stack in a way PanelStack cannot see, so the PanelStack ↔ PanelSection coordination is not reproduced here — ${symptom.en} The Angular component itself does perform this coordination for a real consumer that declares its PanelSection children in its template (see the known limitation under the PanelStack API).`;

  const body = (text: string): NodeSpec => ({
    el: "p",
    props: { style: "margin:0 0 0.75rem;font-size:0.875rem" },
    children: [text]
  });

  const stickyDemo = $derived<NodeSpec[]>([
    frame([
      {
        comp: "PanelStack",
        props: {
          label: fr ? "Panneau latéral" : "Side panel",
          defaultExpanded: "filters"
        },
        children: [
          {
            comp: "PanelSection",
            props: { id: "filters", label: fr ? "Filtres" : "Filters" },
            children: [
              body(
                fr
                  ? "La section ouverte possède le défilement ; les autres restent réduites à leur en-tête."
                  : "The open section owns the scroll; the others stay collapsed to their header."
              ),
              body(fr ? "Période : 30 derniers jours." : "Period: last 30 days."),
              body(fr ? "Statut : en cours." : "Status: in progress.")
            ]
          },
          {
            comp: "PanelSection",
            props: { id: "details", label: fr ? "Détails" : "Details" },
            children: [body(fr ? "Métadonnées de l'élément." : "Item metadata.")]
          },
          {
            comp: "PanelSection",
            props: { id: "history", label: fr ? "Historique" : "History" },
            children: [body(fr ? "Douze événements." : "Twelve events.")]
          }
        ]
      }
    ])
  ]);

  const splitDemo = $derived<NodeSpec[]>([
    frame([
      {
        comp: "PanelStack",
        props: {
          shape: "split-primary",
          label: fr ? "Panneau d'assistance" : "Assistance panel",
          primary: "chat"
        },
        children: [
          {
            comp: "PanelSection",
            props: { id: "chat", label: fr ? "Conversation" : "Conversation" },
            children: [
              body(
                fr
                  ? "Section primaire : toujours dépliée, sans affordance de repli, propriétaire du défilement."
                  : "Primary section: always expanded, no disclosure affordance, owns the scroll."
              ),
              body(fr ? "Message 1" : "Message 1"),
              body(fr ? "Message 2" : "Message 2"),
              body(fr ? "Message 3" : "Message 3")
            ]
          },
          {
            comp: "PanelSection",
            props: { id: "sources", label: "Sources" },
            children: [body(fr ? "Trois documents cités." : "Three cited documents.")]
          },
          {
            comp: "PanelSection",
            props: { id: "settings", label: fr ? "Réglages" : "Settings" },
            children: [body(fr ? "Modèle, température." : "Model, temperature.")]
          }
        ]
      }
    ])
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {fr ? "Composant · Structure" : "Component · Layout"}
    </p>
    <div class="docs-hero-title">
      <h1>PanelSection</h1>
      <Badge tone="success">{fr ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if fr}
        Une <strong>section d'un <code>PanelStack</code></strong> : un en-tête (titre, contrôles
        optionnels) et un corps. C'est la brique d'un panneau latéral découpé en régions —
        filtres, détails, conversation. Le corps reste <strong>monté en permanence</strong> : le
        repli est purement CSS, si bien qu'un contenu à état (carte, éditeur, session de chat)
        survit à un repli/dépli sans être remonté.
      {:else}
        One <strong>section of a <code>PanelStack</code></strong>: a header (title, optional
        controls) and a body. It is the building block of a side panel split into regions —
        filters, details, conversation. The body stays <strong>mounted at all times</strong>:
        collapsing is purely a CSS concern, so stateful content (a map, an editor, a chat session)
        survives collapse/expand without remounting.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "À utiliser dans un PanelStack" : "Use inside a PanelStack"}</h2>
    <p class="section-desc">
      {#if fr}
        <code>PanelSection</code> est conçu pour vivre dans un <code>PanelStack</code>, qui décide
        seul de la forme (<code>shape</code>), de la section dépliée et de l'unique section
        propriétaire du défilement. Sans stack ancêtre, une section se replie sur un comportement
        sain — dépliée, propriétaire du défilement, non primaire — mais elle perd toute
        coordination avec ses voisines.
      {:else}
        <code>PanelSection</code> is designed to live inside a <code>PanelStack</code>, which alone
        decides the shape, which section is expanded, and which single section owns the scroll.
        With no stack ancestor a section falls back to a sane behaviour — expanded, scroll-owning,
        non-primary — but it loses all coordination with its siblings.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Forme « sticky-item »" : "“sticky-item” shape"}</h2>
    <p class="section-desc">
      {#if fr}
        Forme par défaut : <strong>une seule section dépliée à la fois</strong>, tous les en-têtes
        restant visibles. Chaque en-tête replié est un bouton de divulgation
        (<code>aria-expanded</code> / <code>aria-controls</code>) qui étiquette sa région.
      {:else}
        The default shape: <strong>one section expanded at a time</strong>, with every header
        staying visible. Each collapsed header is a disclosure button
        (<code>aria-expanded</code> / <code>aria-controls</code>) labelling its region.
      {/if}
    </p>
    <TabbedExample
      nodes={stickyDemo}
      title={fr ? "Panneau latéral à trois sections" : "Three-section side panel"}
      notes={{
        angular: angularPreviewNote({
          fr: "les trois sections y restent dépliées au lieu d'une seule.",
          en: "all three sections stay expanded instead of one."
        })
      }}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Forme « split-primary »" : "“split-primary” shape"}</h2>
    <p class="section-desc">
      {#if fr}
        Une section <strong>primaire</strong> est toujours dépliée et possède le défilement ; les
        autres sont des divulgations dimensionnées par leur contenu. La primaire n'affiche
        volontairement <strong>pas</strong> de bouton : elle ne peut pas se replier, une affordance
        de repli mentirait. Elle conserve un plancher utile (<code>primaryMinHeight</code>, 160 px
        par défaut) : sous ce seuil, c'est une secondaire qui se replie plutôt que la primaire qui
        s'écrase.
      {:else}
        A <strong>primary</strong> section is always expanded and owns the scroll; the others are
        content-sized disclosures. The primary deliberately shows <strong>no</strong> button: it
        cannot collapse, so a disclosure affordance would lie. It keeps a usable floor
        (<code>primaryMinHeight</code>, 160 px by default): below that threshold a secondary
        collapses rather than the primary being squeezed further.
      {/if}
    </p>
    <TabbedExample
      nodes={splitDemo}
      title={fr ? "Conversation primaire + annexes" : "Primary conversation + side sections"}
      notes={{
        angular: angularPreviewNote({
          fr: "toutes les sections y restent dépliées et la primaire y garde un bouton de repli.",
          en: "every section stays expanded and the primary keeps a collapse button."
        })
      }}
    />
    <p class="docs-demo-note">
      {fr
        ? "Au plus quatre sections par stack (PANEL_STACK_MAX_SECTIONS) : au-delà, empiler des régions repliables dans un panneau rend le défilement ingérable. Le dépassement est signalé par un avertissement en développement, jamais par une troncature silencieuse."
        : "At most four sections per stack (PANEL_STACK_MAX_SECTIONS): beyond that, stacking collapsible regions in a panel makes scrolling unmanageable. Going over warns in development — it is never silently truncated."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{fr ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>id</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>
            {fr
              ? "Identifiant de la section : c'est par lui que le stack la désigne (expanded, primary)."
              : "Section identifier: how the stack designates it (expanded, primary)."}
          </td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>{fr ? "Titre affiché dans l'en-tête." : "Title shown in the header."}</td>
        </tr>
        <tr>
          <td><code>children</code></td>
          <td><code>Snippet</code></td>
          <td>—</td>
          <td>{fr ? "Contenu du corps de la section." : "The section body's content."}</td>
        </tr>
        <tr>
          <td><code>actions</code></td>
          <td><code>Snippet</code></td>
          <td>—</td>
          <td>
            {fr
              ? "Contrôles en fin d'en-tête (boutons, compteurs)."
              : "Header-trailing controls (buttons, counts)."}
          </td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{fr ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {fr
        ? "React, Vue et Angular exposent la même API ; en Angular, actions est un booléen qui active le slot (slot=\"actions\"), faute de pouvoir détecter du contenu projeté optionnel."
        : "React, Vue and Angular expose the same API; on Angular, actions is a boolean enabling the slot (slot=\"actions\"), since optional projected content cannot be detected."}
    </p>

    <h3 class="api-subhead">{fr ? "Le parent : PanelStack" : "The parent: PanelStack"}</h3>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{fr ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>shape</code></td>
          <td><code>'sticky-item' | 'split-primary'</code></td>
          <td><code>'sticky-item'</code></td>
          <td>
            {fr
              ? "Règle de coordination des sections."
              : "How the sections coordinate with one another."}
          </td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{fr ? "Nom accessible de la région du stack." : "Accessible name of the stack region."}</td>
        </tr>
        <tr>
          <td><code>expanded</code> / <code>defaultExpanded</code></td>
          <td><code>string | null</code></td>
          <td>—</td>
          <td>
            {fr
              ? "sticky-item : id de la section dépliée, contrôlé ou en graine."
              : "sticky-item: id of the expanded section, controlled or as a seed."}
          </td>
        </tr>
        <tr>
          <td><code>onExpandedChange</code></td>
          <td><code>(id: string | null) =&gt; void</code></td>
          <td>—</td>
          <td>{fr ? "Notification de changement." : "Change notification."}</td>
        </tr>
        <tr>
          <td><code>primary</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>
            {fr
              ? "split-primary : id de la section propriétaire du défilement."
              : "split-primary: id of the scroll-owning section."}
          </td>
        </tr>
        <tr>
          <td><code>primaryMinHeight</code></td>
          <td><code>number</code></td>
          <td><code>160</code></td>
          <td>{fr ? "Plancher utile de la primaire, en px." : "Usable floor for the primary, in px."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-caveat" role="note">
      {#if fr}
        <strong>Angular — limite connue.</strong> Déclarez les <code>PanelSection</code> directement
        dans le template du <code>PanelStack</code>. Des sections produites par <code>@for</code>, ou
        des sections statiques mêlées à des sections sous <code>@if</code> / <code>@for</code>,
        reçoivent l'état du stack trop tard : en mode développement, Angular lève
        <code>NG0100</code> (ExpressionChangedAfterItHasBeenChecked) ; en production, la première image
        montre ces sections avec leurs défauts hors stack (dépliées, chacune propriétaire du défilement),
        et dans une application sans zone.js elles restent ainsi tant que rien ne les fait revérifier
        (une interaction, par exemple). Limite non corrigée à ce jour.
      {:else}
        <strong>Angular — known limitation.</strong> Declare the <code>PanelSection</code> children
        directly in the <code>PanelStack</code>'s template. Sections produced by <code>@for</code>, or
        static sections mixed with sections under <code>@if</code> / <code>@for</code>, receive the
        stack's state too late: in development mode Angular throws <code>NG0100</code>
        (ExpressionChangedAfterItHasBeenChecked); in production the first frame shows those sections
        with their standalone defaults (expanded, each owning the scroll), and in a zoneless application
        they stay that way until something gets them checked again (a user interaction, for instance).
        Not fixed yet.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Tokens CSS" : "CSS Tokens"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>{fr ? "Variable CSS" : "CSS Variable"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--st-component-accordion-paddingBlock / -paddingInline</code></td>
          <td>{fr ? "Rembourrage de l'en-tête." : "Header padding."}</td>
        </tr>
        <tr>
          <td><code>--st-component-accordion-fontSize / -fontWeight / -lineHeight / -text</code></td>
          <td>{fr ? "Typographie du titre de section." : "Section title typography."}</td>
        </tr>
        <tr>
          <td><code>--st-component-control-hoverBackground</code></td>
          <td>{fr ? "Survol de l'en-tête repliable." : "Hover on the collapsible header."}</td>
        </tr>
        <tr>
          <td><code>--st-component-control-border</code></td>
          <td>{fr ? "Séparateur entre deux sections." : "Separator between two sections."}</td>
        </tr>
        <tr>
          <td><code>--st-component-panelStack-primaryMinBlockSize</code></td>
          <td>
            {fr
              ? "Plancher CSS de la section propriétaire du défilement, émis par PanelStack depuis primaryMinHeight."
              : "CSS floor of the scroll-owning section, emitted by PanelStack from primaryMinHeight."}
          </td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-focus</code></td>
          <td>
            {fr
              ? "Anneau de focus de l'en-tête. Point de surcharge uniquement : aucun thème ne le définit, le composant retombe sur --st-semantic-brand-default tant que vous ne lui donnez pas de valeur."
              : "Header focus ring. An override point only: no theme defines it, and the component falls back to --st-semantic-brand-default until you give it a value."}
          </td>
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

  /* Réserve à ne pas manquer : même traitement que l'avertissement d'aperçu de
     TabbedExample (paire surface-subtle / text-primary du thème actif). */
  .docs-caveat {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-left: 4px solid var(--st-semantic-feedback-warning, #b45309);
    border-radius: 0.375rem;
    color: var(--st-semantic-text-primary, #0f172a);
    font-size: 0.875rem;
    line-height: 1.55;
    margin: 1rem 0 0;
    max-width: 46rem;
    padding: 0.75rem 0.9rem;
  }
</style>
