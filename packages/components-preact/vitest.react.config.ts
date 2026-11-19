import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

// React leg: the unmodified test files of `components-react` run against the
// React tree emitted from the single JSX source (`npm run emit:react`).
const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(here, "..");
const handWritten = resolve(packagesDir, "components-react/src");
const emitted = resolve(here, ".react-emit/src");

/**
 * Module-level switch. Inside the hand-written React tree, an import of
 * `./<Module>.js` resolves to the emitted module whenever the emission holds
 * one of that name. `index.ts`, the tests and every hand-written dependent
 * (for example `SelectableList` reading the contexts of `SelectableRow`) then
 * share the emitted module, exactly as they would once the hand-written file
 * is deleted.
 */
function emittedReactModules(): Plugin {
  return {
    name: "st-emitted-react-modules",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || dirname(importer.split("?")[0]) !== handWritten) return null;
      const match = /^\.\/([A-Za-z0-9_-]+)\.js$/.exec(source);
      // The barrel stays the hand-written one: it is the public surface under test.
      if (!match || match[1] === "index") return null;
      for (const extension of [".tsx", ".ts"]) {
        const candidate = resolve(emitted, match[1] + extension);
        if (existsSync(candidate)) return candidate;
      }
      return null;
    },
  };
}

/** Existing `components-react` test files that exercise an emitted module. */
const reactTests = [
  "ChoiceSearchExtensions", // emitted Checkbox (description/trailing) + Search (fluid)
  "behavior", // Tabs keyboard, Modal focus trap / scroll lock / Escape
  "catalog", // Tabs, Modal, ChatComposer, Button in the catalogue render
  "index", // DS class contract of every component, the six included
  "svelte-api-parity", // Tabs `onchange` alias
  "SelectableRow", // forwardRef + context witness
  "SelectableList", // hand-written list driving the emitted row through context
  "Positioning", // Portal and Popper (both emitted, P5 group 1)
  "GroupsIdentity", // ButtonGroup around the emitted Button
  "NavActionStack", // hand-written dependent of Button
  "NavItem", // hand-written dependent of SelectableRow
  "TimeRangePicker", // hand-written dependent of Button, Input, SelectableRow
  "TimeRangePicker.states",
  "MenuPopover", // hand-written menus on the emitted Portal + emitted P3 host (children mode) of the emitted TimeRangePicker
  "Layout", // Flex, Stack, Inline, Container, Row, Col, Grid, Hidden, Divider
  "ErrorSummary", // emitted P1 feedback module
  "FieldCard", // emitted P1 layout module
  "StatusDot", // emitted P1 feedback module
  "Timeline", // emitted P1 feedback module
  "PanelStack", // emitted PanelStack + PanelSection pair (P4c dependency of P1)
  "Icon", // emitted P4c group-1 icon set (names, strokeWidth token, glyph)
  "Overline", // emitted P4c group-1 overline (`as`, className, rest props)
  "Specialized", // emitted Rating + Autosave (sole components-react suite for both)
  "NavSection", // emitted P5 group-1 NavSection on emitted Collapsible (trailing, open, aria-label)
  "parity-0.3.0", // emitted Notification via the parity suite (onDismiss)
  "RangeSlider", // emitted P2 form module
  "MenuCascade", // emitted Menu cascade, hover-intent and safe-triangle behaviour
  "Shell", // emitted Menu exercised through the Shell suite
  "AppChrome", // emitted P4c group-2 chrome (role filter, theme/color/locale, drawer)
  "AppShell.panelCollapse", // emitted P4c group-2 shell (accordion disclosures)
  "AppShell.panelResize", // emitted P4c group-2 shell (handles, keyboard, clamps)
  "ColorSwatch", // emitted P3 data module (chip sizing / aria-label derivation)
  "TreeViewSelect", // emitted P3 TreeView selection payloads
  "TreeViewAccessibleName", // emitted P3 TreeView accessible-name precedence
  "AnomalySwimLaneChart", // emitted P4a chart (cells, legend, tooltip)
  "ArcDiagramChart", // emitted P4a chart (arcs, nodes, legend)
  "AreaRangeChart", // emitted P4a chart (band geometry, tooltip)
  "AreaSplineRangeChart", // emitted P4a chart (smoothed band, tooltip)
  "BarChart", // emitted P4a chart (bars, overlays, filter chips)
  "BellCurveChart", // emitted P4a chart (curve, stats list, tooltip)
  "CandlestickChart", // emitted P4a chart (candles, keyboard nav, tooltip)
  "ColorScaleBar", // emitted P4a module (gradient style, end labels)
  "ColumnPyramidChart", // emitted P4a group-2 chart (pyramids, grid, tooltip)
  "ColumnRangeChart", // emitted P4a group-2 chart (ranges, grid, tooltip)
  "ComboCharts", // emitted P4a group-2 chart (bars + lines, legend, crosshair)
  "ConfigItemCard", // emitted P4a group-2 card (system badge, actions)
  "ContourChart", // emitted P4a group-2 chart (contours, legend, tooltip)
  "DecompositionTreeChart", // emitted P4a group-2 chart (tree, nodes, tooltip)
  "Density2DChart", // emitted P4a group-2 chart (density, legend, tooltip)
  "DependencyWheelChart", // emitted P4a group-2 chart (wheel, arcs, tooltip)
  "DivergentBarChart", // emitted P4a group-2 chart (diverging bars, legend, tooltip)
  "DumbbellChart", // emitted P4a group-2 chart (dumbbells, grid, tooltip)
  "EmbedDataImage", // emitted P4a group-2 image (object-fit, radius)
  "ErrorBarChart", // emitted P4a group-2 chart (error bars, grid, tooltip)
  "EventFeedPanel", // emitted P4a group-2 feed (severity tones, ordering)
  "FlamegraphChart", // emitted P4a group-3 chart (icicle cells, tooltip)
  "GanttChart", // emitted P4a group-3 chart (task bars, marker, legend)
  "GeoChart", // emitted P4a group-3 map (layers, projection)
  "HLCChart", // emitted P4a group-3 chart (ranges, close ticks, tooltip)
  "HeikinAshiChart", // emitted P4a group-3 chart (HA candles, tooltip)
  "HollowCandlestickChart", // emitted P4a group-3 chart (hollow bodies, tooltip)
  "ItemChart", // emitted P4a group-3 chart (hemicycle seats, legend)
  "LineChart", // emitted P4b group-1 chart (line, overlays, keyboard nav)
  "LollipopParetoChart", // emitted P4b group-1 charts (lollipops, pareto bars + line)
  "OrganizationChart", // emitted P4b group-1 chart (tree nodes, links)
  "PointAndFigureChart", // emitted P4b group-1 chart (X/O columns, tooltip)
  "PolygonChart", // emitted P4b group-1 chart (radar polygon, vertices, tooltip)
  "PriorityMatrix", // emitted P4b group-1 matrix (quadrants, labels, thresholds)
  "RenkoChart", // emitted P4b group-1 chart (renko bricks, tooltip)
  "RibbonChart", // emitted P4b group-1 chart (period ribbons, legend, tooltip)
  "ScoreCard", // emitted P4b group-2 card (stars, complexity cross, aria-label)
  "SolidGaugeChart", // emitted P4b group-2 gauge (meter, thresholds, clamp)
  "StateTimelineChart", // emitted P4b group-2 timeline (lanes, tones, legend)
  "StatusHistoryChart", // emitted P4b group-2 grid (cells, tones, legend)
  "StepLineChart", // emitted P4b group-2 chart (steps, dots, tooltip)
  "StreamgraphChart", // emitted P4b group-2 chart (stacked areas, legend, totals)
  "TileMapChart", // emitted P4b group-3 chart (tiles, tones, tooltip)
  "TimelineChart", // emitted P4b group-3 chart (markers, connectors, tooltip)
  "TraceWaterfallChart", // emitted P4b group-3 chart (spans, hierarchy, legend)
  "TreegraphChart", // emitted P4b group-3 chart (nodes, links)
  "VariablePieChart", // emitted P4b group-3 chart (sectors, radii, tooltip)
  "VectorFieldChart", // emitted P4b group-3 chart (arrows, tooltip)
  "VennChart", // emitted P4b group-3 chart (circles, regions, tooltip)
  "WaffleChart", // emitted P4b group-3 chart (cells, legend)
  "WindBarbChart", // emitted P4b group-3 chart (barbs, feathers, tooltip)
  "WordCloudChart", // emitted P4b group-3 chart (words, spiral layout, tooltip)
  "charts", // shared P4a chart domains (AreaChart, DataTable, DonutChart, BarChart)
  "charts2", // shared P4a chart domains (FunnelChart, GaugeChart)
  "charts3", // shared P4a chart domains (HistogramChart, BoxPlotChart, HeatmapChart)
  "charts4", // shared P4a/Violin chart domains (RoseChart, ViolinChart)
  "BiCharts3", // shared P4a chart domains (Candlestick, CalendarHeatmap, Bullet, Bump)
  "ChartAnnotations", // shared annotations over AreaChart/BarChart (P4a)
  "ChartAxisConfig", // shared axis config over BarChart (P4a)
  "chartCrosshair", // shared crosshair over AreaChart/BarChart (P4a)
  "ChartDataLabels", // shared data labels over AreaChart/BarChart/DonutChart (P4a)
  "DatapointNav", // shared datapoint nav over AreaChart/BarChart (P4a)
  "LegendToggle", // shared legend toggle over ComboChart (P4a)
  "Filters", // shared FilterBar/FilterPill suite (P4a group-3)
  "ConditionalFormatting", // shared DataTable/cellDecoration suite (P4a)
  "ChordPackedBubbles", // shared ChordDiagram suite (P4a group-1)
  "OHLCChart", // shared OHLC chartAnnotations suite (P4a helpers)
  "ScatterPlot", // shared ScatterPlot chartAnnotations suite (P4a helpers)
  "ChartForecastCluster", // LineChart forecast mode + ScatterPlot size/tone/centroids (P4b)
  "CheckboxCentring", // CSS contract for Checkbox vertical centring (0 skipped React suites)
  "PaginationActiveHover", // CSS contract for Pagination hovered active page (0 skipped React suites)
];

/** `components-react` suites whose test file is `.test.ts` (not `.test.tsx`). */
const reactTestTs = [
  "menu-cascade", // pure solver of the emitted menu-cascade helper (Svelte parity)
  "priorityLabels", // golden vector for the emitted priorityLabels helper (P4b)
];

export default defineConfig({
  root: packagesDir,
  cacheDir: resolve(here, "node_modules/.vite-react-leg"),
  plugins: [emittedReactModules()],
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    environment: "jsdom",
    testTimeout: 20000,
    include: [
      ...reactTests.map((name) => `components-react/src/${name}.test.tsx`),
      ...reactTestTs.map((name) => `components-react/src/${name}.test.ts`),
      // React-leg checks of this package: provenance, and the adapter paths that
      // no `components-react` test reaches (text input, focus inside a row).
      "components-preact/react/*.test.{ts,tsx}",
    ],
  },
});
