import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import StateTimelineChart from "./lib/StateTimelineChart.svelte";

// Une lane par series, segments contigus d'états sur un axe temporel commun.
const services = [
  {
    series: "API",
    segments: [
      { start: 0, end: 6, state: "OK", tone: "success" as const },
      { start: 6, end: 9, state: "Degraded", tone: "warning" as const },
      { start: 9, end: 24, state: "OK", tone: "success" as const }
    ]
  },
  {
    series: "DB",
    segments: [
      { start: 0, end: 14, state: "OK", tone: "success" as const },
      { start: 14, end: 17, state: "Down", tone: "error" as const },
      { start: 17, end: 24, state: "OK", tone: "success" as const }
    ]
  }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StateTimelineChart", () => {
  it("renders one contiguous segment per state, across all lanes", () => {
    const { container } = render(StateTimelineChart, {
      props: { label: "Disponibilité", data: services }
    });
    expect(screen.getByRole("img")).toBeTruthy();
    // 3 + 3 = 6 segments au total.
    expect(container.querySelectorAll(".st-stateTimelineChart__segment").length).toBe(6);
  });

  it("colours segments by explicit tone and renders a state legend", () => {
    const { container } = render(StateTimelineChart, {
      props: { label: "Disponibilité", data: services }
    });
    expect(container.querySelector(".st-stateTimelineChart__segment--success")).toBeTruthy();
    expect(container.querySelector(".st-stateTimelineChart__segment--warning")).toBeTruthy();
    expect(container.querySelector(".st-stateTimelineChart__segment--error")).toBeTruthy();
    // États distincts : OK, Degraded, Down → 3 items de légende.
    expect(container.querySelectorAll(".st-stateTimelineChart__legendItem").length).toBe(3);
  });

  it("derives a stable categoryN tone per state when no tone is given", () => {
    const { container } = render(StateTimelineChart, {
      props: {
        label: "Phases",
        data: [
          {
            series: "Lane",
            segments: [
              { start: 0, end: 5, state: "boot" },
              { start: 5, end: 10, state: "run" },
              { start: 10, end: 15, state: "boot" }
            ]
          }
        ]
      }
    });
    const segments = container.querySelectorAll(".st-stateTimelineChart__segment");
    // boot → category1, run → category2, boot → category1 (ordre d'apparition).
    expect(segments[0].classList.contains("st-stateTimelineChart__segment--category1")).toBe(true);
    expect(segments[1].classList.contains("st-stateTimelineChart__segment--category2")).toBe(true);
    expect(segments[2].classList.contains("st-stateTimelineChart__segment--category1")).toBe(true);
  });

  it("offsets each segment by its start (x0 = start, width = end - start)", () => {
    const { container } = render(StateTimelineChart, { props: { label: "P", data: services } });
    const segments = container.querySelectorAll<SVGRectElement>(".st-stateTimelineChart__segment");
    const x0 = Number(segments[0].getAttribute("x"));
    const x1 = Number(segments[1].getAttribute("x"));
    // Le 2e segment (start 6) commence après le 1er (start 0).
    expect(x1).toBeGreaterThan(x0);
    // Le 3e segment (durée 15) est plus large que le 1er (durée 6).
    const w0 = Number(segments[0].getAttribute("width"));
    const w2 = Number(segments[2].getAttribute("width"));
    expect(w2).toBeGreaterThan(w0);
  });

  it("normalises start > end and summarises the lane in the accessible list", () => {
    const { container } = render(StateTimelineChart, {
      props: {
        label: "P",
        data: [{ series: "Inversée", segments: [{ start: 9, end: 4, state: "X" }] }]
      }
    });
    const items = listItems(container);
    expect(items[0]).toBe("Inversée: X [4 → 9]");
  });

  it("drops non-finite segments and unlabeled lanes before rendering", () => {
    const { container } = render(StateTimelineChart, {
      props: {
        label: "Filtré",
        data: [
          { series: "", segments: [{ start: 1, end: 2, state: "A" }] },
          {
            series: "Ok",
            segments: [
              { start: Number.NaN, end: 5, state: "bad" },
              { start: 2, end: 6, state: "good" }
            ]
          }
        ]
      }
    });
    // La lane sans libellé est supprimée ; le segment NaN aussi → 1 segment restant.
    expect(container.querySelectorAll(".st-stateTimelineChart__segment").length).toBe(1);
  });
});
