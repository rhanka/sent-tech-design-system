<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";
  import type {
    CollaborationActor,
    ReviewThread,
    ThreadReadState,
  } from "@sentropic/design-system-review-core";

  export type OrphanListProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    threads: readonly ReviewThread[];
    currentUser: CollaborationActor;
    readState?: ThreadReadState | null;
    heading?: string;
    class?: string;
    onSelect?: (threadId: string) => void;
    /** Optional re-anchor action; button is hidden when unbound (SPEC-r6 §2, §3). */
    onReanchor?: (threadId: string) => void | Promise<void>;
    onResolve?: (threadId: string) => void | Promise<void>;
    onReopen?: (threadId: string) => void | Promise<void>;
  };
</script>

<script lang="ts">
  import { Unlink } from "@lucide/svelte";
  import {
    getCommentStateLabel,
    isUnread,
  } from "@sentropic/design-system-review-core";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import CommentAuthorship from "./CommentAuthorship.svelte";
  import EmptyState from "./EmptyState.svelte";
  import { formatAnchorLabel, formatReviewError } from "./review-markdown.js";

  let {
    threads,
    currentUser,
    readState = null,
    heading = "No longer attached",
    class: className,
    onSelect,
    onReanchor,
    onResolve,
    onReopen,
    ...rest
  }: OrphanListProps = $props();

  let actionError = $state<string | null>(null);
  let pendingId = $state<string | null>(null);

  const headingId = `st-review-orphans-heading-${Math.random().toString(36).slice(2, 9)}`;
  const classes = $derived(["st-review-orphans", className].filter(Boolean).join(" "));

  async function runThreadAction(
    threadId: string,
    fn: ((id: string) => void | Promise<void>) | undefined,
  ) {
    if (!fn || pendingId !== null) return;
    actionError = null;
    pendingId = threadId;
    try {
      await fn(threadId);
    } catch (err) {
      actionError = formatReviewError(err);
    } finally {
      pendingId = null;
    }
  }
</script>

<section {...rest} class={classes} aria-labelledby={headingId}>
  <header class="st-review-orphans__header">
    <h3 id={headingId} class="st-review-orphans__heading">
      <Unlink size={14} strokeWidth={2} aria-hidden="true" />
      <span>{heading}</span>
    </h3>
    <Badge size="sm" tone="warning" class="st-review-orphans__count">
      {threads.length}
    </Badge>
  </header>

  {#if actionError}
    <div class="st-review-orphans__error" role="alert">
      {actionError}
    </div>
  {/if}

  {#if threads.length === 0}
    <EmptyState
      title="No unattached threads"
      message="All comment threads are currently anchored to the document."
    />
  {:else}
    <ul class="st-review-orphans__list">
      {#each threads as thread (thread.threadId)}
        {@const rootComment = thread.comments[0]}
        {@const unread = isUnread(thread, currentUser, readState)}
        {@const stateLabel = getCommentStateLabel(thread.state)}
        {@const excerpt =
          thread.anchor !== null
            ? formatAnchorLabel(thread.anchor, 100)
            : "Original location removed"}

        <li
          class="st-review-orphans__item"
          class:st-review-orphans__item--unread={unread}
          data-thread-id={thread.threadId}
          data-thread-state={thread.state}
          data-unread={unread ? "true" : "false"}
        >
          <div class="st-review-orphans__item-top">
            {#if rootComment}
              <CommentAuthorship
                author={rootComment.authorship.author}
                sponsor={rootComment.authorship.sponsor}
                size="sm"
              />
            {/if}
            <Badge
              size="sm"
              tone={thread.state === "closed" ? "success" : "info"}
            >
              {stateLabel}
            </Badge>
          </div>

          <p class="st-review-orphans__excerpt">{excerpt}</p>

          {#if rootComment}
            <p class="st-review-orphans__preview">{rootComment.body}</p>
          {/if}

          <div class="st-review-orphans__actions">
            {#if onSelect}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label={`Open thread ${thread.threadId}`}
                onclick={() => onSelect(thread.threadId)}
              >
                Open ({thread.comments.length})
              </Button>
            {/if}
            {#if onReanchor}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pendingId === thread.threadId}
                onclick={() => runThreadAction(thread.threadId, onReanchor)}
              >
                Re-anchor
              </Button>
            {/if}
            {#if thread.state === "open" && onResolve}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pendingId === thread.threadId}
                onclick={() => runThreadAction(thread.threadId, onResolve)}
              >
                Resolve
              </Button>
            {:else if thread.state === "closed" && onReopen}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pendingId === thread.threadId}
                onclick={() => runThreadAction(thread.threadId, onReopen)}
              >
                Reopen
              </Button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .st-review-orphans {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-review-orphans__header {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-review-orphans__heading {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: var(--st-spacing-1, 0.25rem);
    margin: 0;
  }

  .st-review-orphans__error {
    background: color-mix(in srgb, var(--st-semantic-feedback-danger, #b91c1c) 10%, white);
    border: 1px solid var(--st-semantic-feedback-danger, #b91c1c);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-feedback-danger, #b91c1c);
    font-size: 0.8125rem;
    padding: var(--st-spacing-2, 0.5rem);
  }

  .st-review-orphans__list {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-review-orphans__item {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-review-orphans__item--unread {
    border-color: var(--st-semantic-border-interactive, #2563eb);
  }

  .st-review-orphans__item-top {
    align-items: flex-start;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-review-orphans__excerpt {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-style: italic;
    margin: 0;
  }

  .st-review-orphans__preview {
    color: var(--st-semantic-text-primary);
    font-size: 0.8125rem;
    line-height: 1.45;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-review-orphans__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1, 0.25rem);
  }
</style>
