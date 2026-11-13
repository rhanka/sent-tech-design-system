import { h } from "vue";
export * from "./chartScaleModel.js";

export function chartDataList(label: string, items: string[]) {
  if (items.length === 0) return null;
  return h(
    "ul",
    { class: "st-chartDataList", "aria-label": `Data values for ${label}` },
    items.map((item, i) => h("li", { key: i }, item)),
  );
}
