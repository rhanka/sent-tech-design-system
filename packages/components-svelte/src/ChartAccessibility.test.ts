import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AreaChart from "./lib/AreaChart.svelte";
import BarChart from "./lib/BarChart.svelte";
import DonutChart from "./lib/DonutChart.svelte";
import LineChart from "./lib/LineChart.svelte";
import ScatterPlot from "./lib/ScatterPlot.svelte";
import StackedBarChart from "./lib/StackedBarChart.svelte";

type ChartCase = {
  name: string;
  component: Parameters<typeof render>[0];
  label: string;
  props: Record<string, unknown>;
  expectedItems: string[];
};

const chartCases: ChartCase[] = [
  {
    name: "AreaChart",
    component: AreaChart,
    label: "Area usage",
    props: { data: [{ x: "Jan", y: 10 }, { x: "Feb", y: 20 }] },
    expectedItems: ["Jan: 10", "Feb: 20"]
  },
  {
    name: "BarChart",
    component: BarChart,
    label: "Bar usage",
    props: { data: [{ label: "Search", value: 12 }, { label: "Shell", value: 7 }] },
    expectedItems: ["Search: 12", "Shell: 7"]
  },
  {
    name: "DonutChart",
    component: DonutChart,
    label: "Donut usage",
    props: { data: [{ label: "Tokens", value: 1 }, { label: "Docs", value: 1 }] },
    expectedItems: ["Tokens: 1 (50%)", "Docs: 1 (50%)"]
  },
  {
    name: "LineChart",
    component: LineChart,
    label: "Line usage",
    props: { data: [{ x: "Mon", y: 3 }, { x: "Tue", y: 5 }] },
    expectedItems: ["Mon: 3", "Tue: 5"]
  },
  {
    name: "ScatterPlot",
    component: ScatterPlot,
    label: "Scatter usage",
    props: { data: [{ x: 1, y: 2, label: "A" }, { x: 3, y: 4 }] },
    expectedItems: ["A: x 1, y 2", "x 3, y 4"]
  },
  {
    name: "StackedBarChart",
    component: StackedBarChart,
    label: "Stacked usage",
    props: {
      data: [
        {
          label: "Q1",
          segments: [{ label: "Components", value: 20 }, { label: "Docs", value: 8 }]
        }
      ]
    },
    expectedItems: ["Q1, Components: 20", "Q1, Docs: 8"]
  }
];

describe("chart accessibility", () => {
  it.each(chartCases)("$name keeps SVG decorative and exposes data values", ({ component, label, props, expectedItems }) => {
    const { container } = render(component, { props: { ...props, label } });

    expect(screen.getByRole("img", { name: label })).toBeTruthy();
    expect(container.querySelectorAll('svg[aria-hidden="true"] [tabindex], svg[aria-hidden="true"] [role]')).toHaveLength(0);

    const dataList = screen.getByRole("list", { name: `Data values for ${label}` });
    for (const item of expectedItems) {
      expect(within(dataList).getByText(item)).toBeTruthy();
    }
  });
});
