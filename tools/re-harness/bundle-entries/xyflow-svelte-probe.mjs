// Probe shim for @xyflow/svelte, substituted for "@xyflow/svelte" ONLY in
// the example sources. Everything is re-exported unchanged except
// SvelteFlow, replaced by a wrapper that renders the REAL SvelteFlow with
// the same props and bindings plus a store probe child.
export * from "@xyflow/svelte";
export { default as SvelteFlow } from "./XyflowSvelteProbeFlow.svelte";
