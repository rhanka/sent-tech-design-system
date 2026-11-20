import { existsSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

// React leg: the unmodified test files of `dataviz-react` run against the
// React tree emitted from the single JSX source (`npm run emit:react`).
const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(here, "..");
const handWritten = resolve(packagesDir, "dataviz-react/src");
const emitted = resolve(here, ".react-emit/src");

/**
 * Module-level switch. Inside the hand-written `dataviz-react/src` tree (both
 * root `src/` and `src/lib/`), a relative import of `./...js` or `../...js`
 * resolves to the emitted module whenever the emission holds one at that
 * relative path. `index.ts` stays the hand-written barrel so unported exports
 * still load alongside the emitted modules under test.
 */
function emittedReactModules(): Plugin {
  return {
    name: "st-dataviz-emitted-react-modules",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer) return null;
      const cleanImporter = importer.split("?")[0];
      const relImporter = relative(handWritten, cleanImporter);
      if (relImporter.startsWith("..") || relImporter === "") return null;
      if (!source.startsWith("./") && !source.startsWith("../")) return null;
      if (!source.endsWith(".js")) return null;
      const target = resolve(dirname(cleanImporter), source);
      const relTarget = relative(handWritten, target).split(sep).join("/");
      if (relTarget.startsWith("..") || relTarget === "index.js") return null;
      const stem = relTarget.slice(0, -3);
      for (const extension of [".tsx", ".ts"]) {
        const candidate = resolve(emitted, stem + extension);
        if (existsSync(candidate)) return candidate;
      }
      return null;
    },
  };
}

/** Existing `dataviz-react` test files (relative to `dataviz-react/src`) that exercise an emitted module. */
const reactTests: string[] = [
  "index.test.ts", // emitted adapter.ts (useDashboard + core re-exports)
  "lib/drill.test.tsx", // emitted lib/drill.ts (drillLevel, onDrillSelect, drillDepth)
  "lib/CategoricalCharts.test.tsx", // emitted AreaChart, ComboChart, LollipopChart, StackedBarChart, StepLineChart + categoricalData
  "lib/CrossfilteredBarChart.test.tsx", // emitted CrossfilteredBarChart (vertical DS BarChart + horizontal SVG)
  "lib/TimeSeriesLineChart.test.tsx", // emitted TimeSeriesLineChart (native SVG time-series)
  "lib/DivergingBarChart.test.tsx", // emitted DivergingBarChart
  "lib/ParetoChart.test.tsx", // emitted ParetoChart
  "lib/DateHistogramChart.test.tsx", // emitted DateHistogramChart
];

export default defineConfig({
  root: packagesDir,
  cacheDir: resolve(here, "node_modules/.vite-react-leg"),
  plugins: [emittedReactModules()],
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    environment: "jsdom",
    setupFiles: [resolve(packagesDir, "dataviz-react/vitest-setup.ts")],
    testTimeout: 20000,
    include: [
      ...reactTests.map((name) => `dataviz-react/src/${name}`),
      // React-leg checks of this package: provenance and adapter twins.
      "dataviz-preact/react/*.test.{ts,tsx}",
    ],
  },
});
