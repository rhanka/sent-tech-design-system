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
  TargetedFocusEvent,
  TargetedInputEvent,
  TargetedKeyboardEvent,
  TargetedMouseEvent,
  TargetedPointerEvent,
  TargetedWheelEvent,
  VNode,
} from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

/** Anything renderable. `ComponentChildren` in Preact, `ReactNode` in React. */
export type { ComponentChildren };

/** What a component returns. `VNode` in Preact, `ReactElement` in React. */
export type ComponentElement = VNode;

/** Event types handed to DOM handlers (React twin: the synthetic event types). */
export type {
  TargetedEvent,
  TargetedFocusEvent,
  TargetedInputEvent,
  TargetedKeyboardEvent,
  TargetedMouseEvent,
  TargetedPointerEvent,
  TargetedWheelEvent,
};

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
const hooks = options as unknown as { __b?: DiffHook; vnode?: VnodeHook };
const previousDiff = hooks.__b;
hooks.__b = (vnode) => {
  const type = vnode.type as unknown as ForwardedComponent | string | null;
  if (typeof type === "function" && type.__stForwardRef && vnode.ref) {
    vnode.props.ref = vnode.ref;
    vnode.ref = null;
  }
  previousDiff?.(vnode);
};

type VnodeHook = (vnode: VNode<Record<string, unknown>>) => void;

// Core-only SVG presentation-attribute normalisation for intrinsic elements.
// Preact core writes camelCase props verbatim via setAttribute onto `<svg>`,
// `<path>`, etc., where attribute names are case-sensitive, so `strokeWidth`
// would revert to the default width. `preact/compat` translates the same
// families; this is the same mapping without compat. Genuine camelCase SVG
// attributes (`viewBox`, `clipPathUnits`, `textLength`, …) are preserved by
// the negative lookaheads, as is `clipPath` element state.
const presentation =
  /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
const previousVnode = hooks.vnode;
hooks.vnode = (vnode) => {
  if (typeof vnode.type === "string") {
    const props = vnode.props as Record<string, unknown>;
    for (const name in props) {
      if (presentation.test(name)) {
        props[name.replace(/[A-Z0-9]/g, "-$&").toLowerCase()] = props[name];
        delete props[name];
      }
    }
  }
  previousVnode?.(vnode);
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
 * `getSnapshot`, optional `getServerSnapshot`), structured like the one of
 * `preact/compat`:
 *
 * - the subscription depends on `subscribe` only, so an inline `getSnapshot`
 *   or a new snapshot never tears it down and re-creates it;
 * - the rendered value and the current `getSnapshot` are kept in a ref, which
 *   is what the store listener compares against;
 * - the store is re-read in the layout phase of every render and once more
 *   when the subscription starts, so a change between render and subscription
 *   is not missed.
 *
 * `getServerSnapshot` is read instead of `getSnapshot` where there is no
 * document (server render). Preact core has no hydration flag a hook can read,
 * so unlike React the client's first render reads `getSnapshot` directly.
 */
export function useSyncExternalStore<T>(
  subscribe: (onChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T,
): T {
  const value = (typeof document === "undefined" && getServerSnapshot ? getServerSnapshot : getSnapshot)();
  const [, forceRender] = useState(0);
  const rendered = useRef({ value, getSnapshot });
  const [recheck] = useState(() => () => {
    const { value: shown, getSnapshot: read } = rendered.current;
    let moved = true;
    try {
      moved = !Object.is(shown, read());
    } catch {
      // A reader that throws re-renders, so the error surfaces in render.
    }
    if (moved) forceRender((count) => count + 1);
  });
  useLayoutEffect(() => {
    rendered.current = { value, getSnapshot };
    recheck();
  }, [subscribe, value, getSnapshot]);
  useEffect(() => {
    recheck();
    return subscribe(recheck);
  }, [subscribe]);
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

/**
 * Controlled change handler of a pass-through text control, spread onto
 * `<input>` or `<textarea>` with the consumer's own `onChange` and `onInput`
 * destructured out of the rest props. Preact core attaches `onChange` to the
 * native `change` event (blur for text fields), so a consumer `onChange`
 * would only run on blur; mapping it here runs it per keystroke, like React
 * and Vue. The consumer `onInput`, when present, runs first on the same
 * native `input` event, so both handlers fire once per keystroke, exactly as
 * in `components-react` (which keeps both via the rest spread).
 * React twin: the same handler spread as `onChange` plus the consumer
 * `onInput` untouched, which already fires per keystroke on both runtimes.
 */
export function textChange<T extends HTMLInputElement | HTMLTextAreaElement>(
  handler: (event: TargetedEvent<T>) => void,
  onInput?: (event: TargetedInputEvent<T>) => void,
): { onInput: (event: TargetedInputEvent<T>) => void } {
  if (!onInput) return { onInput: handler as (event: TargetedInputEvent<T>) => void };
  return {
    onInput: (event) => {
      onInput(event);
      handler(event);
    },
  };
}

// ---------------------------------------------------------------------------
// Double click
// ---------------------------------------------------------------------------

/**
 * Double-click handler spread onto an element. Preact core listens for the
 * native `dblclick` event (`onDblClick`); React names the same event
 * `onDoubleClick`. The twin maps it accordingly, so both legs fire.
 */
export function dblClick<T extends EventTarget>(
  handler: (event: TargetedMouseEvent<T>) => void,
): { onDblClick: (event: TargetedMouseEvent<T>) => void } {
  return { onDblClick: handler };
}

// ---------------------------------------------------------------------------
// Focus events
// ---------------------------------------------------------------------------

/**
 * Focus handler of a container, spread onto the element: it runs when the
 * element or any of its descendants receives focus. Preact core attaches
 * `onFocus` to the native `focus` event, which does not bubble, so a container
 * never hears a child; the bubbling native event is `focusin` (`onFocusIn`).
 * React: its `onFocus`, which already bubbles.
 */
export function focusWithin<T extends EventTarget>(
  handler: (event: TargetedFocusEvent<T>) => void,
): { onFocusIn: (event: TargetedFocusEvent<T>) => void } {
  return { onFocusIn: handler };
}

/**
 * Focus-leave handler of a container, spread onto the element: it runs when
 * focus leaves the element or any of its descendants, wherever focus goes —
 * including `body`, which fires no `focusin` for a document listener to hear.
 * Preact core attaches `onBlur` to the native `blur` event, which does not
 * bubble, so a container never hears a child; the bubbling native event is
 * `focusout` (`onFocusOut`). React: its `onBlur`, which already bubbles.
 */
export function focusOut<T extends EventTarget>(
  handler: (event: TargetedFocusEvent<T>) => void,
): { onFocusOut: (event: TargetedFocusEvent<T>) => void } {
  return { onFocusOut: handler };
}
