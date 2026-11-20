<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type {
    CollaborationActor,
    ReviewComment,
    ReviewThread,
    ThreadReadState,
  } from "@sentropic/design-system-review-core";
  import type { CommentRef } from "./review-markdown.js";

  export type CommentThreadProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    thread: ReviewThread;
    currentUser: CollaborationActor;
    /** Server-side moderator override mirroring `author-or-admin` for edit/delete. */
    canModerate?: boolean;
    /** Whether replying is allowed when the thread is open. */
    canReply?: boolean;
    /** Optional host-held read state for unread comment indicators. */
    readState?: ThreadReadState | string | null;
    /** Optional display label for `thread.assignedTo` (defaults to the raw member id). */
    assigneeLabel?: string;
    /** Optional URL builder for live `authorship.runId` links. */
    runHrefBuilder?: (runId: string, comment: ReviewComment) => string;
    /** Optional URL builder for `Ref: decision:<id>` / `Ref: track:<id>` chips. */
    refHrefBuilder?: (ref: CommentRef) => string;
    class?: string;
    onReply?: (threadId: string, body: string) => void | Promise<void>;
    onResolve?: (threadId: string) => void | Promise<void>;
    onReopen?: (threadId: string) => void | Promise<void>;
    onEditComment?: (commentId: string, body: string) => void | Promise<void>;
    onDeleteComment?: (commentId: string) => void | Promise<void>;
    /** Optional re-anchor capability (hidden when absent per SPEC-r6 §2/§3). */
    onReanchor?: (threadId: string) => void | Promise<void>;
    onRunClick?: (runId: string, comment: ReviewComment) => void;
    onRefClick?: (ref: CommentRef, comment: ReviewComment) => void;
    /** Optional custom header slot. */
    header?: Snippet<[{ thread: ReviewThread }]>;
    /** Optional slot replacing the default safe markdown-lite comment body. */
    commentBody?: Snippet<[{ comment: ReviewComment }]>;
  };
</script>

<script lang="ts">
  import { CheckCircle2, ExternalLink, Link2, Pencil, RotateCcw, Trash2 } from "@lucide/svelte";
  import {
    canEditOrDeleteComment,
    getCommentStateLabel,
    isCommentUnread,
    type CommentState,
  } from "@sentropic/design-system-review-core";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import CommentAuthorship from "./CommentAuthorship.svelte";
  import CommentComposer from "./CommentComposer.svelte";
  import IconButton from "./IconButton.svelte";
  import {
    formatAnchorLabel,
    formatReviewError,
    parseCommentBody,
    type MarkdownInline,
  } from "./review-markdown.js";

  let {
    thread,
    currentUser,
    canModerate = false,
    canReply = true,
    readState = null,
    assigneeLabel,
    runHrefBuilder,
    refHrefBuilder,
    class: className,
    onReply,
    onResolve,
    onReopen,
    onEditComment,
    onDeleteComment,
    onReanchor,
    onRunClick,
    onRefClick,
    header,
    commentBody,
    ...rest
  }: CommentThreadProps = $props();

  let editingCommentId = $state<string | null>(null);
  let editInvokerEl = $state<HTMLElement | null>(null);
  let mutationError = $state<string | null>(null);
  let optimisticState = $state<CommentState | null>(null);
  let optimisticDeletedIds = $state<string[]>([]);
  let optimisticEdits = $state<Record<string, string>>({});
  let pendingAction = $state<boolean>(false);

  const effectiveState = $derived<CommentState>(optimisticState ?? thread.state);
  const stateLabel = $derived(getCommentStateLabel(effectiveState));
  const anchorExcerpt = $derived(formatAnchorLabel(thread.anchor, 140));
  const isOrphan = $derived(thread.anchor === null);

  const visibleComments = $derived(
    thread.comments
      .filter((c) => !optimisticDeletedIds.includes(c.id))
      .map((c) => {
        const editedBody = optimisticEdits[c.id];
        return editedBody !== undefined ? { ...c, body: editedBody } : c;
      }),
  );

  const resolvedLastReadAt = $derived.by(() => {
    if (readState === null || readState === undefined) return undefined;
    if (typeof readState === "string") return readState;
    if (readState instanceof Map) return readState.get(thread.threadId);
    return (readState as Readonly<Record<string, string | undefined>>)[thread.threadId];
  });

  const classes = $derived(
    [
      "st-review-thread",
      effectiveState === "closed" ? "st-review-thread--resolved" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" "),
  );

  function formatTimestamp(iso: string): string {
    const parsed = Date.parse(iso);
    if (!Number.isFinite(parsed)) return iso;
    return new Date(parsed).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function runHref(runId: string, comment: ReviewComment): string {
    return runHrefBuilder ? runHrefBuilder(runId, comment) : `#run-${encodeURIComponent(runId)}`;
  }

  function refHref(ref: CommentRef): string {
    return refHrefBuilder
      ? refHrefBuilder(ref)
      : `#${encodeURIComponent(ref.kind)}-${encodeURIComponent(ref.id)}`;
  }

  async function handleResolve() {
    if (!onResolve || pendingAction) return;
    mutationError = null;
    optimisticState = "closed";
    pendingAction = true;
    try {
      await onResolve(thread.threadId);
    } catch (err) {
      mutationError = formatReviewError(err);
    } finally {
      optimisticState = null;
      pendingAction = false;
    }
  }

  async function handleReopen() {
    if (!onReopen || pendingAction) return;
    mutationError = null;
    optimisticState = "open";
    pendingAction = true;
    try {
      await onReopen(thread.threadId);
    } catch (err) {
      mutationError = formatReviewError(err);
    } finally {
      optimisticState = null;
      pendingAction = false;
    }
  }

  async function handleReanchor() {
    if (!onReanchor || pendingAction) return;
    mutationError = null;
    pendingAction = true;
    try {
      await onReanchor(thread.threadId);
    } catch (err) {
      mutationError = formatReviewError(err);
    } finally {
      pendingAction = false;
    }
  }

  function startEdit(commentId: string, event: MouseEvent) {
    mutationError = null;
    editInvokerEl = event.currentTarget as HTMLElement | null;
    editingCommentId = commentId;
  }

  function cancelEdit() {
    editingCommentId = null;
    editInvokerEl?.focus();
    editInvokerEl = null;
  }

  async function submitEdit(commentId: string, nextBody: string) {
    if (!onEditComment) return;
    mutationError = null;
    const prev = { ...optimisticEdits };
    optimisticEdits = { ...optimisticEdits, [commentId]: nextBody };
    try {
      await onEditComment(commentId, nextBody);
      editingCommentId = null;
      editInvokerEl?.focus();
      editInvokerEl = null;
      const next = { ...optimisticEdits };
      delete next[commentId];
      optimisticEdits = next;
    } catch (err) {
      optimisticEdits = prev;
      mutationError = formatReviewError(err);
      throw err;
    }
  }

  async function handleDelete(commentId: string) {
    if (!onDeleteComment || pendingAction) return;
    mutationError = null;
    optimisticDeletedIds = [...optimisticDeletedIds, commentId];
    pendingAction = true;
    try {
      await onDeleteComment(commentId);
    } catch (err) {
      optimisticDeletedIds = optimisticDeletedIds.filter((id) => id !== commentId);
      mutationError = formatReviewError(err);
    } finally {
      pendingAction = false;
    }
  }

  async function handleReplySubmit(body: string) {
    if (!onReply) return;
    mutationError = null;
    await onReply(thread.threadId, body);
  }
</script>

{#snippet renderInlines(nodes: MarkdownInline[])}
  {#each nodes as node}
    {#if node.type === "text"}
      {node.text}
    {:else if node.type === "break"}
      <br />
    {:else if node.type === "code"}
      <code class="st-review-md__code">{node.text}</code>
    {:else if node.type === "bold"}
      <strong>{@render renderInlines(node.children)}</strong>
    {:else if node.type === "italic"}
      <em>{@render renderInlines(node.children)}</em>
    {:else if node.type === "strike"}
      <del>{@render renderInlines(node.children)}</del>
    {:else if node.type === "link"}
      <a
        class="st-review-md__link"
        href={node.href}
        target={node.external ? "_blank" : undefined}
        rel={node.external ? "noopener noreferrer" : undefined}
      >
        {node.label}
      </a>
    {/if}
  {/each}
{/snippet}

<section
  {...rest}
  class={classes}
  aria-label={`Comment thread ${thread.threadId}`}
  data-thread-id={thread.threadId}
  data-thread-state={effectiveState}
>
  {#if header}
    <header class="st-review-thread__header">
      {@render header({ thread })}
    </header>
  {:else}
    <header class="st-review-thread__header">
      <div class="st-review-thread__meta">
        <p class="st-review-thread__anchor" title={anchorExcerpt}>
          {anchorExcerpt}
        </p>
        <div class="st-review-thread__badges">
          <Badge
            size="sm"
            tone={effectiveState === "closed" ? "success" : "info"}
            class="st-review-thread__state"
          >
            {stateLabel}
          </Badge>
          {#if thread.assignedTo}
            <span class="st-review-thread__assignee">
              Assigned to {assigneeLabel ?? thread.assignedTo}
            </span>
          {/if}
        </div>
      </div>

      <div class="st-review-thread__header-actions">
        {#if isOrphan && onReanchor}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pendingAction}
            onclick={handleReanchor}
          >
            Re-anchor
          </Button>
        {/if}
        {#if effectiveState === "open" && onResolve}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pendingAction}
            onclick={handleResolve}
          >
            Resolve
          </Button>
        {:else if effectiveState === "closed" && onReopen}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pendingAction}
            onclick={handleReopen}
          >
            Reopen
          </Button>
        {/if}
      </div>
    </header>
  {/if}

  {#if mutationError}
    <div class="st-review-thread__error" role="alert">
      {mutationError}
    </div>
  {/if}

  <ol class="st-review-thread__list">
    {#each visibleComments as comment (comment.id)}
      {@const parsed = parseCommentBody(comment.body)}
      {@const canEditDelete = canEditOrDeleteComment(comment, currentUser, { canModerate })}
      {@const unread = isCommentUnread(comment, currentUser, resolvedLastReadAt)}
      {@const isEdited = comment.updatedAt !== undefined && comment.updatedAt !== comment.createdAt}
      {@const isEditing = editingCommentId === comment.id}

      <li
        class="st-review-thread__item"
        class:st-review-thread__item--unread={unread}
        class:st-review-thread__item--resolution={parsed.resolution !== null}
        data-comment-id={comment.id}
        data-unread={unread ? "true" : "false"}
        data-resolution-record={parsed.resolution !== null ? "true" : undefined}
      >
        <div class="st-review-thread__item-header">
          <CommentAuthorship
            author={comment.authorship.author}
            sponsor={comment.authorship.sponsor}
            size="sm"
          />

          <div class="st-review-thread__item-meta">
            <time class="st-review-thread__time" datetime={comment.createdAt}>
              {formatTimestamp(comment.createdAt)}
            </time>
            {#if isEdited}
              <span class="st-review-thread__edited" title={`Edited ${comment.updatedAt}`}>
                edited
              </span>
            {/if}
            {#if comment.authorship.runId}
              <a
                class="st-review-thread__run-link"
                href={runHref(comment.authorship.runId, comment)}
                onclick={(event) => {
                  if (onRunClick) {
                    event.preventDefault();
                    onRunClick(comment.authorship.runId!, comment);
                  }
                }}
              >
                <ExternalLink size={12} strokeWidth={2} aria-hidden="true" />
                <span>Run {comment.authorship.runId}</span>
              </a>
            {/if}
            {#if canEditDelete && !isEditing}
              <div class="st-review-thread__item-actions">
                {#if onEditComment}
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Edit comment"
                    disabled={pendingAction}
                    onclick={(event) => startEdit(comment.id, event)}
                  >
                    <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                  </IconButton>
                {/if}
                {#if onDeleteComment}
                  <IconButton
                    size="sm"
                    variant="danger"
                    aria-label="Delete comment"
                    disabled={pendingAction}
                    onclick={() => handleDelete(comment.id)}
                  >
                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                  </IconButton>
                {/if}
              </div>
            {/if}
          </div>
        </div>

        {#if parsed.resolution !== null}
          <div class="st-review-thread__resolution-banner">
            <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" />
            <span>Resolved in {parsed.resolution.version}</span>
          </div>
        {/if}

        {#if isEditing}
          <div class="st-review-thread__edit-form">
            <CommentComposer
              author={comment.authorship.author}
              sponsor={comment.authorship.sponsor}
              initialBody={comment.body}
              submitLabel="Save"
              cancelLabel="Cancel"
              label="Edit comment"
              autofocus={true}
              trapFocus={true}
              clearOnSubmit={false}
              onSubmit={(nextBody) => submitEdit(comment.id, nextBody)}
              onCancel={cancelEdit}
            />
          </div>
        {:else}
          <div class="st-review-thread__body">
            {#if commentBody}
              {@render commentBody({ comment })}
            {:else}
              {#each parsed.blocks as block}
                {#if block.type === "paragraph"}
                  <p class="st-review-md__p">{@render renderInlines(block.inlines)}</p>
                {:else if block.type === "codeblock"}
                  <pre class="st-review-md__pre"><code>{block.code}</code></pre>
                {:else if block.type === "blockquote"}
                  <blockquote class="st-review-md__quote">
                    {@render renderInlines(block.inlines)}
                  </blockquote>
                {:else if block.type === "list"}
                  {#if block.ordered}
                    <ol class="st-review-md__list">
                      {#each block.items as item}
                        <li>{@render renderInlines(item)}</li>
                      {/each}
                    </ol>
                  {:else}
                    <ul class="st-review-md__list">
                      {#each block.items as item}
                        <li>{@render renderInlines(item)}</li>
                      {/each}
                    </ul>
                  {/if}
                {/if}
              {/each}
            {/if}
          </div>

          {#if parsed.refs.length > 0}
            <div class="st-review-thread__refs">
              {#each parsed.refs as ref (`${ref.kind}:${ref.id}`)}
                <a
                  class="st-review-ref-chip"
                  href={refHref(ref)}
                  data-ref-kind={ref.kind}
                  data-ref-id={ref.id}
                  onclick={(event) => {
                    if (onRefClick) {
                      event.preventDefault();
                      onRefClick(ref, comment);
                    }
                  }}
                >
                  <Link2 size={12} strokeWidth={2} aria-hidden="true" />
                  <span>{ref.kind}:{ref.id}</span>
                </a>
              {/each}
            </div>
          {/if}
        {/if}
      </li>
    {/each}
  </ol>

  {#if effectiveState === "closed"}
    <div class="st-review-thread__resolved-notice">
      <span>Comment resolved. Reopen to reply.</span>
      {#if onReopen}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pendingAction}
          onclick={handleReopen}
        >
          <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
          <span>Reopen</span>
        </Button>
      {/if}
    </div>
  {:else if canReply && onReply}
    <div class="st-review-thread__reply">
      <CommentComposer
        author={currentUser}
        placeholder="Reply…"
        submitLabel="Reply"
        label="Reply to thread"
        autofocus={false}
        trapFocus={false}
        onSubmit={handleReplySubmit}
      />
    </div>
  {/if}
</section>

<style>
  .st-review-thread {
    background: var(
      --st-component-review-thread-background,
      var(--st-semantic-surface-raised, #ffffff)
    );
    border: 1px solid
      var(--st-component-review-thread-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-review-thread-radius, var(--st-radius-md, 0.5rem));
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-review-thread__header {
    align-items: flex-start;
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    padding-bottom: var(--st-spacing-2, 0.5rem);
  }

  .st-review-thread__meta {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
    min-width: 0;
  }

  .st-review-thread__anchor {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-radius: var(--st-radius-sm, 0.375rem);
    box-shadow: inset 3px 0 0 var(--st-semantic-border-interactive, #2563eb);
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0;
    overflow: hidden;
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-2, 0.5rem);
    text-overflow: ellipsis;
  }

  .st-review-thread__badges {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-review-thread__assignee {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-review-thread__header-actions {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-review-thread__error {
    background: color-mix(in srgb, var(--st-semantic-feedback-danger, #b91c1c) 10%, white);
    border: 1px solid var(--st-semantic-feedback-danger, #b91c1c);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-feedback-danger, #b91c1c);
    font-size: 0.8125rem;
    padding: var(--st-spacing-2, 0.5rem);
  }

  .st-review-thread__list {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-review-thread__item {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem);
    border-radius: var(--st-radius-sm, 0.375rem);
  }

  .st-review-thread__item--unread {
    background: color-mix(
      in srgb,
      var(--st-semantic-feedback-info, #2563eb) 6%,
      var(--st-semantic-surface-raised, #ffffff)
    );
  }

  .st-review-thread__item--resolution {
    background: color-mix(
      in srgb,
      var(--st-semantic-feedback-success, #15803d) 7%,
      var(--st-semantic-surface-raised, #ffffff)
    );
  }

  .st-review-thread__item-header {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-review-thread__item-meta {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    flex-wrap: wrap;
    font-size: 0.75rem;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-review-thread__time {
    font-variant-numeric: tabular-nums;
  }

  .st-review-thread__edited {
    font-style: italic;
  }

  .st-review-thread__run-link {
    align-items: center;
    color: var(--st-semantic-text-link, #2563eb);
    display: inline-flex;
    gap: 0.25rem;
    text-decoration: none;
  }

  .st-review-thread__run-link:hover {
    text-decoration: underline;
  }

  .st-review-thread__item-actions {
    align-items: center;
    display: inline-flex;
    gap: 0.125rem;
  }

  .st-review-thread__resolution-banner {
    align-items: center;
    color: var(--st-semantic-feedback-success, #15803d);
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 600;
    gap: 0.25rem;
  }

  .st-review-thread__body {
    display: grid;
    font-size: 0.875rem;
    gap: var(--st-spacing-2, 0.5rem);
    line-height: 1.5;
    word-break: break-word;
  }

  .st-review-md__p {
    margin: 0;
  }

  .st-review-md__code {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    border-radius: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8125rem;
    padding: 0.1rem 0.3rem;
  }

  .st-review-md__pre {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    border-radius: var(--st-radius-sm, 0.375rem);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8125rem;
    margin: 0;
    overflow-x: auto;
    padding: var(--st-spacing-2, 0.5rem);
  }

  .st-review-md__quote {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-radius: var(--st-radius-sm, 0.375rem);
    box-shadow: inset 3px 0 0 var(--st-semantic-border-strong, #94a3b8);
    color: var(--st-semantic-text-secondary);
    margin: 0;
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-2, 0.5rem);
  }

  .st-review-md__list {
    margin: 0;
    padding-inline-start: 1.25rem;
  }

  .st-review-md__link {
    color: var(--st-semantic-text-link, #2563eb);
    text-decoration: underline;
  }

  .st-review-thread__refs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-review-ref-chip {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-pill, 999px);
    color: var(--st-semantic-text-link, #2563eb);
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 600;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    text-decoration: none;
  }

  .st-review-ref-chip:hover {
    border-color: var(--st-semantic-border-interactive, #2563eb);
  }

  .st-review-thread__resolved-notice {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-secondary);
    display: flex;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }
</style>
