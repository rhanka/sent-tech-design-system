// React leg, type level (`npm run check`). What the emitted React tree
// publishes must be the very types `@sentropic/design-system-react` publishes
// today: each line below fails to compile when the two differ.
//
// Components and values are compared as whole types (`typeof X`): parameters,
// return type and static members. Comparing `Parameters<typeof X>` only would
// let a return-type divergence through.
import type * as HandWritten from "@sentropic/design-system-react";
import type * as Emitted from "../.react-emit/src/index.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

export type PropsParity = [
  Expect<Equal<Emitted.ButtonProps, HandWritten.ButtonProps>>,
  Expect<Equal<Emitted.ButtonSize, HandWritten.ButtonSize>>,
  Expect<Equal<Emitted.ButtonVariant, HandWritten.ButtonVariant>>,
  Expect<Equal<Emitted.InputProps, HandWritten.InputProps>>,
  Expect<Equal<Emitted.InputSize, HandWritten.InputSize>>,
  Expect<Equal<Emitted.ModalProps, HandWritten.ModalProps>>,
  Expect<Equal<Emitted.TabsProps, HandWritten.TabsProps>>,
  Expect<Equal<Emitted.TabItem, HandWritten.TabItem>>,
  Expect<Equal<Emitted.SelectableRowProps, HandWritten.SelectableRowProps>>,
  Expect<Equal<Emitted.SelectableListContextValue, HandWritten.SelectableListContextValue>>,
  Expect<Equal<Emitted.ChatComposerProps, HandWritten.ChatComposerProps>>,
  Expect<Equal<Emitted.PortalProps, HandWritten.PortalProps>>,
  Expect<Equal<Emitted.ThemeProviderProps, HandWritten.ThemeProviderProps>>,
];

export type ComponentParity = [
  Expect<Equal<typeof Emitted.Button, typeof HandWritten.Button>>,
  Expect<Equal<typeof Emitted.Input, typeof HandWritten.Input>>,
  Expect<Equal<typeof Emitted.SelectableRow, typeof HandWritten.SelectableRow>>,
  Expect<Equal<typeof Emitted.Modal, typeof HandWritten.Modal>>,
  Expect<Equal<typeof Emitted.Tabs, typeof HandWritten.Tabs>>,
  Expect<Equal<typeof Emitted.ChatComposer, typeof HandWritten.ChatComposer>>,
  Expect<Equal<typeof Emitted.Portal, typeof HandWritten.Portal>>,
  Expect<Equal<typeof Emitted.ThemeProvider, typeof HandWritten.ThemeProvider>>,
];

export type ValueParity = [
  Expect<Equal<typeof Emitted.SelectableListContext, typeof HandWritten.SelectableListContext>>,
  Expect<Equal<typeof Emitted.resolvePortalTarget, typeof HandWritten.resolvePortalTarget>>,
];

// The emitted barrel publishes no value the hand-written package keeps
// internal. Type-only exports are covered by `PropsParity`: a type the
// hand-written package does not export fails to resolve there.
export type NoExtraExport = Expect<Equal<Exclude<keyof typeof Emitted, keyof typeof HandWritten>, never>>;
