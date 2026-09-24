import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { PriorityMatrix } from "./index.js";
import type { PriorityMatrixDatum } from "./PriorityMatrix.js";

const data: PriorityMatrixDatum[] = [
  { x: 18, y: 82, label: "Auth SSO" },
  { x: 70, y: 70, label: "Export PDF" },
  { x: 30, y: 30, label: "Thème sombre" },
  { x: 85, y: 15, label: "Chat temps réel" },
];

describe("PriorityMatrix (parity with Svelte)", () => {
  it("renders four tinted quadrants, two dashed thresholds and a title", () => {
    const wrapper = mount(PriorityMatrix, { props: { label: "Matrice", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-priorityMatrix__quad")).toHaveLength(4);
    expect(el.querySelectorAll(".st-priorityMatrix__threshold")).toHaveLength(2);
    expect(el.querySelector(".st-priorityMatrix__title")?.textContent).toBe("Matrice de priorisation");
    const names = Array.from(el.querySelectorAll(".st-priorityMatrix__quadName")).map((n) => n.textContent);
    expect(names).toEqual(["Gains rapides", "Projets majeurs", "Attendre", "Ne pas faire"]);
  });

  it("renders one boxed label with leader per point and no literal style attribute", () => {
    const wrapper = mount(PriorityMatrix, { props: { label: "Matrice", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-priorityMatrix__point")).toHaveLength(data.length);
    expect(el.querySelectorAll(".st-priorityMatrix__labelBox")).toHaveLength(data.length);
    expect(el.querySelectorAll(".st-priorityMatrix__leader")).toHaveLength(data.length);
    expect(el.querySelector("[style]")).toBeNull();
    const items = Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
    expect(items).toHaveLength(data.length);
    expect(items[0]).toContain("Auth SSO");
  });

  it("clamps non-finite values instead of rendering NaN", () => {
    const bad: PriorityMatrixDatum[] = [
      { x: NaN, y: 82, label: "Bad X" },
      { x: 20, y: Infinity, label: "Bad Y" },
    ];
    const wrapper = mount(PriorityMatrix, { props: { label: "Matrice", data: bad } });
    const el = wrapper.element as HTMLElement;
    expect(el.innerHTML).not.toContain("NaN");
    const circles = Array.from(el.querySelectorAll(".st-priorityMatrix__point"));
    expect(circles).toHaveLength(bad.length);
    for (const c of circles) {
      expect(Number.isFinite(Number(c.getAttribute("cx")))).toBe(true);
      expect(Number.isFinite(Number(c.getAttribute("cy")))).toBe(true);
    }
    const items = Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent ?? "");
    expect(items.join(" ")).not.toContain("NaN");
  });
});
