<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  export type ConfigItemSourceLevel = "code" | "admin" | "user";

  export type ConfigItem = {
    id: string;
    name: string;
    key?: string;
    description?: string | null;
    /** Provenance : `code`/`admin` = système (verrouillé), `user` = personnalisé. */
    sourceLevel: ConfigItemSourceLevel;
    /** Identifiant du parent si l'item est une copie d'un défaut système. */
    parentId?: string | null;
    version?: number;
  };

  export type ConfigItemCardProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** L'item de configuration décrit par la carte. */
    item: ConfigItem;
    /** Vrai si une copie de cet item système existe déjà : masque l'action Copier. */
    hasCopy?: boolean;
    /** Action Copier (items système uniquement). */
    onCopy?: (id: string) => void;
    /** Action Éditer (items copiés ou créés par l'utilisateur). */
    onEdit?: (id: string) => void;
    /** Action Réinitialiser (items copiés uniquement). */
    onReset?: (id: string) => void;
    /** Action Supprimer (items créés par l'utilisateur uniquement). */
    onDelete?: (id: string) => void;
    /** Désactive toutes les actions. */
    disabled?: boolean;
    class?: string;
    /** Contenu supplémentaire sous la carte (formulaire d'édition, détails…). */
    children?: Snippet;
  };
</script>

<script lang="ts">
  let {
    item,
    hasCopy = false,
    onCopy,
    onEdit,
    onReset,
    onDelete,
    disabled = false,
    class: className,
    children,
    ...rest
  }: ConfigItemCardProps = $props();

  const isSystem = $derived(item.sourceLevel === "code" || item.sourceLevel === "admin");
  const isCopied = $derived(item.sourceLevel === "user" && !!item.parentId);
  const isUserCreated = $derived(item.sourceLevel === "user" && !item.parentId);

  const classes = $derived(["st-configItemCard", className].filter(Boolean).join(" "));
</script>

<article
  {...rest}
  class={classes}
  data-testid={`config-item-card-${item.key ?? item.id}`}
>
  <div class="st-configItemCard__header">
    <span class="st-configItemCard__name">{item.name}</span>
    {#if isSystem}
      <span class="st-configItemCard__badge st-configItemCard__badge--system">
        <svg
          class="st-configItemCard__badgeIcon"
          width="12"
          height="12"
          viewBox="0 0 14 14"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 6V4.5a3 3 0 0 1 6 0V6M3.5 6h7A1.5 1.5 0 0 1 12 7.5v3A1.5 1.5 0 0 1 10.5 12h-7A1.5 1.5 0 0 1 2 10.5v-3A1.5 1.5 0 0 1 3.5 6Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Système
      </span>
    {:else if isCopied}
      <span class="st-configItemCard__badge st-configItemCard__badge--custom">
        Personnalisé
      </span>
    {/if}
  </div>

  {#if item.key}
    <div class="st-configItemCard__key">{item.key}</div>
  {/if}

  {#if item.description}
    <p class="st-configItemCard__description">{item.description}</p>
  {/if}

  {#if (isSystem && !hasCopy && onCopy) || ((isCopied || isUserCreated) && onEdit) || (isCopied && onReset) || (isUserCreated && onDelete)}
    <div class="st-configItemCard__actions">
      {#if isSystem && !hasCopy && onCopy}
        <button
          type="button"
          class="st-configItemCard__action"
          title="Copier"
          aria-label="Copier"
          {disabled}
          onclick={() => onCopy?.(item.id)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M5.5 5.5V3.75A1.25 1.25 0 0 1 6.75 2.5h5.5A1.25 1.25 0 0 1 13.5 3.75v5.5a1.25 1.25 0 0 1-1.25 1.25H10.5M3.75 5.5h5.5A1.25 1.25 0 0 1 10.5 6.75v5.5a1.25 1.25 0 0 1-1.25 1.25h-5.5A1.25 1.25 0 0 1 2.5 12.25v-5.5A1.25 1.25 0 0 1 3.75 5.5Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      {/if}
      {#if (isCopied || isUserCreated) && onEdit}
        <button
          type="button"
          class="st-configItemCard__action"
          title="Éditer"
          aria-label="Éditer"
          {disabled}
          onclick={() => onEdit?.(item.id)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="m10.5 2.5 3 3L6 13l-3.5.5L3 10l7.5-7.5Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      {/if}
      {#if isCopied && onReset}
        <button
          type="button"
          class="st-configItemCard__action st-configItemCard__action--warning"
          title="Réinitialiser"
          aria-label="Réinitialiser"
          {disabled}
          onclick={() => onReset?.(item.id)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M3 8a5 5 0 1 1 1.5 3.5M3 8V5M3 8h3"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      {/if}
      {#if isUserCreated && onDelete}
        <button
          type="button"
          class="st-configItemCard__action st-configItemCard__action--danger"
          title="Supprimer"
          aria-label="Supprimer"
          {disabled}
          onclick={() => onDelete?.(item.id)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M3 4.5h10M6 4.5V3.25A.75.75 0 0 1 6.75 2.5h2.5a.75.75 0 0 1 .75.75V4.5M4.25 4.5l.5 8A1 1 0 0 0 5.75 13.5h4.5a1 1 0 0 0 1-.99l.5-8"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      {/if}
    </div>
  {/if}

  {@render children?.()}
</article>

<style>
  .st-configItemCard {
    background: var(--st-component-card-background, var(--st-semantic-surface-raised));
    border-width: var(--st-component-card-anatomy-shape-borderWidth, 1px);
    border-style: var(--st-component-card-anatomy-shape-borderStyle, solid);
    border-color: var(--st-component-card-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-card-anatomy-shape-radius, 0.5rem);
    color: var(--st-semantic-text-primary);
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    padding: var(--st-spacing-4, 1rem);
  }

  .st-configItemCard__header {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-configItemCard__name {
    color: var(--st-semantic-text-primary);
    font-weight: 600;
  }

  .st-configItemCard__badge {
    align-items: center;
    border-radius: 9999px;
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.6875rem;
    font-weight: 500;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
    padding: 0.1875rem var(--st-spacing-2, 0.5rem);
  }

  .st-configItemCard__badge--system {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-secondary);
  }

  .st-configItemCard__badge--custom {
    background: var(--st-semantic-feedback-info);
    color: var(--st-semantic-text-inverse);
  }

  .st-configItemCard__badgeIcon {
    display: block;
    flex: 0 0 auto;
  }

  .st-configItemCard__key {
    color: var(--st-semantic-text-muted);
    font-size: 0.75rem;
  }

  .st-configItemCard__description {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    line-height: 1.4;
    margin: var(--st-spacing-1, 0.25rem) 0 0;
  }

  .st-configItemCard__actions {
    display: flex;
    gap: var(--st-spacing-1, 0.25rem);
    margin-top: var(--st-spacing-3, 0.75rem);
  }

  .st-configItemCard__action {
    align-items: center;
    background: transparent;
    border: none;
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-muted);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    justify-content: center;
    padding: var(--st-spacing-1, 0.25rem);
    transition: color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-configItemCard__action:hover:not(:disabled) {
    background: var(--st-semantic-surface-hover);
    color: var(--st-semantic-text-primary);
  }

  .st-configItemCard__action--warning:hover:not(:disabled) {
    color: var(--st-semantic-feedback-warning);
  }

  .st-configItemCard__action--danger:hover:not(:disabled) {
    color: var(--st-semantic-feedback-error);
  }

  .st-configItemCard__action:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive);
    outline-offset: 2px;
  }

  .st-configItemCard__action:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
