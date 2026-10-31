/**
 * The browser entry of the L2 element bundle (§6.6): importing the three
 * wrapper modules registers the custom elements (each carries its
 * `<svelte:options customElement>` tag), and `patchElementApi` then extends
 * the registered classes with the wrapper API — `element.state`,
 * `element.diagnostics`, `element.ready`. A host that needs only part of the
 * bundle imports the element modules itself; this entry exists for the
 * single-script host and the size budget's "core" group.
 *
 * Only `st-bar-chart` and its dependencies are in the CORE chunk; the two
 * semantic elements' engines load lazily on first mount (§6.6).
 */

import "./bar-chart-element.svelte";
import "./bpmn-canvas-element.svelte";
import "./decision-dossier-element.svelte";
import { patchElementApi } from "./element-api.js";

patchElementApi("st-bar-chart");
patchElementApi("st-bpmn-canvas");
patchElementApi("st-decision-dossier");
