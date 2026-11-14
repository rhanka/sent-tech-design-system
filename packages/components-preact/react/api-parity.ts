// React leg, type level (`npm run check`). The props published by the emitted
// React tree must be the very types `@sentropic/design-system-react` publishes
// today: each line below fails to compile when the two differ.
import type * as HandWritten from "@sentropic/design-system-react";
import type * as Emitted from "../.react-emit/src/index.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

export type PropsParity = [
  Expect<Equal<Emitted.ButtonProps, HandWritten.ButtonProps>>,
  Expect<Equal<Emitted.InputProps, HandWritten.InputProps>>,
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
  Expect<Equal<Parameters<typeof Emitted.Modal>, Parameters<typeof HandWritten.Modal>>>,
  Expect<Equal<Parameters<typeof Emitted.Tabs>, Parameters<typeof HandWritten.Tabs>>>,
  Expect<Equal<Parameters<typeof Emitted.ChatComposer>, Parameters<typeof HandWritten.ChatComposer>>>,
  Expect<Equal<Parameters<typeof Emitted.Portal>, Parameters<typeof HandWritten.Portal>>>,
  Expect<Equal<Parameters<typeof Emitted.ThemeProvider>, Parameters<typeof HandWritten.ThemeProvider>>>,
];
