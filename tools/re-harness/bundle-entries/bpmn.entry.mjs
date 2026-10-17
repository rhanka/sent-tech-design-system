// Bundle entry: real bpmn-js Modeler (oracle). Bundled by build-bundles.mjs
// from RE_ORACLES_DIR/node_modules; the bundle itself is never committed.
// Only the library surface the harness adapter drives is exposed.
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";

window.__oracleBpmn = { Modeler };
