/**
 * Runtime adapter, Preact implementation. Everything here runs on Preact core
 * (`preact`, `preact/hooks`): no `preact/compat`, no signals.
 *
 * Component modules import from `preact` and `preact/hooks` only the names that
 * exist under the same name in `react` (hooks, `createContext`,
 * `createElement`, `Fragment`, `CSSProperties`, `*HTMLAttributes` types). The
 * few APIs and types whose name or behaviour differs between the two runtimes
 * are imported from this module instead; the React emission swaps it for
 * `react/runtime.ts`.
 */
import { options } from "preact";
import type {
  ComponentChildren,
  FunctionComponent,
  JSX,
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

/** Element type accepted by polymorphic `as`. `JSX.ElementType` in Preact, `React.ElementType` in React. */
export type ElementType = JSX.ElementType;

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
// `<path>`, `<text>`, etc., where attribute names are case-sensitive, so
// `strokeWidth`, `textAnchor` or `dominantBaseline` would be ignored.
// Genuine camelCase SVG attributes (`viewBox`, `preserveAspectRatio`,
// `clipPathUnits`, `textLength`, …) are preserved by the negative lookaheads.
// `tabIndex` is normalised to `tabindex` on the same path so SVG elements keep
// roving-tabindex keyboard focusability on Preact core.
const presentation =
  /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
const previousVnode = hooks.vnode;
hooks.vnode = (vnode) => {
  if (typeof vnode.type === "string" && vnode.props) {
    const props = vnode.props as Record<string, unknown>;
    if ("tabIndex" in props && !("tabindex" in props)) {
      props["tabindex"] = props["tabIndex"];
      delete props["tabIndex"];
    }
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
 * `getSnapshot`, optional `getServerSnapshot`), on Preact core without compat.
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

export function textInput<T extends HTMLInputElement | HTMLTextAreaElement>(
  handler: (value: string) => void,
): { onInput: (event: TargetedEvent<T>) => void } {
  return { onInput: (event) => handler(event.currentTarget.value) };
}

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

export function dblClick<T extends EventTarget>(
  handler: (event: TargetedMouseEvent<T>) => void,
): { onDblClick: (event: TargetedMouseEvent<T>) => void } {
  return { onDblClick: handler };
}

// ---------------------------------------------------------------------------
// Focus events
// ---------------------------------------------------------------------------

export function focusWithin<T extends EventTarget>(
  handler: (event: TargetedFocusEvent<T>) => void,
): { onFocusIn: (event: TargetedFocusEvent<T>) => void } {
  return { onFocusIn: handler };
}

export function focusOut<T extends EventTarget>(
  handler: (event: TargetedFocusEvent<T>) => void,
): { onFocusOut: (event: TargetedFocusEvent<T>) => void } {
  return { onFocusOut: handler };
}
