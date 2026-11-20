// React leg, type level (`npm run check`). What the emitted React tree
// publishes must be the very types `@sentropic/dataviz-react` publishes
// today: each line below fails to compile when the two differ.
//
// Components and values are compared as whole types (`typeof X`): parameters,
// return type and static members. Never member-wise.
import type * as HandWritten from "@sentropic/dataviz-react";
import type * as Emitted from "../.react-emit/src/index.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

export type PropsParity = [];

export type ComponentParity = [];

export type ValueParity = [];

// The emitted barrel publishes no value the hand-written package keeps internal.
export type NoExtraExport = Expect<Equal<Exclude<keyof typeof Emitted, keyof typeof HandWritten>, never>>;
