<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type {
    CollaborationActor,
    ReviewComment,
    ReviewThread,
    ThreadFilter,
    ThreadReadState,
  } from "@sentropic/design-system-review-core";

  export type ThreadPanelProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Attached threads (or full thread list when `orphaned` is a subset). */
    threads: readonly ReviewThread[];
    /** Unattached/orphaned threads rendered in `OrphanList` and counted in the header. */
    orphaned?: readonly ReviewThread[];
    currentUser: CollaborationActor;
    activeThreadId?: string | null;
    /** Active filter (`"all" | "open" | "resolved" | "mine"`). */
    filter?: ThreadFilter;
    /** Controls visibility of the panel / <48rem bottom sheet (default `true`). */
    open?: boolean;
    readState?: ThreadReadState | null;
    canModerate?: boolean;
    title?: string;
    /**
     * Explicit compact (<48rem bottom-sheet `Drawer`) override.
     * When omitted, tracks `window.matchMedia("(max-width: 47.999rem)")`.
     */
    compact?: boolean;
    class?: string;
    onSelect?: (threadId: string | null) => void;
    onFilterChange?: (filter: ThreadFilter) => void;
    onClose?: () => void;
    onReply?: (threadId: string, body: string) => void | Promise<void>;
    onResolve?: (threadId: string) => void | Promise<void>;
    onReopen?: (threadId: string) => void | Promise<void>;
    onEditComment?: (commentId: string, body: string) => void | Promise<void>;
    onDeleteComment?: (commentId: string) => void | Promise<void>;
    onReanchor?: (threadId: string) => void | Promise<void>;
    onMarkRead?: (threadId: string) => void;
    headerActions?: Snippet;
    commentBody?: Snippet<[{ comment: ReviewComment }]>;
  };
</script>

<script lang="ts">
  import { tick, untrack } from "svelte";
  import { ArrowLeft, X } from "@lucide/svelte";
  import {
    countThreadsByFilter,
    countUnreadThreads,
    filterThreads,
    getCommentStateLabel,
    isUnread,
  } from "@sentropic/design-system-review-core";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import CommentAuthorship from "./CommentAuthorship.svelte";
  import CommentThread from "./CommentThread.svelte";
  import Drawer from "./Drawer.svelte";
  import EmptyState from "./EmptyState.svelte";
  import IconButton from "./IconButton.svelte";
  import OrphanList from "./OrphanList.svelte";
  import { formatAnchorLabel } from "./review-markdown.js";

  const COMPACT_MEDIA_QUERY = "(max-width: 47.999rem)";
  const FILTER_OPTIONS: ReadonlyArray<{ id: ThreadFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "resolved", label: "Resolved" },
    { id: "mine", label: "Mine" },
  ];

  let {
    threads,
    orphaned = [],
    currentUser,
    activeThreadId = null,
    filter,
    open = true,
    readState = null,
    canModerate = false,
    title = "Comments",
    compact,
    class: className,
    onSelect,
    onFilterChange,
    onClose,
    onReply,
    onResolve,
    onReopen,
    onEditComment,
    onDeleteComment,
    onReanchor,
    onMarkRead,
    headerActions,
    commentBody,
    ...rest
  }: ThreadPanelProps = $props();

  let asideEl: HTMLElement | undefined = $state();
  let headingEl: HTMLHeadingElement | undefined = $state();
  let compactContainerEl: HTMLElement | undefined = $state();
  let mediaCompact = $state(false);
  let localFilter = $state<ThreadFilter>(untrack(() => filter ?? "all"));
  let liveAnnouncement = $state("");
  let prevActiveId: string | null = untrack(() => activeThreadId);

  const isCompact = $derived(compact ?? mediaCompact);
  const effectiveFilter = $derived<ThreadFilter>(filter ?? localFilter);

  const orphanIds = $derived(new Set(orphaned.map((t) => t.threadId)));
  const attachedOnly = $derived(threads.filter((t) => !orphanIds.has(t.threadId)));

  const allThreads = $derived.by<ReviewThread[]>(() => {
    const seen = new Set<string>();
    const combined: ReviewThread[] = [];
    for (const t of threads) {
      if (!seen.has(t.threadId)) {
        seen.add(t.threadId);
        combined.push(t);
      }
    }
    for (const o of orphaned) {
      if (!seen.has(o.threadId)) {
        seen.add(o.threadId);
        combined.push(o);
      }
    }
    return combined;
  });

  const filterCounts = $derived(countThreadsByFilter(allThreads, currentUser));
  const unreadTotal = $derived(countUnreadThreads(allThreads, currentUser, readState));
  const filteredAttached = $derived(filterThreads(attachedOnly, effectiveFilter, currentUser));
  const filteredOrphaned = $derived(filterThreads(orphaned, effectiveFilter, currentUser));
  const activeThread = $derived(
    activeThreadId !== null && activeThreadId !== undefined
      ? allThreads.find((t) => t.threadId === activeThreadId) ?? null
      : null,
  );

  // Track <48rem breakpoint when `compact` prop is not explicitly controlled.
  $effect(() => {
    if (compact !== undefined || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(COMPACT_MEDIA_QUERY);
    mediaCompact = mql.matches;
    const onChange = (event: MediaQueryListEvent) => {
      mediaCompact = event.matches;
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  });

  function resolvePanelHeading(): HTMLElement | null {
    if (headingEl) return headingEl;
    return (
      compactContainerEl
        ?.closest(".st-drawer")
        ?.querySelector<HTMLElement>(".st-drawer__title") ?? null
    );
  }

  // Focus panel heading when transitioning to a newly selected thread in both >=48rem aside
  // and <48rem bottom sheet (SPEC-r6 §3).
  $effect(() => {
    const nextId = activeThreadId ?? null;
    const isOpen = open;
    // Track container bindings so heading focus runs once the active surface mounts.
    void headingEl;
    void compactContainerEl;
    if (isOpen && nextId !== null && nextId !== prevActiveId) {
      void tick().then(() => {
        resolvePanelHeading()?.focus();
      });
    }
    prevActiveId = nextId;
  });

  // Element-scoped Escape on non-modal >=48rem <aside> (never pre-empts an inner composer/popover).
  $effect(() => {
    const node = asideEl;
    if (!node || isCompact || !open) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (activeThreadId !== null && activeThreadId !== undefined) {
        onSelect?.(null);
      } else {
        onClose?.();
      }
    };
    node.addEventListener("keydown", onKeydown);
    return () => node.removeEventListener("keydown", onKeydown);
  });

  function selectFilter(next: ThreadFilter) {
    localFilter = next;
    onFilterChange?.(next);
  }

  function handleSelectThread(threadId: string) {
    onSelect?.(threadId);
    onMarkRead?.(threadId);
  }

  async function handleResolveWithLive(threadId: string) {
    if (!onResolve) return;
    await onResolve(threadId);
    liveAnnouncement = "Thread resolved.";
  }

  async function handleReopenWithLive(threadId: string) {
    if (!onReopen) return;
    await onReopen(threadId);
    liveAnnouncement = "Thread reopened.";
  }

  async function handleReplyWithLive(threadId: string, body: string) {
    if (!onReply) return;
    await onReply(threadId, body);
    liveAnnouncement = "Reply posted.";
  }

  const classes = $derived(["st-review-panel", className].filter(Boolean).join(" "));
</script>

{#snippet panelBody()}
  <div class="st-review-panel__filters" role="group" aria-label="Filter comment threads">
    {#each FILTER_OPTIONS as option (option.id)}
      {@const count = filterCounts[option.id]}
      {@const selected = effectiveFilter === option.id}
      <button
        type="button"
        class="st-review-panel__filter-tab"
        class:st-review-panel__filter-tab--active={selected}
        aria-pressed={selected ? "true" : "false"}
        onclick={() => selectFilter(option.id)}
      >
        <span>{option.label}</span>
        <span class="st-review-panel__filter-count">{count}</span>
      </button>
    {/each}
  </div>

  <div class="st-review-panel__content">
    {#if activeThread}
      <div class="st-review-panel__detail">
        <div class="st-review-panel__back-row">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onclick={() => onSelect?.(null)}
          >
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            <span>All threads</span>
          </Button>
        </div>

        <CommentThread
          thread={activeThread}
          {currentUser}
          {canModerate}
          {readState}
          onReply={onReply ? handleReplyWithLive : undefined}
          onResolve={onResolve ? handleResolveWithLive : undefined}
          onReopen={onReopen ? handleReopenWithLive : undefined}
          {onEditComment}
          {onDeleteComment}
          {onReanchor}
          {commentBody}
        />
      </div>
    {:else if filteredAttached.length === 0 && filteredOrphaned.length === 0}
      <EmptyState
        title="No matching threads"
        message={effectiveFilter === "all"
          ? "Select text or click an element in Review mode to start a thread."
          : `No threads match the "${effectiveFilter}" filter.`}
      />
    {:else}
      {#if filteredAttached.length > 0}
        <ul class="st-review-panel__list">
          {#each filteredAttached as thread (thread.threadId)}
            {@const rootComment = thread.comments[0]}
            {@const unread = isUnread(thread, currentUser, readState)}
            {@const stateLabel = getCommentStateLabel(thread.state)}
            {@const excerpt = formatAnchorLabel(thread.anchor, 100)}
            <li>
              <button
                type="button"
                class="st-review-panel__thread-card"
                class:st-review-panel__thread-card--unread={unread}
                class:st-review-panel__thread-card--resolved={thread.state === "closed"}
                data-thread-id={thread.threadId}
                data-thread-state={thread.state}
                data-unread={unread ? "true" : "false"}
                onclick={() => handleSelectThread(thread.threadId)}
              >
                <div class="st-review-panel__card-top">
                  {#if rootComment}
                    <CommentAuthorship
                      author={rootComment.authorship.author}
                      sponsor={rootComment.authorship.sponsor}
                      size="sm"
                    />
                  {/if}
                  <div class="st-review-panel__card-badges">
                    {#if unread}
                      <span
                        class="st-review-panel__unread-dot"
                        aria-label="Unread"
                      ></span>
                    {/if}
                    <Badge
                      size="sm"
                      tone={thread.state === "closed" ? "success" : "info"}
                    >
                      {stateLabel}
                    </Badge>
                  </div>
                </div>

                <span class="st-review-panel__card-anchor">{excerpt}</span>

                {#if rootComment}
                  <span class="st-review-panel__card-preview">{rootComment.body}</span>
                {/if}

                <span class="st-review-panel__card-count">
                  {thread.comments.length} {thread.comments.length === 1 ? "comment" : "comments"}
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if filteredOrphaned.length > 0}
        <OrphanList
          threads={filteredOrphaned}
          {currentUser}
          {readState}
          onSelect={handleSelectThread}
          onResolve={onResolve ? handleResolveWithLive : undefined}
          onReopen={onReopen ? handleReopenWithLive : undefined}
          {onReanchor}
        />
      {/if}
    {/if}
  </div>

  <div class="st-review-panel__sr-live" aria-live="polite" aria-atomic="true">
    {liveAnnouncement}
  </div>
{/snippet}

{#if isCompact}
  <!-- <48rem: modal bottom sheet via Drawer side="bottom" (the only use of Drawer in the kit). -->
  <Drawer
    {open}
    side="bottom"
    {title}
    class={className}
    onclose={() => onClose?.()}
  >
    <div bind:this={compactContainerEl} class="st-review-panel__compact-meta">
      {#if unreadTotal > 0}
        <Badge size="sm" tone="info" class="st-review-panel__unread-count">
          {unreadTotal} unread
        </Badge>
      {/if}
      {#if orphaned.length > 0}
        <Badge size="sm" tone="warning" class="st-review-panel__orphan-count">
          {orphaned.length} unattached
        </Badge>
      {/if}
      {#if headerActions}
        <div class="st-review-panel__header-actions">
          {@render headerActions()}
        </div>
      {/if}
    </div>
    {@render panelBody()}
  </Drawer>
{:else if open}
  <!-- >=48rem: non-modal anchored <aside> (22-26rem, no scrim, no aria-modal, no outside-click close). -->
  <aside
    {...rest}
    bind:this={asideEl}
    class={classes}
    aria-label={title}
  >
    <header class="st-review-panel__header">
      <div class="st-review-panel__title-group">
        <h2
          bind:this={headingEl}
          tabindex="-1"
          class="st-review-panel__heading"
        >
          {title}
        </h2>
        {#if unreadTotal > 0}
          <Badge size="sm" tone="info" class="st-review-panel__unread-count">
            {unreadTotal} unread
          </Badge>
        {/if}
        {#if orphaned.length > 0}
          <Badge size="sm" tone="warning" class="st-review-panel__orphan-count">
            {orphaned.length} unattached
          </Badge>
        {/if}
      </div>

      <div class="st-review-panel__header-actions">
        {#if headerActions}
          {@render headerActions()}
        {/if}
        {#if onClose}
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Close comments panel"
            onclick={() => onClose()}
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </IconButton>
        {/if}
      </div>
    </header>

    {@render panelBody()}
  </aside>
{/if}

<style>
  /* >=48rem non-modal anchored aside (22-26rem wide, no scrim, pins stay interactive). */
  .st-review-panel {
    background: var(
      --st-component-review-panel-background,
      var(--st-semantic-surface-raised, #ffffff)
    );
    border: 1px solid
      var(--st-component-review-panel-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-review-panel-radius, var(--st-radius-md, 0.5rem));
    color: var(--st-semantic-text-primary);
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    grid-template-rows: auto auto 1fr;
    max-width: var(--st-component-review-panel-maxWidth, 26rem);
    min-width: var(--st-component-review-panel-minWidth, 22rem);
    padding: var(--st-spacing-4, 1rem);
    width: var(--st-component-review-panel-width, 24rem);
  }

  .st-review-panel__header {
    align-items: center;
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    padding-bottom: var(--st-spacing-2, 0.5rem);
  }

  .st-review-panel__title-group {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    min-width: 0;
  }

  .st-review-panel__heading {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }

  .st-review-panel__heading:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 2px;
  }

  .st-review-panel__header-actions {
    align-items: center;
    display: inline-flex;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-review-panel__compact-meta {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    margin-bottom: var(--st-spacing-2, 0.5rem);
  }

  .st-review-panel__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-review-panel__filter-tab {
    align-items: center;
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-pill, 999px);
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
  }

  .st-review-panel__filter-tab--active {
    background: var(--st-semantic-action-primary, #2563eb);
    border-color: var(--st-semantic-action-primary, #2563eb);
    color: var(--st-semantic-action-primaryText, #ffffff);
  }

  .st-review-panel__filter-tab:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 2px;
  }

  .st-review-panel__filter-count {
    font-variant-numeric: tabular-nums;
    opacity: 0.85;
  }

  .st-review-panel__content {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    min-height: 0;
    overflow: auto;
  }

  .st-review-panel__detail {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-review-panel__back-row {
    display: flex;
    justify-content: flex-start;
  }

  .st-review-panel__list {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-review-panel__thread-card {
    background: var(--st-semantic-surface-default, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: grid;
    font: inherit;
    gap: var(--st-spacing-1, 0.25rem);
    padding: var(--st-spacing-3, 0.75rem);
    text-align: start;
    width: 100%;
  }

  .st-review-panel__thread-card:hover {
    border-color: var(--st-semantic-border-strong, #94a3b8);
  }

  .st-review-panel__thread-card:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 2px;
  }

  .st-review-panel__thread-card--unread {
    border-color: var(--st-semantic-border-interactive, #2563eb);
  }

  .st-review-panel__thread-card--resolved {
    opacity: 0.75;
  }

  .st-review-panel__card-top {
    align-items: flex-start;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-review-panel__card-badges {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-review-panel__unread-dot {
    background: var(--st-component-review-unreadDot, var(--st-semantic-feedback-info, #2563eb));
    border-radius: 999px;
    display: inline-block;
    height: 0.5rem;
    width: 0.5rem;
  }

  .st-review-panel__card-anchor {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-review-panel__card-preview {
    font-size: 0.8125rem;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-review-panel__card-count {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .st-review-panel__sr-live {
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
