<!--
  DatavizSvelteNode: recursive renderer for store-driven dataviz adapters
  (`library: "dataviz"` NodeSpec nodes) with the real
  `@sentropic/dataviz-svelte` package.

  Sibling of SvelteNode (which stays DS-only so the shared docs chunk never
  grows for the 200+ DS pages): TabbedExample lazy-imports this module only
  for demos that use dataviz adapters, keeping the dataviz weight on the
  pages that need it. Adapters unknown to dataviz-svelte (e.g.
  TimeSeriesLineChart, react-only) render an explicit unavailable block —
  never a crash — and the page states the absence in prose and tab notes.
-->
<script lang="ts">
  import {
    UrlSync,
    WebFrame,
    ScoreCard,
    DataImage,
    DashboardGrid,
    AreaChart,
    DonutChart,
    FunnelChart,
    GanttChart,
    GaugeChart,
    HeatmapChart,
    SankeyChart,
    TreemapChart
  } from "@sentropic/dataviz-svelte";
  import Self from "./DatavizSvelteNode.svelte";
  import SvelteNode from "./SvelteNode.svelte";
  import type { Component } from "svelte";
  import type { NodeSpec } from "./examples";
  import { isComponentNode, isElementNode } from "./examples";

  type AnyComponent = Component<Record<string, unknown>>;
  const dv = (comp: unknown): AnyComponent => comp as AnyComponent;

  const COMPONENTS: Record<string, AnyComponent> = {
    UrlSync: dv(UrlSync),
    WebFrame: dv(WebFrame),
    ScoreCard: dv(ScoreCard),
    DataImage: dv(DataImage),
    DashboardGrid: dv(DashboardGrid),
    AreaChart: dv(AreaChart),
    DonutChart: dv(DonutChart),
    FunnelChart: dv(FunnelChart),
    GanttChart: dv(GanttChart),
    GaugeChart: dv(GaugeChart),
    HeatmapChart: dv(HeatmapChart),
    SankeyChart: dv(SankeyChart),
    TreemapChart: dv(TreemapChart)
  };

  let { node }: { node: NodeSpec } = $props();
</script>

{#if typeof node === "string"}
  {node}
{:else if isComponentNode(node)}
  {@const Comp = node.library === "dataviz" ? COMPONENTS[node.comp] : undefined}
  {#if node.library !== "dataviz"}
    <SvelteNode {node} />
  {:else if Comp}
    {#if node.children && node.children.length}
      <Comp {...node.props}>
        {#each node.children as child, i (i)}
          <Self node={child} />
        {/each}
      </Comp>
    {:else}
      <Comp {...node.props} />
    {/if}
  {:else}
    <div class="angular-island-unavailable" role="status">
      Svelte adapter missing: {node.comp}
    </div>
  {/if}
{:else if isElementNode(node)}
  <svelte:element this={node.el} {...node.props}>
    {#each node.children ?? [] as child, i (i)}
      <Self node={child} />
    {/each}
  </svelte:element>
{/if}
