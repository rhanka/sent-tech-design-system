/**
 * useUrlSync — Svelte 5 binding that keeps a dashboard store and the URL query
 * string in sync (deep-linking).
 *
 * Call it once during component initialisation (e.g. at the top of `<script>` or
 * from the `<UrlSync>` component). It hydrates the store from the current URL on
 * mount, mirrors store mutations into the URL (`history.replaceState` by
 * default, debounced/guarded), and re-hydrates on `popstate`. The store
 * subscription, any pending timer and the `popstate` listener are torn down via
 * Svelte's `onDestroy`.
 *
 * All `window` / `history` / `location` access goes through the SSR-guarded
 * helpers in `url-sync.ts`, so this is inert (no throw) under SSR / jsdom
 * without a DOM. `onMount` itself is a no-op on the server, so hydration only
 * runs in the browser.
 */

import { onMount, onDestroy } from 'svelte';
import { type DashboardStore } from '@sentropic/dataviz-core';
import {
  applyStateToStore,
  readStateFromUrl,
  writeStateToUrl,
  type UrlSyncOptions,
} from './url-sync.js';

/** Bind a dashboard {@link DashboardStore} to the URL query string. */
export function useUrlSync(store: DashboardStore, options: UrlSyncOptions = {}): void {
  let applying = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const apply = () => {
    applying = true;
    try {
      applyStateToStore(store, readStateFromUrl(store, options));
    } finally {
      applying = false;
    }
  };

  // Mirror store changes back into the URL (debounced/guarded).
  const writeNow = () => writeStateToUrl(store.getState(), options);
  const unsubscribe = store.subscribe(() => {
    if (applying) return;
    const debounceMs = options.debounceMs ?? 0;
    if (debounceMs > 0) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(writeNow, debounceMs);
    } else {
      writeNow();
    }
  });

  // Re-hydrate on browser back/forward.
  const onPopState = () => apply();
  const canListen =
    typeof window !== 'undefined' && typeof window.addEventListener === 'function';
  if (canListen) window.addEventListener('popstate', onPopState);

  // Hydrate from the URL on mount (browser only — `onMount` never runs on SSR).
  onMount(apply);

  onDestroy(() => {
    unsubscribe();
    if (timer) clearTimeout(timer);
    if (canListen) window.removeEventListener('popstate', onPopState);
  });
}
