import { describe, it, expect } from 'vitest';
import { defineComponent, effectScope, h } from 'vue';
import { mount } from '@vue/test-utils';
import {
  type DataModel,
  createDashboardStore,
  buildFieldPaneTree,
  useDashboard,
  provideDashboard,
  injectDashboard,
} from './index.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Country', type: 'discrete' }],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

describe('useDashboard', () => {
  it('exposes the current state and updates on mutation', () => {
    const store = createDashboardStore({ model, data: [] });
    const scope = effectScope();
    const state = scope.run(() => useDashboard(store))!;
    expect(state.value).toEqual({ filters: {}, selections: {}, drill: {} });
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(state.value).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: {},
      drill: {},
    });
    scope.stop();
  });

  it('replaces the whole state object (shallow ref identity changes)', () => {
    const store = createDashboardStore({ model, data: [] });
    const scope = effectScope();
    const state = scope.run(() => useDashboard(store))!;
    const before = state.value;
    store.toggleSelection('chart', 'FR');
    expect(state.value).not.toBe(before);
    scope.stop();
  });

  it('unsubscribes when its scope is disposed', () => {
    const store = createDashboardStore({ model, data: [] });
    const scope = effectScope();
    const state = scope.run(() => useDashboard(store))!;
    scope.stop();
    store.setFilter('country', { kind: 'include', values: ['US'] });
    // After scope stop, onScopeDispose ran -> no more updates.
    expect(state.value).toEqual({ filters: {}, selections: {}, drill: {} });
  });
});

describe('provide / inject', () => {
  it('injectDashboard returns the provided store', () => {
    const store = createDashboardStore({ model, data: [] });
    let injected: unknown;

    const Child = defineComponent({
      setup() {
        injected = injectDashboard();
        return () => h('div');
      },
    });
    const Parent = defineComponent({
      setup() {
        provideDashboard(store);
        return () => h(Child);
      },
    });

    mount(Parent);
    expect(injected).toBe(store);
  });

  it('injectDashboard throws when nothing was provided', () => {
    let error: unknown;
    const Lonely = defineComponent({
      setup() {
        try {
          injectDashboard();
        } catch (e) {
          error = e;
        }
        return () => h('div');
      },
    });
    mount(Lonely);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(/no DashboardStore provided/);
  });
});

describe('core field pane re-export', () => {
  it('exposes the core field pane view model helpers', () => {
    expect(buildFieldPaneTree(model).nodes.map((node) => node.id)).toEqual([
      'group:dimensions',
      'group:measures',
    ]);
  });
});
