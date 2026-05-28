<script lang="ts">
  import { Badge, MessageActions, type MessageAction } from "@sentropic/design-system-svelte";
  import { Copy, Pencil, RefreshCw, ThumbsDown, ThumbsUp, Trash2 } from "@lucide/svelte";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      kicker: "Composant · Chat",
      status: "Stable",
      intro: "Rendu d’un panel d’actions liées au message avec overflow optionnel.",
      hoverTitle: "Actions en hover",
      alwaysTitle: "Actions always-visible",
      overflowTitle: "Overflow",
      lastActionLabel: "Dernière action",
      noAction: "Aucune",
      actionsTitle: "API",
      statuses: ["copy", "edit", "regen", "like", "dislike", "delete"],
      actionCopy: "Copier",
      actionEdit: "Éditer",
      actionRegen: "Relancer",
      actionLike: "J’aime",
      actionDislike: "Je n’aime pas",
      actionDelete: "Supprimer"
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro: "Message action row with icon buttons and optional overflow.",
      hoverTitle: "Hover-only actions",
      alwaysTitle: "Always-visible actions",
      overflowTitle: "Overflow",
      lastActionLabel: "Last action",
      noAction: "None",
      actionsTitle: "API",
      statuses: ["copy", "edit", "regen", "like", "dislike", "delete"],
      actionCopy: "Copy",
      actionEdit: "Edit",
      actionRegen: "Regenerate",
      actionLike: "Like",
      actionDislike: "Dislike",
      actionDelete: "Delete"
    }
  } as const;

  const text = () => copy[locale.value];

  let lastAction = $state<string>(text().noAction);

  function mark(label: string) {
    lastAction = label;
  }

  const hoverActions: MessageAction[] = [
    { id: "copy", label: text().actionCopy, icon: iconCopy, onClick: () => mark(text().actionCopy), variant: "default" },
    { id: "edit", label: text().actionEdit, icon: iconEdit, onClick: () => mark(text().actionEdit), variant: "default" },
    { id: "regen", label: text().actionRegen, icon: iconRegen, onClick: () => mark(text().actionRegen), variant: "default" }
  ];

  const alwaysActions: MessageAction[] = [
    { id: "like", label: text().actionLike, icon: iconLike, onClick: () => mark(text().actionLike), variant: "default" },
    { id: "dislike", label: text().actionDislike, icon: iconDislike, onClick: () => mark(text().actionDislike), variant: "default" },
    { id: "delete", label: text().actionDelete, icon: iconDelete, onClick: () => mark(text().actionDelete), variant: "danger" }
  ];
</script>

{#snippet iconCopy()}
  <Copy size={14} strokeWidth={2.2} aria-hidden="true" />
{/snippet}

{#snippet iconEdit()}
  <Pencil size={14} strokeWidth={2.2} aria-hidden="true" />
{/snippet}

{#snippet iconRegen()}
  <RefreshCw size={14} strokeWidth={2.2} aria-hidden="true" />
{/snippet}

{#snippet iconLike()}
  <ThumbsUp size={14} strokeWidth={2.2} aria-hidden="true" />
{/snippet}

{#snippet iconDislike()}
  <ThumbsDown size={14} strokeWidth={2.2} aria-hidden="true" />
{/snippet}

{#snippet iconDelete()}
  <Trash2 size={14} strokeWidth={2.2} aria-hidden="true" />
{/snippet}

{#snippet overflowIcon()}
  <span>⋮</span>
{/snippet}

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <h1>
      MessageActions
      <Badge tone="success">{text().status}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().hoverTitle}</h2>
    <div class="docs-example docs-example--stack">
      <MessageActions actions={hoverActions} />
      <p>{text().lastActionLabel}: <strong>{lastAction}</strong></p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().alwaysTitle}</h2>
    <div class="docs-example docs-example--stack">
      <MessageActions visibility="always" actions={alwaysActions} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().overflowTitle}</h2>
    <div class="docs-example docs-example--stack">
      <MessageActions actions={hoverActions} overflow={overflowIcon} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().actionsTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>actions</code></td><td>Liste d’objets <code>MessageAction</code>.</td></tr>
        <tr><td><code>visibility</code></td><td><code>hover</code> (défaut) ou <code>always</code>.</td></tr>
        <tr><td><code>overflow</code></td><td>Snippet affiché en queue de ligne si fourni.</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>Types clés</h2>
    <pre class="docs-pre">{`export type MessageAction = {
  id: string;
  label: string;
  icon: Snippet;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
};`}</pre>
  </section>
</div>

<style>
  .docs-pre {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-radius: 0.5rem;
    margin: 0;
    overflow-x: auto;
    padding: 0.75rem;
  }
</style>
