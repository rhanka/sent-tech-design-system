// React leg, type level (`npm run check`). What the emitted React tree
// publishes must be the very types `@sentropic/dataviz-react` publishes
// today: each line below fails to compile when the two differ.
//
// Components and values are compared as whole types (`typeof X`): parameters,
// return type and static members. Never member-wise.
import type * as HandWritten from "@sentropic/dataviz-react";
import type * as Emitted from "../.react-emit/src/index.js";
import type * as EmittedCategoricalData from "../.react-emit/src/lib/categoricalData.js";
import type * as HandWrittenCategoricalData from "../../dataviz-react/src/lib/categoricalData.js";
import type * as EmittedDistributionData from "../.react-emit/src/lib/distributionData.js";
import type * as HandWrittenDistributionData from "../../dataviz-react/src/lib/distributionData.js";
import type * as EmittedPartOfWholeData from "../.react-emit/src/lib/partOfWholeData.js";
import type * as HandWrittenPartOfWholeData from "../../dataviz-react/src/lib/partOfWholeData.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

export type PropsParity = [
  Expect<Equal<Emitted.ButtonProps, HandWritten.ButtonProps>>,
  Expect<Equal<Emitted.TenantTheme, HandWritten.TenantTheme>>,
  Expect<Equal<Emitted.DrillLevel, HandWritten.DrillLevel>>,
  Expect<Equal<Emitted.DrillDatum, HandWritten.DrillDatum>>,
  Expect<Equal<Emitted.AreaChartProps, HandWritten.AreaChartProps>>,
  Expect<Equal<Emitted.ComboChartProps, HandWritten.ComboChartProps>>,
  Expect<Equal<Emitted.LollipopChartProps, HandWritten.LollipopChartProps>>,
  Expect<Equal<Emitted.StackedBarChartProps, HandWritten.StackedBarChartProps>>,
  Expect<Equal<Emitted.StepLineChartProps, HandWritten.StepLineChartProps>>,
];

export type ComponentParity = [
  Expect<Equal<typeof Emitted.AreaChart, typeof HandWritten.AreaChart>>,
  Expect<Equal<typeof Emitted.ComboChart, typeof HandWritten.ComboChart>>,
  Expect<Equal<typeof Emitted.LollipopChart, typeof HandWritten.LollipopChart>>,
  Expect<Equal<typeof Emitted.StackedBarChart, typeof HandWritten.StackedBarChart>>,
  Expect<Equal<typeof Emitted.StepLineChart, typeof HandWritten.StepLineChart>>,
];

export type ValueParity = [
  Expect<Equal<typeof Emitted.useDashboard, typeof HandWritten.useDashboard>>,
  Expect<Equal<typeof Emitted.drillLevel, typeof HandWritten.drillLevel>>,
  Expect<Equal<typeof Emitted.onDrillSelect, typeof HandWritten.onDrillSelect>>,
  Expect<Equal<typeof Emitted.drillDepth, typeof HandWritten.drillDepth>>,
];

export type InternalHelpersParity = [
  Expect<Equal<typeof EmittedCategoricalData, typeof HandWrittenCategoricalData>>,
  Expect<Equal<EmittedCategoricalData.SimpleCategoricalDatum, HandWrittenCategoricalData.SimpleCategoricalDatum>>,
  Expect<Equal<EmittedCategoricalData.SimpleCategoricalPoint, HandWrittenCategoricalData.SimpleCategoricalPoint>>,
  Expect<Equal<EmittedCategoricalData.StackedMode, HandWrittenCategoricalData.StackedMode>>,
  Expect<Equal<typeof EmittedPartOfWholeData, typeof HandWrittenPartOfWholeData>>,
  Expect<Equal<EmittedPartOfWholeData.HierarchyDatum, HandWrittenPartOfWholeData.HierarchyDatum>>,
  Expect<Equal<EmittedPartOfWholeData.TreemapDatum, HandWrittenPartOfWholeData.TreemapDatum>>,
  Expect<Equal<typeof EmittedDistributionData, typeof HandWrittenDistributionData>>,
];

// The emitted barrel publishes no value the hand-written package keeps internal.
export type NoExtraExport = Expect<Equal<Exclude<keyof typeof Emitted, keyof typeof HandWritten>, never>>;
