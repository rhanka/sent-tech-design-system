import { defineComponent, h, onUnmounted, ref, watch, type PropType } from 'vue';
import { Button } from '@sentropic/design-system-vue';
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

function normaliseIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

export const BookmarkNavigator = defineComponent({
  name: 'BookmarkNavigator',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    bookmarks: { type: Array as PropType<readonly DashboardBookmark[]>, required: true },
    selectedId: { type: String, default: undefined },
    label: { type: String, default: 'Signets' },
    previousLabel: { type: String, default: 'Précédent' },
    nextLabel: { type: String, default: 'Suivant' },
    playLabel: { type: String, default: 'Lecture' },
    pauseLabel: { type: String, default: 'Pause' },
    emptyLabel: { type: String, default: 'Aucun signet' },
    showPlaybackControls: { type: Boolean, default: true },
    autoPlay: { type: Boolean, default: false },
    intervalMs: { type: Number, default: 5000 },
    runtime: { type: Object as PropType<DashboardActionRuntime>, default: undefined },
    onBookmarkChange: {
      type: Function as PropType<(bookmark: DashboardBookmark) => void>,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const activeId = ref<string | undefined>(props.selectedId ?? props.bookmarks[0]?.id);
    const playing = ref(props.autoPlay);
    let timer: ReturnType<typeof setInterval> | undefined;

    const activeIndex = () => {
      const index = props.bookmarks.findIndex((bookmark) => bookmark.id === activeId.value);
      return index >= 0 ? index : 0;
    };

    const applyAt = (index: number) => {
      if (props.bookmarks.length === 0) return;
      const bookmark = props.bookmarks[normaliseIndex(index, props.bookmarks.length)];
      if (!bookmark) return;
      activeId.value = bookmark.id;
      applyDashboardBookmark(props.store, bookmark, props.runtime);
      props.onBookmarkChange?.(bookmark);
    };

    const clearTimer = () => {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    };

    watch(
      () => [props.selectedId, props.bookmarks.map((bookmark) => bookmark.id).join('\u0000')],
      () => {
        const nextId =
          props.selectedId ??
          (activeId.value && props.bookmarks.some((bookmark) => bookmark.id === activeId.value)
            ? activeId.value
            : props.bookmarks[0]?.id);
        activeId.value = nextId;
      },
      { immediate: true },
    );

    watch(
      () => props.autoPlay,
      () => {
        playing.value = props.autoPlay;
      },
      { immediate: true },
    );

    watch(
      () => [playing.value, props.bookmarks.length, props.intervalMs],
      () => {
        clearTimer();
        if (playing.value && props.bookmarks.length > 1) {
          timer = setInterval(() => applyAt(activeIndex() + 1), props.intervalMs);
        }
      },
      { immediate: true },
    );

    onUnmounted(clearTimer);

    return () => {
      const hasBookmarks = props.bookmarks.length > 0;
      const hasMultiple = props.bookmarks.length > 1;
      const children = hasBookmarks
        ? [
            h(
              Button,
              {
                variant: 'secondary',
                size: 'sm',
                'aria-label': props.previousLabel,
                disabled: !hasMultiple,
                onClick: () => applyAt(activeIndex() - 1),
              },
              { default: () => props.previousLabel },
            ),
            h(
              Button,
              {
                variant: 'secondary',
                size: 'sm',
                'aria-label': props.nextLabel,
                disabled: !hasMultiple,
                onClick: () => applyAt(activeIndex() + 1),
              },
              { default: () => props.nextLabel },
            ),
            props.showPlaybackControls
              ? h(
                  Button,
                  {
                    variant: 'ghost',
                    size: 'sm',
                    'aria-label': playing.value ? props.pauseLabel : props.playLabel,
                    disabled: !hasMultiple,
                    onClick: () => {
                      playing.value = !playing.value;
                    },
                  },
                  { default: () => (playing.value ? props.pauseLabel : props.playLabel) },
                )
              : undefined,
            ...props.bookmarks.map((bookmark, index) =>
              h(
                Button,
                {
                  key: bookmark.id,
                  variant: bookmark.id === activeId.value ? 'primary' : 'secondary',
                  size: 'sm',
                  'aria-label': bookmark.label,
                  'aria-pressed': bookmark.id === activeId.value,
                  onClick: () => applyAt(index),
                },
                { default: () => bookmark.label },
              ),
            ),
          ]
        : [h('span', props.emptyLabel)];
      return h('div', { role: 'group', 'aria-label': props.label, class: props.class }, children);
    };
  },
});
