import { describe, it, expect, vi } from 'vitest';
import {
  type PanelLayout,
  type DashboardLayout,
  type LayoutState,
  isPanelLayout,
  isDashboardLayout,
  createLayout,
  addPanel,
  removePanel,
  movePanel,
  resizePanel,
  normalizeLayout,
  serializeLayout,
  deserializeLayout,
  createLayoutState,
} from './index.js';

// --- Helpers ----------------------------------------------------------------

function panel(id: string, x: number, y: number, w: number, h: number): PanelLayout {
  return { id, x, y, w, h };
}

// --- isPanelLayout ----------------------------------------------------------

describe('isPanelLayout', () => {
  it('accepts a valid panel', () => {
    expect(isPanelLayout(panel('a', 0, 0, 1, 1))).toBe(true);
    expect(isPanelLayout(panel('abc', 3, 5, 4, 2))).toBe(true);
  });

  it('rejects null / non-object', () => {
    expect(isPanelLayout(null)).toBe(false);
    expect(isPanelLayout('panel')).toBe(false);
    expect(isPanelLayout(42)).toBe(false);
    expect(isPanelLayout([])).toBe(false);
  });

  it('rejects missing or empty id', () => {
    expect(isPanelLayout({ id: '', x: 0, y: 0, w: 1, h: 1 })).toBe(false);
    expect(isPanelLayout({ x: 0, y: 0, w: 1, h: 1 })).toBe(false);
  });

  it('rejects negative coordinates', () => {
    expect(isPanelLayout({ id: 'a', x: -1, y: 0, w: 1, h: 1 })).toBe(false);
    expect(isPanelLayout({ id: 'a', x: 0, y: -1, w: 1, h: 1 })).toBe(false);
  });

  it('rejects zero or negative w/h', () => {
    expect(isPanelLayout({ id: 'a', x: 0, y: 0, w: 0, h: 1 })).toBe(false);
    expect(isPanelLayout({ id: 'a', x: 0, y: 0, w: 1, h: 0 })).toBe(false);
    expect(isPanelLayout({ id: 'a', x: 0, y: 0, w: -2, h: 1 })).toBe(false);
  });

  it('rejects floats', () => {
    expect(isPanelLayout({ id: 'a', x: 1.5, y: 0, w: 1, h: 1 })).toBe(false);
    expect(isPanelLayout({ id: 'a', x: 0, y: 0, w: 1.5, h: 1 })).toBe(false);
  });

  it('rejects NaN and Infinity', () => {
    expect(isPanelLayout({ id: 'a', x: NaN, y: 0, w: 1, h: 1 })).toBe(false);
    expect(isPanelLayout({ id: 'a', x: 0, y: 0, w: Infinity, h: 1 })).toBe(false);
    expect(isPanelLayout({ id: 'a', x: 0, y: 0, w: 1, h: NaN })).toBe(false);
  });
});

// --- isDashboardLayout ------------------------------------------------------

describe('isDashboardLayout', () => {
  it('accepts a valid layout', () => {
    expect(isDashboardLayout({ columns: 12, panels: [] })).toBe(true);
    expect(isDashboardLayout({ columns: 12, panels: [panel('a', 0, 0, 3, 2)] })).toBe(true);
  });

  it('rejects null / non-object', () => {
    expect(isDashboardLayout(null)).toBe(false);
    expect(isDashboardLayout('layout')).toBe(false);
    expect(isDashboardLayout([])).toBe(false);
  });

  it('rejects zero or negative columns', () => {
    expect(isDashboardLayout({ columns: 0, panels: [] })).toBe(false);
    expect(isDashboardLayout({ columns: -1, panels: [] })).toBe(false);
  });

  it('rejects float columns', () => {
    expect(isDashboardLayout({ columns: 12.5, panels: [] })).toBe(false);
  });

  it('rejects NaN/Infinity columns', () => {
    expect(isDashboardLayout({ columns: NaN, panels: [] })).toBe(false);
    expect(isDashboardLayout({ columns: Infinity, panels: [] })).toBe(false);
  });

  it('rejects a panels array containing an invalid panel', () => {
    expect(
      isDashboardLayout({ columns: 12, panels: [{ id: 'a', x: -1, y: 0, w: 1, h: 1 }] }),
    ).toBe(false);
  });

  it('rejects missing panels field', () => {
    expect(isDashboardLayout({ columns: 12 })).toBe(false);
  });
});

// --- createLayout -----------------------------------------------------------

describe('createLayout', () => {
  it('creates a layout with default 12 columns and no panels', () => {
    const layout = createLayout();
    expect(layout.columns).toBe(12);
    expect(layout.panels).toEqual([]);
  });

  it('accepts a custom columns value', () => {
    expect(createLayout(6).columns).toBe(6);
    expect(createLayout(1).columns).toBe(1);
  });

  it('clamps columns to at least 1', () => {
    expect(createLayout(0).columns).toBe(1);
    expect(createLayout(-5).columns).toBe(1);
  });

  it('floors non-integer columns', () => {
    expect(createLayout(5.9).columns).toBe(5);
  });

  it('returns a valid DashboardLayout', () => {
    expect(isDashboardLayout(createLayout())).toBe(true);
  });
});

// --- addPanel ---------------------------------------------------------------

describe('addPanel — immutability', () => {
  it('does not mutate the original layout', () => {
    const layout = createLayout();
    const copy = { ...layout, panels: [...layout.panels] };
    addPanel(layout, panel('a', 0, 0, 3, 2));
    expect(layout).toEqual(copy);
  });

  it('returns a new object reference', () => {
    const layout = createLayout();
    const next = addPanel(layout, panel('a', 0, 0, 3, 2));
    expect(next).not.toBe(layout);
  });
});

describe('addPanel — basic behaviour', () => {
  it('adds a panel to an empty layout', () => {
    const layout = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    expect(layout.panels).toHaveLength(1);
    expect(layout.panels[0]).toEqual({ id: 'a', x: 0, y: 0, w: 3, h: 2 });
  });

  it('appends multiple panels', () => {
    const layout = addPanel(addPanel(createLayout(12), panel('a', 0, 0, 4, 2)), panel('b', 4, 0, 4, 2));
    expect(layout.panels).toHaveLength(2);
  });

  it('replaces a panel with the same id', () => {
    const l1 = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    const l2 = addPanel(l1, panel('a', 6, 0, 4, 3));
    expect(l2.panels).toHaveLength(1);
    expect(l2.panels[0]).toEqual({ id: 'a', x: 6, y: 0, w: 4, h: 3 });
  });
});

describe('addPanel — clamping', () => {
  it('clamps x to [0, columns - 1]', () => {
    const layout = addPanel(createLayout(12), panel('a', 15, 0, 3, 2));
    expect(layout.panels[0]!.x).toBe(11);
  });

  it('clamps y to 0 minimum', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, -5, 3, 2));
    expect(layout.panels[0]!.y).toBe(0);
  });

  it('clamps w so panel does not overflow the right edge', () => {
    // x=10 on a 12-col grid: w can be at most 2
    const layout = addPanel(createLayout(12), panel('a', 10, 0, 6, 2));
    expect(layout.panels[0]!.w).toBe(2);
  });

  it('clamps w to 1 minimum', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 0, 2));
    expect(layout.panels[0]!.w).toBe(1);
  });

  it('clamps h to 1 minimum', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 0));
    expect(layout.panels[0]!.h).toBe(1);
  });

  it('floors float coordinates', () => {
    // Panels built outside of isPanelLayout validation (raw objects)
    const rawPanel = { id: 'f', x: 1.7, y: 2.9, w: 3.4, h: 1.6 } as PanelLayout;
    const layout = addPanel(createLayout(12), rawPanel);
    const p = layout.panels[0]!;
    expect(p.x).toBe(1);
    expect(p.y).toBe(2);
    expect(p.w).toBe(3);
    expect(p.h).toBe(1);
  });
});

// --- removePanel ------------------------------------------------------------

describe('removePanel', () => {
  it('removes a panel by id', () => {
    const l1 = addPanel(addPanel(createLayout(), panel('a', 0, 0, 3, 2)), panel('b', 4, 0, 4, 2));
    const l2 = removePanel(l1, 'a');
    expect(l2.panels.map((p) => p.id)).toEqual(['b']);
  });

  it('returns the same reference when id is not found', () => {
    const layout = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    expect(removePanel(layout, 'z')).toBe(layout);
  });

  it('does not mutate the original layout', () => {
    const layout = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    const snapshot = { ...layout, panels: [...layout.panels] };
    removePanel(layout, 'a');
    expect(layout).toEqual(snapshot);
  });
});

// --- movePanel --------------------------------------------------------------

describe('movePanel', () => {
  it('moves a panel to a new position', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const next = movePanel(layout, 'a', 5, 3);
    expect(next.panels[0]).toEqual({ id: 'a', x: 5, y: 3, w: 3, h: 2 });
  });

  it('returns the same reference when id is not found', () => {
    const layout = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    expect(movePanel(layout, 'z', 1, 1)).toBe(layout);
  });

  it('does not mutate the original layout', () => {
    const layout = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    const snapshot = JSON.stringify(layout);
    movePanel(layout, 'a', 4, 2);
    expect(JSON.stringify(layout)).toBe(snapshot);
  });

  it('clamps x to [0, columns - 1]', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const next = movePanel(layout, 'a', 100, 0);
    expect(next.panels[0]!.x).toBe(11);
  });

  it('clamps y to 0 minimum', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const next = movePanel(layout, 'a', 0, -10);
    expect(next.panels[0]!.y).toBe(0);
  });

  it('re-clamps w when x changes so panel does not overflow', () => {
    // Panel is 3 wide; moving to x=11 on a 12-col grid should clamp w to 1.
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const next = movePanel(layout, 'a', 11, 0);
    expect(next.panels[0]!.w).toBe(1);
  });
});

// --- resizePanel ------------------------------------------------------------

describe('resizePanel', () => {
  it('resizes a panel', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const next = resizePanel(layout, 'a', 6, 4);
    expect(next.panels[0]).toEqual({ id: 'a', x: 0, y: 0, w: 6, h: 4 });
  });

  it('returns the same reference when id is not found', () => {
    const layout = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    expect(resizePanel(layout, 'z', 5, 5)).toBe(layout);
  });

  it('does not mutate the original layout', () => {
    const layout = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    const snapshot = JSON.stringify(layout);
    resizePanel(layout, 'a', 5, 5);
    expect(JSON.stringify(layout)).toBe(snapshot);
  });

  it('clamps w so panel does not overflow the right edge', () => {
    // x=8 on a 12-col grid: max w = 4
    const layout = addPanel(createLayout(12), panel('a', 8, 0, 2, 2));
    const next = resizePanel(layout, 'a', 10, 2);
    expect(next.panels[0]!.w).toBe(4);
  });

  it('clamps w to 1 minimum', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const next = resizePanel(layout, 'a', 0, 2);
    expect(next.panels[0]!.w).toBe(1);
  });

  it('clamps h to 1 minimum', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const next = resizePanel(layout, 'a', 3, 0);
    expect(next.panels[0]!.h).toBe(1);
  });
});

// --- normalizeLayout --------------------------------------------------------

describe('normalizeLayout', () => {
  it('returns a valid layout with no panels unchanged (structurally)', () => {
    const layout = createLayout();
    const normalized = normalizeLayout(layout);
    expect(normalized.columns).toBe(12);
    expect(normalized.panels).toEqual([]);
  });

  it('sorts panels by y asc, then x asc', () => {
    const l = addPanel(
      addPanel(addPanel(createLayout(12), panel('c', 0, 2, 3, 2)), panel('b', 5, 0, 3, 2)),
      panel('a', 2, 0, 3, 2),
    );
    const normalized = normalizeLayout(l);
    expect(normalized.panels.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts ties on x by id alphabetically', () => {
    const l = addPanel(
      addPanel(createLayout(12), panel('z', 0, 0, 3, 2)),
      panel('a', 0, 0, 3, 2),
    );
    const normalized = normalizeLayout(l);
    expect(normalized.panels.map((p) => p.id)).toEqual(['a', 'z']);
  });

  it('deduplicates by id — last wins', () => {
    const l = {
      columns: 12,
      panels: [panel('a', 0, 0, 3, 2), panel('b', 4, 0, 4, 2), panel('a', 8, 0, 2, 2)],
    };
    const normalized = normalizeLayout(l);
    const aPanel = normalized.panels.find((p) => p.id === 'a')!;
    expect(normalized.panels.filter((p) => p.id === 'a')).toHaveLength(1);
    // Last occurrence of 'a' had x=8
    expect(aPanel.x).toBe(8);
  });

  it('clamps panels to the grid', () => {
    const l = {
      columns: 12,
      panels: [{ id: 'a', x: 15, y: 0, w: 10, h: 1 } as PanelLayout],
    };
    const normalized = normalizeLayout(l);
    const p = normalized.panels[0]!;
    expect(p.x).toBe(11);
    expect(p.w).toBe(1); // 12 - 11 = 1
  });

  it('does not mutate the input layout', () => {
    const l = addPanel(
      addPanel(createLayout(12), panel('b', 5, 0, 3, 2)),
      panel('a', 0, 2, 3, 2),
    );
    const snapshot = JSON.stringify(l);
    normalizeLayout(l);
    expect(JSON.stringify(l)).toBe(snapshot);
  });
});

// --- serializeLayout --------------------------------------------------------

describe('serializeLayout', () => {
  it('serializes a valid layout to a JSON string', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const s = serializeLayout(layout);
    expect(typeof s).toBe('string');
    expect(JSON.parse(s)).toEqual(layout);
  });

  it('serializes an empty layout', () => {
    const layout = createLayout();
    const s = serializeLayout(layout);
    expect(JSON.parse(s)).toEqual({ columns: 12, panels: [] });
  });

  it('throws TypeError on a malformed layout (negative columns)', () => {
    expect(() =>
      serializeLayout({ columns: -1, panels: [] } as unknown as DashboardLayout),
    ).toThrow(TypeError);
  });

  it('throws TypeError on a null input', () => {
    expect(() => serializeLayout(null as unknown as DashboardLayout)).toThrow(TypeError);
  });

  it('throws TypeError when a panel has zero span', () => {
    expect(() =>
      serializeLayout({
        columns: 12,
        panels: [{ id: 'a', x: 0, y: 0, w: 0, h: 1 }],
      } as unknown as DashboardLayout),
    ).toThrow(TypeError);
  });
});

// --- deserializeLayout ------------------------------------------------------

describe('deserializeLayout', () => {
  it('round-trips a valid layout', () => {
    const layout = addPanel(createLayout(12), panel('a', 0, 0, 3, 2));
    const s = serializeLayout(layout);
    expect(deserializeLayout(s)).toEqual(layout);
  });

  it('round-trips a layout with multiple panels', () => {
    const layout = normalizeLayout(
      addPanel(
        addPanel(createLayout(12), panel('a', 0, 0, 4, 3)),
        panel('b', 4, 0, 4, 3),
      ),
    );
    expect(deserializeLayout(serializeLayout(layout))).toEqual(layout);
  });

  it('returns null on empty string — never throws', () => {
    expect(deserializeLayout('')).toBeNull();
  });

  it('returns null on invalid JSON', () => {
    expect(deserializeLayout('not json')).toBeNull();
  });

  it('returns null on valid JSON but wrong shape', () => {
    expect(deserializeLayout('"hello"')).toBeNull();
    expect(deserializeLayout('42')).toBeNull();
    expect(deserializeLayout('null')).toBeNull();
    expect(deserializeLayout('[]')).toBeNull();
  });

  it('returns null when columns field is invalid', () => {
    expect(deserializeLayout(JSON.stringify({ columns: 0, panels: [] }))).toBeNull();
    expect(deserializeLayout(JSON.stringify({ columns: -1, panels: [] }))).toBeNull();
    expect(deserializeLayout(JSON.stringify({ columns: 12.5, panels: [] }))).toBeNull();
  });

  it('returns null when a panel has a negative coordinate', () => {
    expect(
      deserializeLayout(
        JSON.stringify({ columns: 12, panels: [{ id: 'a', x: -1, y: 0, w: 1, h: 1 }] }),
      ),
    ).toBeNull();
  });

  it('returns null when a panel has a zero span', () => {
    expect(
      deserializeLayout(
        JSON.stringify({ columns: 12, panels: [{ id: 'a', x: 0, y: 0, w: 0, h: 1 }] }),
      ),
    ).toBeNull();
  });

  it('returns null when a panel has a NaN value', () => {
    // JSON.stringify turns NaN into null, so we build the string manually.
    const s = '{"columns":12,"panels":[{"id":"a","x":null,"y":0,"w":1,"h":1}]}';
    expect(deserializeLayout(s)).toBeNull();
  });

  it('never throws on any input', () => {
    const inputs = ['', '{}', 'null', '[]', 'undefined', '{bad json', '{"columns":12}'];
    for (const input of inputs) {
      expect(() => deserializeLayout(input)).not.toThrow();
    }
  });
});

// --- Validation edge cases --------------------------------------------------

describe('validation edge cases', () => {
  it('isPanelLayout rejects non-integer that looks valid (1.0 passes Number.isInteger)', () => {
    // 1.0 === 1 in JS — Number.isInteger(1.0) is true, so this is valid.
    expect(isPanelLayout({ id: 'a', x: 1, y: 0, w: 1.0, h: 1 })).toBe(true);
  });

  it('isPanelLayout rejects non-finite numbers', () => {
    expect(isPanelLayout({ id: 'a', x: Infinity, y: 0, w: 1, h: 1 })).toBe(false);
    expect(isPanelLayout({ id: 'a', x: -Infinity, y: 0, w: 1, h: 1 })).toBe(false);
  });

  it('isDashboardLayout rejects missing panels array', () => {
    expect(isDashboardLayout({ columns: 12 })).toBe(false);
  });

  it('isDashboardLayout accepts a single-column grid', () => {
    expect(isDashboardLayout({ columns: 1, panels: [] })).toBe(true);
  });
});

// --- createLayoutState ------------------------------------------------------

describe('createLayoutState — initial state', () => {
  it('defaults to a 12-column empty layout', () => {
    const state = createLayoutState();
    expect(state.get().columns).toBe(12);
    expect(state.get().panels).toEqual([]);
  });

  it('accepts an initial layout', () => {
    const initial = createLayout(6);
    const state = createLayoutState(initial);
    expect(state.get()).toBe(initial);
  });
});

describe('createLayoutState — get / set', () => {
  it('set updates the current layout', () => {
    const state = createLayoutState();
    const next = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    state.set(next);
    expect(state.get()).toBe(next);
  });

  it('set is a no-op when the same reference is set again', () => {
    const state = createLayoutState();
    const listener = vi.fn();
    state.subscribe(listener);

    const current = state.get();
    state.set(current);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('createLayoutState — update', () => {
  it('applies the transformation and stores the result', () => {
    const state = createLayoutState();
    state.update((l) => addPanel(l, panel('a', 0, 0, 3, 2)));
    expect(state.get().panels).toHaveLength(1);
  });

  it('is a no-op when the fn returns the same reference', () => {
    const state = createLayoutState();
    const listener = vi.fn();
    state.subscribe(listener);

    state.update((l) => l);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('createLayoutState — subscribe', () => {
  it('notifies a subscriber on set', () => {
    const state = createLayoutState();
    const listener = vi.fn();
    state.subscribe(listener);

    const next = addPanel(createLayout(), panel('a', 0, 0, 3, 2));
    state.set(next);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(next);
  });

  it('notifies multiple subscribers in insertion order', () => {
    const state = createLayoutState();
    const order: string[] = [];
    state.subscribe(() => order.push('first'));
    state.subscribe(() => order.push('second'));

    state.set(createLayout(6));
    expect(order).toEqual(['first', 'second']);
  });

  it('stops notifying after unsubscribe', () => {
    const state = createLayoutState();
    const listener = vi.fn();
    const unsub = state.subscribe(listener);

    state.set(createLayout(6));
    unsub();
    state.set(createLayout(8));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calling unsubscribe twice is safe', () => {
    const state = createLayoutState();
    const unsub = state.subscribe(vi.fn());
    unsub();
    expect(() => unsub()).not.toThrow();
  });

  it('two instances are independent', () => {
    const s1 = createLayoutState();
    const s2 = createLayoutState();
    const l1 = vi.fn();
    const l2 = vi.fn();
    s1.subscribe(l1);
    s2.subscribe(l2);

    s1.set(createLayout(4));
    expect(l1).toHaveBeenCalled();
    expect(l2).not.toHaveBeenCalled();
  });
});
