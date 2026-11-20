import { useEffect, useState } from 'preact/hooks';
import { Button } from '@sentropic/design-system-preact';
import {
  applyDashboardBookmark,
  type DashboardActionRuntime,
  type DashboardBookmark,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useValue, type MaybeSignal } from '../signals.js';

export type BookmarkNavigatorProps = {
  store: DashboardStore;
  bookmarks: readonly DashboardBookmark[];
  selectedId?: MaybeSignal<string>;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  playLabel?: string;
  pauseLabel?: string;
  emptyLabel?: string;
  showPlaybackControls?: MaybeSignal<boolean>;
  autoPlay?: MaybeSignal<boolean>;
  intervalMs?: number;
  runtime?: DashboardActionRuntime;
  onBookmarkChange?: (bookmark: DashboardBookmark) => void;
  className?: MaybeSignal<string>;
};

function normaliseIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function activeIndex(bookmarks: readonly DashboardBookmark[], activeId: string | undefined): number {
  const index = bookmarks.findIndex((bookmark) => bookmark.id === activeId);
  return index >= 0 ? index : 0;
}

export function BookmarkNavigator({
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
  className,
}: BookmarkNavigatorProps) {
  const resolvedSelectedId = useValue(selectedId);
  const resolvedShowPlaybackControls = useValue(showPlaybackControls);
  const resolvedAutoPlay = useValue(autoPlay);
  const resolvedClassName = useValue(className);

  const [activeId, setActiveId] = useState<string | undefined>(
    () => resolvedSelectedId ?? bookmarks[0]?.id,
  );
  const [playing, setPlaying] = useState(resolvedAutoPlay);

  useEffect(() => {
    setPlaying(resolvedAutoPlay);
  }, [resolvedAutoPlay]);

  useEffect(() => {
    setActiveId((current) => {
      if (resolvedSelectedId !== undefined) return resolvedSelectedId;
      if (current && bookmarks.some((bookmark) => bookmark.id === current)) return current;
      return bookmarks[0]?.id;
    });
  }, [bookmarks, resolvedSelectedId]);

  const applyAt = (index: number) => {
    if (bookmarks.length === 0) return;
    const bookmark = bookmarks[normaliseIndex(index, bookmarks.length)]!;
    setActiveId(bookmark.id);
    applyDashboardBookmark(store, bookmark, runtime);
    onBookmarkChange?.(bookmark);
  };

  useEffect(() => {
    if (!playing || bookmarks.length < 2) return undefined;
    const timer = setInterval(() => {
      const index = activeIndex(bookmarks, activeId) + 1;
      applyAt(index);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [activeId, bookmarks, intervalMs, playing]);

  const currentIndex = activeIndex(bookmarks, activeId);
  const hasBookmarks = bookmarks.length > 0;
  const hasMultiple = bookmarks.length > 1;

  return (
    <div role="group" aria-label={label} className={resolvedClassName}>
      {!hasBookmarks ? <span>{emptyLabel}</span> : null}
      {hasBookmarks ? (
        <>
          <Button
            variant="secondary"
            size="sm"
            aria-label={previousLabel}
            disabled={!hasMultiple}
            onClick={() => applyAt(currentIndex - 1)}
          >
            {previousLabel}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label={nextLabel}
            disabled={!hasMultiple}
            onClick={() => applyAt(currentIndex + 1)}
          >
            {nextLabel}
          </Button>
          {resolvedShowPlaybackControls ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label={playing ? pauseLabel : playLabel}
              disabled={!hasMultiple}
              onClick={() => setPlaying((value) => !value)}
            >
              {playing ? pauseLabel : playLabel}
            </Button>
          ) : null}
          {bookmarks.map((bookmark) => (
            <Button
              key={bookmark.id}
              variant={bookmark.id === activeId ? 'primary' : 'secondary'}
              size="sm"
              aria-label={bookmark.label}
              aria-pressed={bookmark.id === activeId}
              onClick={() => applyAt(bookmarks.indexOf(bookmark))}
            >
              {bookmark.label}
            </Button>
          ))}
        </>
      ) : null}
    </div>
  );
}
