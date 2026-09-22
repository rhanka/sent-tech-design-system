<script lang="ts" module>
  import type {
    DashboardActionRuntime,
    DashboardBookmark,
    DashboardStore,
  } from '@sentropic/dataviz-core';

  export type BookmarkNavigatorProps = {
    store: DashboardStore;
    bookmarks: readonly DashboardBookmark[];
    selectedId?: string;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    playLabel?: string;
    pauseLabel?: string;
    emptyLabel?: string;
    showPlaybackControls?: boolean;
    autoPlay?: boolean;
    intervalMs?: number;
    runtime?: DashboardActionRuntime;
    onBookmarkChange?: (bookmark: DashboardBookmark) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { Button } from '@sentropic/design-system-svelte';
  import { applyDashboardBookmark } from '@sentropic/dataviz-core';

  let {
    store,
    bookmarks,
    selectedId,
    label = 'Signets',
    previousLabel = 'Précédent',
    nextLabel = 'Suivant',
    playLabel = 'Lecture',
    pauseLabel = 'Pause',
    emptyLabel = 'Aucun signet',
    showPlaybackControls = true,
    autoPlay = false,
    intervalMs = 5000,
    runtime,
    onBookmarkChange,
    class: className,
  }: BookmarkNavigatorProps = $props();

  let activeId = $state<string | undefined>();
  let playing = $state(false);

  function normaliseIndex(index: number, length: number): number {
    return ((index % length) + length) % length;
  }

  function activeIndex(): number {
    const index = bookmarks.findIndex((bookmark) => bookmark.id === activeId);
    return index >= 0 ? index : 0;
  }

  function applyAt(index: number) {
    if (bookmarks.length === 0) return;
    const bookmark = bookmarks[normaliseIndex(index, bookmarks.length)];
    if (!bookmark) return;
    activeId = bookmark.id;
    applyDashboardBookmark(store, bookmark, runtime);
    onBookmarkChange?.(bookmark);
  }

  $effect(() => {
    playing = autoPlay;
  });

  $effect(() => {
    const nextId =
      selectedId ?? (activeId && bookmarks.some((bookmark) => bookmark.id === activeId)
        ? activeId
        : bookmarks[0]?.id);
    if (activeId !== nextId) activeId = nextId;
  });

  $effect(() => {
    if (!playing || bookmarks.length < 2) return;
    const timer = setInterval(() => applyAt(activeIndex() + 1), intervalMs);
    return () => clearInterval(timer);
  });
</script>

<div role="group" aria-label={label} class={className}>
  {#if bookmarks.length === 0}
    <span>{emptyLabel}</span>
  {:else}
    <Button
      variant="secondary"
      size="sm"
      aria-label={previousLabel}
      disabled={bookmarks.length < 2}
      onclick={() => applyAt(activeIndex() - 1)}
    >
      {previousLabel}
    </Button>
    <Button
      variant="secondary"
      size="sm"
      aria-label={nextLabel}
      disabled={bookmarks.length < 2}
      onclick={() => applyAt(activeIndex() + 1)}
    >
      {nextLabel}
    </Button>
    {#if showPlaybackControls}
      <Button
        variant="ghost"
        size="sm"
        aria-label={playing ? pauseLabel : playLabel}
        disabled={bookmarks.length < 2}
        onclick={() => {
          playing = !playing;
        }}
      >
        {playing ? pauseLabel : playLabel}
      </Button>
    {/if}
    {#each bookmarks as bookmark, index (bookmark.id)}
      <Button
        variant={bookmark.id === activeId ? 'primary' : 'secondary'}
        size="sm"
        aria-label={bookmark.label}
        aria-pressed={bookmark.id === activeId}
        onclick={() => applyAt(index)}
      >
        {bookmark.label}
      </Button>
    {/each}
  {/if}
</div>
