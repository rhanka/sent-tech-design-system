/**
 * Runtime adapter, Preact implementation. Everything here runs on Preact core
 * (`preact`, `preact/hooks`): no `preact/compat`, no signals.
 *
 * Component modules import from `preact` and `preact/hooks` only the names that
 * exist under the same name in `react` (hooks, `createContext`,
 * `createElement`, the `*HTMLAttributes` types). The few APIs and types whose
 * name or behaviour differs between the two runtimes are imported from this
 * module instead; the React emission swaps it for `react/runtime.ts`.
 */
import { options } from "preact";
import type {
  ComponentChildren,
  FunctionComponent,
  Ref,
  TargetedEvent,
  TargetedKeyboardEvent,
  TargetedMouseEvent,
  VNode,
} from "preact";
import { useEffect, useLayoutEffect, useState } from "preact/hooks";

/** Anything renderable. `ComponentChildren` in Preact, `ReactNode` in React. */
export type { ComponentChildren };

/** Event types handed to DOM handlers (React twin: the synthetic event types). */
export type { TargetedKeyboardEvent, TargetedMouseEvent };

// ---------------------------------------------------------------------------
// forwardRef
// ---------------------------------------------------------------------------

/** The ref a `forwardRef` render function receives. Same shape as React's. */
export type ForwardedRef<T> = ((instance: T | null) => void) | { current: T | null } | null;

type ForwardedComponent = ((...args: never[]) => unknown) & { __stForwardRef?: true };
type DiffHook = (vnode: VNode<{ ref?: unknown }>) => void;

// Preact 10 strips `ref` from the props of a function component and keeps it
// on the vnode. `preact/compat` restores it through the `options._diff` hook
// (mangled `__b`, the hook `@preact/signals` also relies on). This is the same
// mechanism in ten lines, without the other 10 kB of compat.
const hooks = options as unknown as { __b?: DiffHook };
const previousDiff = hooks.__b;
hooks.__b = (vnode) => {
  const type = vnode.type as unknown as ForwardedComponent | string | null;
  if (typeof type === "function" && type.__stForwardRef && vnode.ref) {
    vnode.props.ref = vnode.ref;
    vnode.ref = null;
  }
  previousDiff?.(vnode);
};

export function forwardRef<T, P = {}>(
  render: (props: P, ref: ForwardedRef<T>) => ComponentChildren,
): FunctionComponent<Omit<P, "ref"> & { ref?: Ref<T> }> {
  function Forwarded(props: Omit<P, "ref"> & { ref?: Ref<T> }): ComponentChildren {
    const { ref, ...rest } = props;
    return render(rest as unknown as P, (ref ?? null) as ForwardedRef<T>);
  }
  (Forwarded as unknown as ForwardedComponent).__stForwardRef = true;
  Forwarded.displayName = `ForwardRef(${render.name || "render"})`;
  return Forwarded;
}

// ---------------------------------------------------------------------------
// Effects and external stores
// ---------------------------------------------------------------------------

/**
 * Insertion effects have no dedicated phase in Preact: the layout phase is the
 * earliest one, which is also how `preact/compat` aliases it.
 */
export const useInsertionEffect: typeof useLayoutEffect = useLayoutEffect;

/**
 * External store subscription with React's contract (`subscribe`,
 * `getSnapshot`). Re-reads the snapshot after mount and on every notification,
 * so a store that changes between render and subscription is not missed.
 */
export function useSyncExternalStore<T>(subscribe: (onChange: () => void) => () => void, getSnapshot: () => T): T {
  const value = getSnapshot();
  const [, forceRender] = useState(0);
  useEffect(() => {
    const check = () => {
      if (!Object.is(value, getSnapshot())) forceRender((count) => count + 1);
    };
    check();
    return subscribe(check);
  }, [subscribe, getSnapshot, value]);
  return value;
}

// ---------------------------------------------------------------------------
// Form events
// ---------------------------------------------------------------------------

/**
 * Per-keystroke handler of a text control, spread onto `<input>` or
 * `<textarea>`. Preact core: the native `input` event (`onInput`). React: its
 * `onChange`, which a controlled field must carry.
 */
export function textInput<T extends HTMLInputElement | HTMLTextAreaElement>(
  handler: (value: string) => void,
): { onInput: (event: TargetedEvent<T>) => void } {
  return { onInput: (event) => handler(event.currentTarget.value) };
}
