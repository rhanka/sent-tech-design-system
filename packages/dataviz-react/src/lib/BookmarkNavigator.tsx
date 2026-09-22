import { useEffect, useState } from 'react';
import { Button } from '@sentropic/design-system-react';
import {
  applyDashboardBookmark,
  type DashboardActionRuntime,
  type DashboardBookmark,
  type DashboardStore,
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
  className?: string;
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
  const [activeId, setActiveId] = useState<string | undefined>(
    () => selectedId ?? bookmarks[0]?.id,
  );
  const [playing, setPlaying] = useState(autoPlay);

  useEffect(() => {
    setPlaying(autoPlay);
  }, [autoPlay]);

  useEffect(() => {
    setActiveId((current) => {
      if (selectedId !== undefined) return selectedId;
      if (current && bookmarks.some((bookmark) => bookmark.id === current)) return current;
      return bookmarks[0]?.id;
    });
  }, [bookmarks, selectedId]);

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
    <div role="group" aria-label={label} className={className}>
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
          {showPlaybackControls ? (
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
