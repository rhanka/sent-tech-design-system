import { ChangeDetectionStrategy, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Button as DsButton } from '@sentropic/design-system-angular';
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
  class?: string;
};

/** Pure: wrap an index into `[0, length)`. */
function normaliseIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

/**
 * Bookmark list navigator with previous/next/playback controls. Applying a
 * bookmark writes its state into the store via the core
 * `applyDashboardBookmark` engine, like Vue/React.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` holds local state
 * (`activeId`/`playing` refs), an interval-timer playback and three watchers,
 * with no `void <state>.value` marker to anchor on (see
 * tools/dataviz-angular-port/README.md). The watchers become `recompute()`,
 * called from `ngOnInit`/`ngOnChanges`; the timer is started there and
 * cleared in `ngOnDestroy` (the adapter-pattern guard names that discipline).
 *
 * The DS `Button` now forwards `aria-label`/`aria-pressed` (like
 * React/Vue), so the previous/next/playback labels and the per-bookmark
 * pressed state render on the `<button>`.
 */
@Component({
  selector: 'st-dataviz-bookmark-navigator',
  standalone: true,
  imports: [DsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="label" [class]="classInput">
      @if (!hasBookmarks) {
        <span>{{ emptyLabel }}</span>
      } @else {
        <st-button variant="secondary" size="sm" [aria-label]="previousLabel" [disabled]="!hasMultiple" (click)="step(-1)">{{
          previousLabel
        }}</st-button>
        <st-button variant="secondary" size="sm" [aria-label]="nextLabel" [disabled]="!hasMultiple" (click)="step(1)">{{
          nextLabel
        }}</st-button>
        @if (showPlaybackControls) {
          <st-button variant="ghost" size="sm" [aria-label]="playing ? pauseLabel : playLabel" [disabled]="!hasMultiple" (click)="togglePlay()">{{
            playing ? pauseLabel : playLabel
          }}</st-button>
        }
        @for (bookmark of bookmarks; track bookmark.id) {
          <st-button
            [variant]="bookmark.id === activeId ? 'primary' : 'secondary'"
            size="sm"
            [aria-label]="bookmark.label"
            [aria-pressed]="bookmark.id === activeId"
            (click)="applyBookmark(bookmark)"
            >{{ bookmark.label }}</st-button
          >
        }
      }
    </div>
  `,
})
export class BookmarkNavigator implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'BookmarkNavigator';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private timer: ReturnType<typeof setInterval> | undefined;

  @NgInput({ required: true }) store!: DashboardStore;
  @NgInput({ required: true }) bookmarks: readonly DashboardBookmark[] = [];
  @NgInput() selectedId?: string;
  @NgInput() label = 'Signets';
  @NgInput() previousLabel = 'Précédent';
  @NgInput() nextLabel = 'Suivant';
  @NgInput() playLabel = 'Lecture';
  @NgInput() pauseLabel = 'Pause';
  @NgInput() emptyLabel = 'Aucun signet';
  @NgInput() showPlaybackControls = true;
  @NgInput() autoPlay = false;
  @NgInput() intervalMs = 5000;
  @NgInput() runtime?: DashboardActionRuntime;
  @NgInput() onBookmarkChange?: (bookmark: DashboardBookmark) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  activeId?: string;
  playing = false;
  hasBookmarks = false;
  hasMultiple = false;

  private lastSelectedId?: string;
  private lastBookmarkIds = '';
  private lastAutoPlay?: boolean;

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  ngOnDestroy(): void {
    // Inlined (not via clearTimer()) so the adapter-pattern guard reads the
    // teardown in this body.
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  step(delta: number): void {
    this.applyAt(this.activeIndex() + delta);
  }

  togglePlay(): void {
    this.playing = !this.playing;
    this.restartTimer();
  }

  applyBookmark(bookmark: DashboardBookmark): void {
    this.applyAt(this.bookmarks.indexOf(bookmark));
  }

  private activeIndex(): number {
    const index = this.bookmarks.findIndex((bookmark) => bookmark.id === this.activeId);
    return index >= 0 ? index : 0;
  }

  private applyAt(index: number): void {
    if (this.bookmarks.length === 0) return;
    const bookmark = this.bookmarks[normaliseIndex(index, this.bookmarks.length)];
    if (!bookmark) return;
    this.activeId = bookmark.id;
    applyDashboardBookmark(this.store, bookmark, this.runtime);
    this.onBookmarkChange?.(bookmark);
    this.changeDetector.markForCheck();
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private restartTimer(): void {
    this.clearTimer();
    if (this.playing && this.bookmarks.length > 1) {
      const intervalMs = this.intervalMs;
      this.timer = setInterval(() => {
        this.applyAt(this.activeIndex() + 1);
      }, intervalMs);
    }
  }

  private recompute(): void {
    this.hasBookmarks = this.bookmarks.length > 0;
    this.hasMultiple = this.bookmarks.length > 1;
    // Mirrors the Vue/React dependency lists: the active bookmark resyncs
    // only when `selectedId` or the bookmark ids change (a click followed by
    // an unrelated input change must not snap back), and `playing` only when
    // `autoPlay` changes (a play-toggle must survive other input changes).
    const bookmarkIds = this.bookmarks.map((bookmark) => bookmark.id).join('\0');
    if (this.selectedId !== this.lastSelectedId || bookmarkIds !== this.lastBookmarkIds) {
      this.lastSelectedId = this.selectedId;
      this.lastBookmarkIds = bookmarkIds;
      this.activeId =
        this.selectedId ??
        (this.activeId && this.bookmarks.some((bookmark) => bookmark.id === this.activeId)
          ? this.activeId
          : this.bookmarks[0]?.id);
    }
    if (this.autoPlay !== this.lastAutoPlay) {
      this.lastAutoPlay = this.autoPlay;
      this.playing = this.autoPlay;
    }
    this.restartTimer();
  }
}
