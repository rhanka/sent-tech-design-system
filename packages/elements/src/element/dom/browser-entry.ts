/**
 * The browser entry of the element bundle (§6.6): importing the
 * wrapper modules registers the custom elements (each carries its
 * `<svelte:options customElement>` tag), and `patchElementApi` then extends
 * the registered classes with the wrapper API — `element.state`,
 * `element.diagnostics`, `element.ready`. A host that needs only part of the
 * bundle imports the element modules itself; this entry exists for the
 * single-script host and the size budget's "core" group.
 *
 * The chart renderers are in the core chunk. The semantic elements'
 * engines load lazily on first mount (§6.6).
 */

import "./bar-chart-element.svelte";
import "./bpmn-canvas-element.svelte";
import "./decision-dossier-element.svelte";
import "./time-series-chart-element.svelte";
import { patchElementApi } from "./element-api.js";

patchElementApi("st-bar-chart");
patchElementApi("st-bpmn-canvas");
patchElementApi("st-decision-dossier");
patchElementApi("st-time-series-chart");
