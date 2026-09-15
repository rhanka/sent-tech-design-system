import { describe, it, expect, vi } from 'vitest';
import { createHoverChannel, hoverKeyOf } from './index.js';

describe('createHoverChannel — initial state', () => {
  it('starts with null', () => {
    const channel = createHoverChannel();
    expect(channel.get()).toBeNull();
  });
});

describe('createHoverChannel — get / set', () => {
  it('set updates the current key', () => {
    const channel = createHoverChannel();
    channel.set('2024-Q3');
    expect(channel.get()).toBe('2024-Q3');
  });

  it('set to null clears the current key', () => {
    const channel = createHoverChannel();
    channel.set('foo');
    channel.set(null);
    expect(channel.get()).toBeNull();
  });

  it('accepts empty string as a valid key', () => {
    const channel = createHoverChannel();
    channel.set('');
    expect(channel.get()).toBe('');
  });
});

describe('createHoverChannel — no-op on unchanged value', () => {
  it('does not notify when the same key is set again', () => {
    const channel = createHoverChannel();
    const listener = vi.fn();
    channel.subscribe(listener);

    channel.set('A');
    channel.set('A'); // same — must be a no-op

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('A');
  });

  it('does not notify when null is set twice in a row', () => {
    const channel = createHoverChannel();
    const listener = vi.fn();
    channel.subscribe(listener);

    channel.set(null); // already null — no-op
    channel.set(null);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('createHoverChannel — subscribe', () => {
  it('notifies a single subscriber on change', () => {
    const channel = createHoverChannel();
    const listener = vi.fn();
    channel.subscribe(listener);

    channel.set('key-1');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('key-1');
  });

  it('notifies with null when key is cleared', () => {
    const channel = createHoverChannel();
    const listener = vi.fn();
    channel.subscribe(listener);

    channel.set('x');
    channel.set(null);

    expect(listener).toHaveBeenNthCalledWith(1, 'x');
    expect(listener).toHaveBeenNthCalledWith(2, null);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('notifies multiple subscribers in insertion order', () => {
    const channel = createHoverChannel();
    const order: string[] = [];

    channel.subscribe(() => order.push('first'));
    channel.subscribe(() => order.push('second'));
    channel.subscribe(() => order.push('third'));

    channel.set('k');
    expect(order).toEqual(['first', 'second', 'third']);
  });

  it('all subscribers receive the new key', () => {
    const channel = createHoverChannel();
    const a = vi.fn();
    const b = vi.fn();
    channel.subscribe(a);
    channel.subscribe(b);

    channel.set('shared');
    expect(a).toHaveBeenCalledWith('shared');
    expect(b).toHaveBeenCalledWith('shared');
  });
});

describe('createHoverChannel — unsubscribe', () => {
  it('stops notifying after unsubscribe', () => {
    const channel = createHoverChannel();
    const listener = vi.fn();
    const unsub = channel.subscribe(listener);

    channel.set('before');
    unsub();
    channel.set('after');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('before');
  });

  it('calling unsubscribe twice is safe (idempotent)', () => {
    const channel = createHoverChannel();
    const listener = vi.fn();
    const unsub = channel.subscribe(listener);

    unsub();
    expect(() => unsub()).not.toThrow();

    channel.set('x');
    expect(listener).not.toHaveBeenCalled();
  });

  it('only removes the specific subscriber, not others', () => {
    const channel = createHoverChannel();
    const a = vi.fn();
    const b = vi.fn();
    const unsubA = channel.subscribe(a);
    channel.subscribe(b);

    unsubA();
    channel.set('y');

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith('y');
  });

  it('re-subscribing the same function creates a new independent subscription', () => {
    const channel = createHoverChannel();
    const listener = vi.fn();
    const unsub1 = channel.subscribe(listener);
    const unsub2 = channel.subscribe(listener);

    channel.set('z');
    // Called twice because both subscriptions are active.
    expect(listener).toHaveBeenCalledTimes(2);

    unsub1();
    listener.mockClear();

    channel.set('w');
    // Only the second subscription remains.
    expect(listener).toHaveBeenCalledTimes(1);

    unsub2();
    listener.mockClear();

    channel.set('v');
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('createHoverChannel — isolation between instances', () => {
  it('two channels are independent', () => {
    const ch1 = createHoverChannel();
    const ch2 = createHoverChannel();
    const l1 = vi.fn();
    const l2 = vi.fn();
    ch1.subscribe(l1);
    ch2.subscribe(l2);

    ch1.set('panel-A');
    expect(l1).toHaveBeenCalledWith('panel-A');
    expect(l2).not.toHaveBeenCalled();

    expect(ch1.get()).toBe('panel-A');
    expect(ch2.get()).toBeNull();
  });
});

describe('hoverKeyOf', () => {
  it('returns the string value for a named field', () => {
    expect(hoverKeyOf({ category: 'fruits' }, 'category')).toBe('fruits');
  });

  it('stringifies a numeric value', () => {
    expect(hoverKeyOf({ year: 2024 }, 'year')).toBe('2024');
  });

  it('stringifies a boolean value', () => {
    expect(hoverKeyOf({ active: true }, 'active')).toBe('true');
  });

  it('returns null for a missing field', () => {
    expect(hoverKeyOf({ a: 1 }, 'b')).toBeNull();
  });

  it('returns null for a null datum', () => {
    expect(hoverKeyOf(null, 'key')).toBeNull();
  });

  it('returns null for an undefined datum', () => {
    expect(hoverKeyOf(undefined, 'key')).toBeNull();
  });

  it('returns null for a non-primitive field value (object)', () => {
    expect(hoverKeyOf({ nested: { x: 1 } }, 'nested')).toBeNull();
  });
});
