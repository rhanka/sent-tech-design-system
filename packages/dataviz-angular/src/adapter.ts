import { InjectionToken, inject, signal, type Provider, type Signal } from '@angular/core';
import {
  createDashboardStore,
  type DashboardState,
  type DashboardStore,
  type DashboardStoreConfig,
} from '@sentropic/dataviz-core';

// Re-export the full core surface so consumers need a single import.
export * from '@sentropic/dataviz-core';

// Prove design-system resolution with a real DS type.
export type { BarChartTone } from '@sentropic/design-system-angular';
export type { TenantTheme } from '@sentropic/design-system-themes';

export interface AngularSignalStore {
  readonly store: DashboardStore;
  readonly state: Signal<DashboardState>;
  replace(store: DashboardStore): void;
  destroy(): void;
}

class DashboardSignalStoreImpl implements AngularSignalStore {
  private currentStore: DashboardStore;
  private unsubscribe: () => void = () => {};
  private readonly stateSignal;

  constructor(store: DashboardStore) {
    this.currentStore = store;
    this.stateSignal = signal<DashboardState>(store.getState());
    this.bind(store);
  }

  get store(): DashboardStore {
    return this.currentStore;
  }

  get state(): Signal<DashboardState> {
    return this.stateSignal.asReadonly();
  }

  replace(store: DashboardStore): void {
    if (store === this.currentStore) return;
    this.bind(store);
  }

  destroy(): void {
    this.unsubscribe();
    this.unsubscribe = () => {};
  }

  private bind(store: DashboardStore): void {
    this.unsubscribe();
    this.currentStore = store;
    this.stateSignal.set(store.getState());
    this.unsubscribe = store.subscribe(() => {
      this.stateSignal.set(store.getState());
    });
  }
}

export function toSignalStore(store: DashboardStore): AngularSignalStore {
  return new DashboardSignalStoreImpl(store);
}

export interface AngularDashboard {
  store: DashboardStore;
  state: Signal<DashboardState>;
  signals: AngularSignalStore;
  destroy(): void;
}

export function createDashboard(config: DashboardStoreConfig): AngularDashboard {
  const store = createDashboardStore(config);
  const signals = toSignalStore(store);
  return {
    store,
    state: signals.state,
    signals,
    destroy: () => signals.destroy(),
  };
}

export const DASHBOARD_STORE = new InjectionToken<DashboardStore>('dataviz-dashboard');

export function provideDashboard(store: DashboardStore): Provider {
  return { provide: DASHBOARD_STORE, useValue: store };
}

export function injectDashboard(): DashboardStore {
  const store = inject(DASHBOARD_STORE, { optional: true });
  if (!store) {
    throw new Error('injectDashboard: no DashboardStore provided. Add provideDashboard(store) to the injector tree.');
  }
  return store;
}
