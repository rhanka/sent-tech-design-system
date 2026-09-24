import { cleanup, render } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import PriorityMatrix from "./lib/PriorityMatrix.svelte";
import type { PriorityMatrixDatum } from "./lib/PriorityMatrix.svelte";

afterEach(() => {
  cleanup();
});

const data: PriorityMatrixDatum[] = [
  { x: 18, y: 82, label: "Auth SSO" },
  { x: 70, y: 70, label: "Export PDF" },
  { x: 30, y: 30, label: "Thème sombre" },
  { x: 85, y: 15, label: "Chat temps réel" },
];

describe("PriorityMatrix", () => {
  it("renders four tinted quadrants, two dashed thresholds and a title", () => {
    const { container } = render(PriorityMatrix, { props: { label: "Matrice", data } });
    expect(container.querySelectorAll(".st-priorityMatrix__quad")).toHaveLength(4);
    expect(container.querySelectorAll(".st-priorityMatrix__threshold")).toHaveLength(2);
    expect(container.querySelector(".st-priorityMatrix__title")?.textContent).toBe("Matrice de priorisation");
    const names = Array.from(container.querySelectorAll(".st-priorityMatrix__quadName")).map((n) => n.textContent);
    expect(names).toEqual(["Gains rapides", "Projets majeurs", "Attendre", "Ne pas faire"]);
  });

  it("renders one boxed label with leader per point and no literal style attribute", () => {
    const { container } = render(PriorityMatrix, { props: { label: "Matrice", data } });
    expect(container.querySelectorAll(".st-priorityMatrix__point")).toHaveLength(data.length);
    expect(container.querySelectorAll(".st-priorityMatrix__labelBox")).toHaveLength(data.length);
    expect(container.querySelectorAll(".st-priorityMatrix__leader")).toHaveLength(data.length);
    expect(container.querySelector("[style]")).toBeNull();
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
    expect(items).toHaveLength(data.length);
    expect(items[0]).toContain("Auth SSO");
  });

  it("places non-overlapping labels on the 13-point reference set", () => {
    const ref: PriorityMatrixDatum[] = [
      { x: 18, y: 82, label: "Auth SSO" },
      { x: 20, y: 80, label: "SSO SAML" },
      { x: 22, y: 79, label: "MFA" },
      { x: 68, y: 72, label: "Exports CSV" },
      { x: 70, y: 70, label: "Export PDF" },
      { x: 71, y: 69, label: "API webhooks" },
      { x: 30, y: 30, label: "Thème sombre" },
      { x: 32, y: 28, label: "Mode offline" },
      { x: 85, y: 15, label: "Chat temps réel" },
      { x: 15, y: 25, label: "Audit logs" },
      { x: 55, y: 55, label: "SSO SCIM" },
      { x: 90, y: 85, label: "IA résumés" },
      { x: 50, y: 50, label: "SSO rôles" },
    ];
    const { container } = render(PriorityMatrix, { props: { label: "Matrice", data: ref } });
    const boxes = Array.from(container.querySelectorAll(".st-priorityMatrix__labelBox")).map((el) => ({
      x: Number(el.getAttribute("x")),
      y: Number(el.getAttribute("y")),
      w: Number(el.getAttribute("width")),
      h: Number(el.getAttribute("height")),
    }));
    expect(boxes).toHaveLength(ref.length);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap).toBe(false);
      }
    }
  });
});
