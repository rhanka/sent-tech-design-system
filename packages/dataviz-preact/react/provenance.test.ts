// React leg only. Proves that the existing `dataviz-react` tests of this run
// exercise the modules EMITTED from the single JSX source, not their
// hand-written twins: the module-level switch of `vitest.react.config.ts`
// applies to importers inside `dataviz-react/src`, so the barrel resolves to
// the emission while this file can still reach the hand-written module.
import { describe, expect, it } from "vitest";
import * as barrel from "../../dataviz-react/src/index.js";
import * as handWrittenAdapter from "../../dataviz-react/src/adapter.js";
import * as handWrittenAreaChart from "../../dataviz-react/src/lib/AreaChart.js";
import * as handWrittenComboChart from "../../dataviz-react/src/lib/ComboChart.js";
import * as handWrittenDrill from "../../dataviz-react/src/lib/drill.js";
import * as handWrittenLollipopChart from "../../dataviz-react/src/lib/LollipopChart.js";
import * as handWrittenStackedBarChart from "../../dataviz-react/src/lib/StackedBarChart.js";
import * as handWrittenStepLineChart from "../../dataviz-react/src/lib/StepLineChart.js";
import * as handWrittenCategoricalData from "../../dataviz-react/src/lib/categoricalData.js";
import * as handWrittenDistributionData from "../../dataviz-react/src/lib/distributionData.js";
import * as handWrittenPartOfWholeData from "../../dataviz-react/src/lib/partOfWholeData.js";
import * as emitted from "../.react-emit/src/index.js";
import * as emittedCategoricalData from "../.react-emit/src/lib/categoricalData.js";
import * as emittedDistributionData from "../.react-emit/src/lib/distributionData.js";
import * as emittedPartOfWholeData from "../.react-emit/src/lib/partOfWholeData.js";

const switched = [
  "useDashboard",
  "drillLevel",
  "onDrillSelect",
  "drillDepth",
  "AreaChart",
  "ComboChart",
  "LollipopChart",
  "StackedBarChart",
  "StepLineChart",
] as const;

const handWritten: Record<(typeof switched)[number], unknown> = {
  useDashboard: handWrittenAdapter.useDashboard,
  drillLevel: handWrittenDrill.drillLevel,
  onDrillSelect: handWrittenDrill.onDrillSelect,
  drillDepth: handWrittenDrill.drillDepth,
  AreaChart: handWrittenAreaChart.AreaChart,
  ComboChart: handWrittenComboChart.ComboChart,
  LollipopChart: handWrittenLollipopChart.LollipopChart,
  StackedBarChart: handWrittenStackedBarChart.StackedBarChart,
  StepLineChart: handWrittenStepLineChart.StepLineChart,
};

describe("dataviz React leg provenance", () => {
  for (const name of switched) {
    it(`the dataviz-react barrel serves the emitted ${name}`, () => {
      expect(emitted[name]).toBeTruthy();
      expect(barrel[name]).toBe(emitted[name]);
      expect(barrel[name]).not.toBe(handWritten[name]);
    });
  }

  it("internal derivation helpers emit distinct module instances ready for React-leg switching", () => {
    expect(emittedCategoricalData.buildSafeCategoricalSeries).not.toBe(handWrittenCategoricalData.buildSafeCategoricalSeries);
    expect(emittedPartOfWholeData.buildSafePartWholeModel).not.toBe(handWrittenPartOfWholeData.buildSafePartWholeModel);
    expect(emittedDistributionData.buildHistogramData).not.toBe(handWrittenDistributionData.buildHistogramData);
  });
});
