import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AnomalySwimLaneChart from "./lib/AnomalySwimLaneChart.svelte";

// Heatmap temps × job : une ligne par job, une cellule par bucket, couleur =
// intensité du score continu normalisé 0..max.
const jobs = [
  {
    job: "Logins",
    buckets: [
      { at: 0, score: 5 },
      { at: 1, score: 50 },
      { at: 2, score: 100 }
    ]
  },
  {
    job: "Payments",
    buckets: [
      { at: 0, score: 2 },
      { at: 1, score: 20 },
      { at: 2, score: 80 }
    ]
  }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("AnomalySwimLaneChart", () => {
  it("renders one cell per bucket across all jobs", () => {
    const { container } = render(AnomalySwimLaneChart, {
      props: { label: "Scores", data: jobs, max: 100 }
    });
    expect(screen.getByRole("img")).toBeTruthy();
    // 3 + 3 = 6 cellules au total.
    expect(container.querySelectorAll(".st-anomalySwimLaneChart__cell").length).toBe(6);
  });

  it("maps the score to a continuous intensity tone (low → high)", () => {
    const { container } = render(AnomalySwimLaneChart, {
      props: { label: "Scores", data: jobs, max: 100 }
    });
    const cells = container.querySelectorAll(".st-anomalySwimLaneChart__cell");
    // score 5/100 → category1 (plancher), score 100/100 → category8 (sommet).
    expect(cells[0].classList.contains("st-anomalySwimLaneChart__cell--category1")).toBe(true);
    expect(cells[2].classList.contains("st-anomalySwimLaneChart__cell--category8")).toBe(true);
  });

  it("renders a Low → High scale legend", () => {
    const { container } = render(AnomalySwimLaneChart, {
      props: { label: "Scores", data: jobs, max: 100 }
    });
    expect(container.querySelector(".st-anomalySwimLaneChart__legend")).toBeTruthy();
    expect(container.querySelectorAll(".st-anomalySwimLaneChart__legendSwatch").length).toBe(8);
  });

  it("derives max from the data when no max prop is given", () => {
    const { container } = render(AnomalySwimLaneChart, {
      props: {
        label: "Scores",
        data: [{ job: "J", buckets: [{ at: 0, score: 1 }, { at: 1, score: 10 }] }]
      }
    });
    const cells = container.querySelectorAll(".st-anomalySwimLaneChart__cell");
    // max dérivé = 10 → 10/10 = 1 mappe la teinte la plus chaude.
    expect(cells[1].classList.contains("st-anomalySwimLaneChart__cell--category8")).toBe(true);
  });

  it("lays buckets out as a time grid (later bucket sits to the right)", () => {
    const { container } = render(AnomalySwimLaneChart, {
      props: { label: "Scores", data: jobs, max: 100 }
    });
    const cells = container.querySelectorAll<SVGRectElement>(".st-anomalySwimLaneChart__cell");
    const x0 = Number(cells[0].getAttribute("x"));
    const x1 = Number(cells[1].getAttribute("x"));
    expect(x1).toBeGreaterThan(x0);
  });

  it("summarises each job in the accessible data list", () => {
    const { container } = render(AnomalySwimLaneChart, {
      props: {
        label: "Scores",
        data: [{ job: "Logins", buckets: [{ at: 0, score: 5 }, { at: 1, score: 9 }] }]
      }
    });
    expect(listItems(container)[0]).toBe("Logins: 0 = 5, 1 = 9");
  });

  it("drops non-finite buckets and unlabeled jobs before rendering", () => {
    const { container } = render(AnomalySwimLaneChart, {
      props: {
        label: "Filtré",
        data: [
          { job: "", buckets: [{ at: 0, score: 1 }] },
          {
            job: "Ok",
            buckets: [
              { at: Number.NaN, score: 5 },
              { at: 1, score: 7 }
            ]
          }
        ]
      }
    });
    // Le job sans libellé est supprimé ; le bucket NaN aussi → 1 cellule restante.
    expect(container.querySelectorAll(".st-anomalySwimLaneChart__cell").length).toBe(1);
  });
});
