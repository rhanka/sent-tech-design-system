import type { DataModel } from './model.js';
import { deserializeState } from './serialize.js';
import type { DashboardState, DashboardStore, FilterSpec } from './store.js';

export interface DashboardActionRuntime {
  openUrl?: (url: string, target?: string) => void;
  navigate?: (url: string) => void;
}

export interface DashboardBookmark {
  id: string;
  label: string;
  description?: string;
  state?: Partial<DashboardState>;
  encoded?: string;
  actions?: readonly DashboardAction[];
}

export type DashboardAction =
  | { kind: 'set-filter'; dimensionId: string; spec: FilterSpec }
  | { kind: 'clear-filter'; dimensionId: string }
  | { kind: 'clear-all' }
  | { kind: 'restore-state'; state: Partial<DashboardState> }
  | { kind: 'apply-bookmark'; bookmark: DashboardBookmark }
  | { kind: 'toggle-selection'; viewId: string; key: string }
  | { kind: 'clear-selection'; viewId: string }
  | { kind: 'drill-down'; viewId: string; dimensionId: string }
  | { kind: 'drill-up'; viewId: string }
  | { kind: 'clear-drill'; viewId: string }
  | { kind: 'open-url'; url: string; target?: string }
  | { kind: 'go-to'; url: string }
  | { kind: 'sequence'; actions: readonly DashboardAction[] };

type BrowserLike = typeof globalThis & {
  open?: (url: string, target?: string) => unknown;
  location?: {
    assign?: (url: string) => void;
    href?: string;
  };
};

function assertNever(value: never): never {
  throw new Error(`Unsupported dashboard action: ${JSON.stringify(value)}`);
}

function openUrl(url: string, target: string | undefined, runtime?: DashboardActionRuntime): void {
  if (runtime?.openUrl) {
    runtime.openUrl(url, target);
    return;
  }
  const browser = globalThis as BrowserLike;
  if (typeof browser.open === 'function') {
    browser.open(url, target);
  }
}

function navigate(url: string, runtime?: DashboardActionRuntime): void {
  if (runtime?.navigate) {
    runtime.navigate(url);
    return;
  }
  const location = (globalThis as BrowserLike).location;
  if (typeof location?.assign === 'function') {
    location.assign(url);
  } else if (location) {
    location.href = url;
  }
}

export function resolveDashboardBookmarkState(
  bookmark: DashboardBookmark,
  model?: DataModel,
): Partial<DashboardState> | undefined {
  if (bookmark.encoded !== undefined) return deserializeState(bookmark.encoded, model);
  return bookmark.state;
}

export function applyDashboardBookmark(
  store: DashboardStore,
  bookmark: DashboardBookmark,
  runtime?: DashboardActionRuntime,
): void {
  const state = resolveDashboardBookmarkState(bookmark, store.model);
  if (state !== undefined) store.restore(state);
  for (const action of bookmark.actions ?? []) {
    runDashboardAction(store, action, runtime);
  }
}

export function runDashboardAction(
  store: DashboardStore,
  action: DashboardAction,
  runtime?: DashboardActionRuntime,
): void {
  switch (action.kind) {
    case 'set-filter':
      store.setFilter(action.dimensionId, action.spec);
      return;
    case 'clear-filter':
      store.clearFilter(action.dimensionId);
      return;
    case 'clear-all':
      store.clearAll();
      return;
    case 'restore-state':
      store.restore(action.state);
      return;
    case 'apply-bookmark':
      applyDashboardBookmark(store, action.bookmark, runtime);
      return;
    case 'toggle-selection':
      store.toggleSelection(action.viewId, action.key);
      return;
    case 'clear-selection':
      store.clearSelection(action.viewId);
      return;
    case 'drill-down':
      store.drillDown(action.viewId, action.dimensionId);
      return;
    case 'drill-up':
      store.drillUp(action.viewId);
      return;
    case 'clear-drill':
      store.clearDrill(action.viewId);
      return;
    case 'open-url':
      openUrl(action.url, action.target, runtime);
      return;
    case 'go-to':
      navigate(action.url, runtime);
      return;
    case 'sequence':
      for (const child of action.actions) runDashboardAction(store, child, runtime);
      return;
    default:
      assertNever(action);
  }
}
