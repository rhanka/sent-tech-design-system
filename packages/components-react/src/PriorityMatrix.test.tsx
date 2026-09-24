import React from "react";
import { render } from "@testing-library/react";
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
    const { container } = render(<PriorityMatrix label="Matrice" data={data} />);
    expect(container.querySelectorAll(".st-priorityMatrix__quad")).toHaveLength(4);
    expect(container.querySelectorAll(".st-priorityMatrix__threshold")).toHaveLength(2);
    expect(container.querySelector(".st-priorityMatrix__title")?.textContent).toBe("Matrice de priorisation");
    const names = Array.from(container.querySelectorAll(".st-priorityMatrix__quadName")).map((n) => n.textContent);
    expect(names).toEqual(["Gains rapides", "Projets majeurs", "Attendre", "Ne pas faire"]);
  });

  it("renders one boxed label with leader per point and no literal style attribute", () => {
    const { container } = render(<PriorityMatrix label="Matrice" data={data} />);
    expect(container.querySelectorAll(".st-priorityMatrix__point")).toHaveLength(data.length);
    expect(container.querySelectorAll(".st-priorityMatrix__labelBox")).toHaveLength(data.length);
    expect(container.querySelectorAll(".st-priorityMatrix__leader")).toHaveLength(data.length);
    expect(container.querySelector("[style]")).toBeNull();
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
    expect(items).toHaveLength(data.length);
    expect(items[0]).toContain("Auth SSO");
  });
});
