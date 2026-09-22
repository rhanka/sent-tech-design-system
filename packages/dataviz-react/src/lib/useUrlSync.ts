/**
 * useUrlSync — React live binding that keeps a dashboard store and the URL query
 * string in sync (deep-linking).
 *
 * On mount it applies any state encoded in the current URL to the store; on
 * every subsequent store change it writes the encoded state back to the URL
 * (`history.replaceState` by default, debounced/guarded); and it listens for
 * `popstate` so browser back/forward re-applies the corresponding state.
 *
 * All `window` / `history` / `location` access goes through the SSR-guarded
 * helpers in `url-sync.ts`, so the hook is inert (no throw) under SSR / jsdom
 * without a DOM.
 */

import { useEffect, useRef } from 'react';
import { type DashboardStore } from '@sentropic/dataviz-core';
import {
  applyStateToStore,
  readStateFromUrl,
  writeStateToUrl,
  type UrlSyncOptions,
} from './url-sync.js';

/**
 * Bind a dashboard {@link DashboardStore} to the URL query string.
 *
 * The hook owns the lifecycle: it hydrates from the URL once on mount, mirrors
 * store mutations into the URL, and re-hydrates on `popstate`. A short
 * `applying` guard prevents the URL write that a `popstate`-driven restore would
 * otherwise trigger (no feedback loop).
 */
export function useUrlSync(store: DashboardStore, options: UrlSyncOptions = {}): void {
  // Keep the latest options without re-subscribing every render.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let applying = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const apply = () => {
      applying = true;
      try {
        applyStateToStore(store, readStateFromUrl(store, optionsRef.current));
      } finally {
        applying = false;
      }
    };

    // 1. Hydrate from the URL on mount.
    apply();

    // 2. Mirror store changes back into the URL (debounced/guarded).
    const writeNow = () => writeStateToUrl(store.getState(), optionsRef.current);
    const unsubscribe = store.subscribe(() => {
      if (applying) return;
      const debounceMs = optionsRef.current.debounceMs ?? 0;
      if (debounceMs > 0) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(writeNow, debounceMs);
      } else {
        writeNow();
      }
    });

    // 3. Re-hydrate on browser back/forward.
    const onPopState = () => apply();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('popstate', onPopState);
    }

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('popstate', onPopState);
      }
    };
  }, [store]);
}
