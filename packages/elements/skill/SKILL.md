---
name: sentropic-render
description: Choose a Sentropic catalogue chart and render numeric MCP results over time or by category.
---

# Render charts from MCP results

When an MCP result reports numeric measurements over time, select `TimeSeriesChart`.
For numeric measurements grouped by category, select `BarChart`.

Use `get_schema` for the selected component when the rendering service exposes it.
Call `render_TimeSeriesChart` or `render_BarChart` when the matching tool is
advertised. If the service exposes `render` and lists the component in its
catalogue, send a JSON envelope with that component in `root.component`.

For `TimeSeriesChart`, give each series a unique `id`, a `label`, and observations
with finite `y` values and strictly increasing `x` values in whole UTC Unix epoch
milliseconds. Convert timestamps whose timezone is known before sending the data.
Use the shared temporal domain for series measured at different instants.

Use the renderer's output for the chart. In a text host, present the bounded
Markdown table. For validated temporal props the package exports
`formatTimeSeriesMarkdown`, which enforces the 4096-byte limit.

[TimeSeriesChart schema](../schemas/TimeSeriesChart.v1.json) ·
[BarChart schema](../schemas/BarChart.v1.json) ·
[Multiple-series example](../fixtures/time-series-multi.json)
