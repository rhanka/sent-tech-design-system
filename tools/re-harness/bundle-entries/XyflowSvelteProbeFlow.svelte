<script>
  // Wrapper around the REAL SvelteFlow (harness code, observers only).
  // Bindings are forwarded with the real component's own fallbacks
  // (nodes/edges [] and viewport undefined), so an example that does not
  // bind them behaves exactly as with the real component. Callbacks the
  // example passes are wrapped to journal their arguments and then call
  // the example's handler; oninit/onconnect/onnodedragstart/onnodedragstop
  // observers are added when absent (they have no effect on the library).
  import { SvelteFlow } from "@xyflow/svelte";
  import XyflowSvelteProbe from "./XyflowSvelteProbe.svelte";
  import { journal, nextFlowIndex } from "./xyflow-instrument.mjs";

  let { nodes = $bindable([]), edges = $bindable([]), viewport = $bindable(undefined), children, ...rest } = $props();
  const flow = nextFlowIndex();
  const OBSERVED = ["oninit", "onconnect", "onnodedragstart", "onnodedragstop"];
  // One STABLE wrapper per callback name for the whole mount (a fresh
  // function on every change would be re-applied to the store): it
  // journals, then calls the example's current handler, if any.
  const stable = new Map();
  const wrapperFor = (name) => {
    if (!stable.has(name)) {
      stable.set(name, (...args) => {
        journal(flow, name, args);
        const current = rest[name];
        return typeof current === "function" ? current(...args) : undefined;
      });
    }
    return stable.get(name);
  };
  const wrapped = $derived.by(() => {
    const out = {};
    for (const [name, value] of Object.entries(rest)) {
      out[name] = name.startsWith("on") && typeof value === "function" ? wrapperFor(name) : value;
    }
    for (const name of OBSERVED) if (!(name in out)) out[name] = wrapperFor(name);
    return out;
  });
</script>

<SvelteFlow bind:nodes bind:edges bind:viewport {...wrapped}>
  <XyflowSvelteProbe {flow} />
  {@render children?.()}
</SvelteFlow>
