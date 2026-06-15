<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "navstack-demo-col" },
      children: [
        {
          comp: "NavActionStack",
          props: {
            label: locale.value === "fr" ? "Actions du compte" : "Account actions",
            actions: [
              { label: locale.value === "fr" ? "Enregistrer" : "Save", kind: "primary" },
              { label: locale.value === "fr" ? "Dupliquer" : "Duplicate", kind: "secondary" },
              { label: locale.value === "fr" ? "Exporter" : "Export", kind: "secondary" }
            ],
            dangerZone: {
              label: locale.value === "fr" ? "Supprimer le projet" : "Delete project"
            },
            dangerLabel: locale.value === "fr" ? "Zone sensible" : "Danger zone"
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Navigation" : "Component · Navigation"}
    </p>
    <div class="docs-hero-title">
      <h1>NavActionStack</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Pile d'actions qui <strong>encode la hiérarchie dans le type</strong> : au plus une action
        <code>kind:"primary"</code> (les suivantes sont dégradées en <code>secondary</code> avec un
        avertissement). La couleur sémantique « danger » n'est pas détournée en catégorie — la
        <code>dangerZone</code> destructrice est rendue à part, sous un <code>Divider</code> et un
        overline « zone sensible », en ton danger pleine largeur. Réutilise le <code>Button</code> du
        DS ; style <strong>token-only</strong>.
      {:else}
        An action stack that <strong>encodes hierarchy in the type</strong>: at most one
        <code>kind:"primary"</code> action (the rest are downgraded to <code>secondary</code> with a
        warning). The semantic “danger” color is not hijacked into a category — the destructive
        <code>dangerZone</code> is rendered separately, under a <code>Divider</code> and a “danger
        zone” overline, in a full-width danger tone. Reuses the DS <code>Button</code>;
        <strong>token-only</strong> styling.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Une action primaire, deux secondaires, et une zone sensible destructrice isolée.
      {:else}
        One primary action, two secondary, and an isolated destructive danger zone.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Pile d'actions" : "Action stack"}
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
          <td><code>actions</code></td>
          <td><code>NavAction[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Actions de la pile (label, kind, href/onClick, icon, disabled)." : "Stack actions (label, kind, href/onClick, icon, disabled)."}</td>
        </tr>
        <tr>
          <td><code>dangerZone</code></td>
          <td><code>NavActionDangerZone</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Action destructrice isolée (toujours en ton danger)." : "Isolated destructive action (always danger tone)."}</td>
        </tr>
        <tr>
          <td><code>dangerLabel</code></td>
          <td><code>string</code></td>
          <td><code>'Zone sensible'</code></td>
          <td>{locale.value === "fr" ? "Libellé de l'overline de la zone sensible." : "Overline label of the danger zone."}</td>
        </tr>
        <tr>
          <td><code>orientation</code></td>
          <td><code>'vertical' | 'horizontal'</code></td>
          <td><code>'vertical'</code></td>
          <td>{locale.value === "fr" ? "Pile pleine largeur ou rangée." : "Full-width stack or row."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><code>'Actions'</code></td>
          <td>{locale.value === "fr" ? "Étiquette a11y du groupe d'actions." : "Accessible label of the action group."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
      </tbody>
    </table>
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
          <td><code>--st-spacing-4</code> / <code>--st-spacing-2</code></td>
          <td>{locale.value === "fr" ? "Écarts entre les actions et entre les zones." : "Gaps between actions and between zones."}</td>
        </tr>
        <tr>
          <td><code>--st-component-overline-*</code></td>
          <td>{locale.value === "fr" ? "Style de l'overline « zone sensible »." : "Styling of the “danger zone” overline."}</td>
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

  :global(.navstack-demo-col) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    max-width: 320px;
  }
</style>
