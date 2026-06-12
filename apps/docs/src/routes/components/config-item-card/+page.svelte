<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "card-demo-stack" },
      children: [
        {
          comp: "ConfigItemCard",
          props: {
            item: {
              id: "1",
              name: locale.value === "fr" ? "Agent de tri" : "Triage Agent",
              key: "triage-agent",
              description:
                locale.value === "fr"
                  ? "Classe les demandes entrantes par priorité."
                  : "Sorts incoming requests by priority.",
              sourceLevel: "code",
              parentId: null
            },
            onCopy: () => {}
          }
        },
        {
          comp: "ConfigItemCard",
          props: {
            item: {
              id: "2",
              name: locale.value === "fr" ? "Agent de tri (copie)" : "Triage Agent (copy)",
              key: "triage-agent",
              description:
                locale.value === "fr"
                  ? "Variante personnalisée d'un défaut système."
                  : "Customized variant of a system default.",
              sourceLevel: "user",
              parentId: "1"
            },
            onEdit: () => {},
            onReset: () => {}
          }
        },
        {
          comp: "ConfigItemCard",
          props: {
            item: {
              id: "3",
              name: locale.value === "fr" ? "Workflow maison" : "Custom Workflow",
              key: "custom-workflow",
              description:
                locale.value === "fr"
                  ? "Créé par l'utilisateur, modifiable et supprimable."
                  : "User-created, editable and deletable.",
              sourceLevel: "user",
              parentId: null
            },
            onEdit: () => {},
            onDelete: () => {}
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
      <h1>ConfigItemCard</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Carte d'item de configuration (agents, workflows, gabarits de vue) : affiche un nom, une clé,
        une description et un badge de provenance (Système / Personnalisé). Les actions disponibles,
        Copier, Éditer, Réinitialiser, Supprimer, dépendent de la provenance de l'item.
      {:else}
        Configuration item card (agents, workflows, view templates): shows a name, a key, a
        description and a provenance badge (System / Customized). The available actions, Copy, Edit,
        Reset, Delete, depend on the item's provenance.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Trois provenances : un défaut système (Copier uniquement), une copie personnalisée (Éditer +
        Réinitialiser), et un item créé par l'utilisateur (Éditer + Supprimer).
      {:else}
        Three provenances: a system default (Copy only), a customized copy (Edit + Reset), and a
        user-created item (Edit + Delete).
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Items de configuration" : "Configuration items"}
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
          <td><code>item</code></td>
          <td><code>ConfigItem</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "L'item décrit (id, name, key, description, sourceLevel, parentId)." : "The described item (id, name, key, description, sourceLevel, parentId)."}</td>
        </tr>
        <tr>
          <td><code>hasCopy</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>{locale.value === "fr" ? "Si une copie existe déjà, masque l'action Copier." : "If a copy already exists, hides the Copy action."}</td>
        </tr>
        <tr>
          <td><code>onCopy</code></td>
          <td><code>(id: string) =&gt; void</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Action Copier (items système uniquement)." : "Copy action (system items only)."}</td>
        </tr>
        <tr>
          <td><code>onEdit</code></td>
          <td><code>(id: string) =&gt; void</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Action Éditer (items copiés ou créés)." : "Edit action (copied or created items)."}</td>
        </tr>
        <tr>
          <td><code>onReset</code></td>
          <td><code>(id: string) =&gt; void</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Action Réinitialiser (items copiés uniquement)." : "Reset action (copied items only)."}</td>
        </tr>
        <tr>
          <td><code>onDelete</code></td>
          <td><code>(id: string) =&gt; void</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Action Supprimer (items créés uniquement)." : "Delete action (created items only)."}</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>{locale.value === "fr" ? "Désactive toutes les actions." : "Disables all actions."}</td>
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
          <td><code>--st-component-card-background</code></td>
          <td>{locale.value === "fr" ? "Fond de la carte (défaut : surface-raised)." : "Card background (default: surface-raised)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-card-border</code></td>
          <td>{locale.value === "fr" ? "Couleur de la bordure (défaut : border-subtle)." : "Border color (default: border-subtle)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-info</code></td>
          <td>{locale.value === "fr" ? "Fond du badge Personnalisé." : "Customized badge background."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-warning / -error</code></td>
          <td>{locale.value === "fr" ? "Survol des actions Réinitialiser / Supprimer." : "Reset / Delete action hover."}</td>
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

  :global(.card-demo-stack) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-3, 0.75rem);
    max-width: 480px;
    width: 100%;
  }
</style>
