import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { AnomalySwimLaneChart } from "./AnomalySwimLaneChart.js";

const jobs = [
  {
    job: "Logins",
    buckets: [
      { at: 0, score: 5 },
      { at: 1, score: 50 },
      { at: 2, score: 100 },
    ],
  },
  {
    job: "Payments",
    buckets: [
      { at: 0, score: 2 },
      { at: 1, score: 20 },
      { at: 2, score: 80 },
    ],
  },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("AnomalySwimLaneChart", () => {
  it("renders one cell per bucket across all jobs", () => {
    const wrapper = mount(AnomalySwimLaneChart, { props: { label: "Scores", data: jobs, max: 100 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-anomalySwimLaneChart__cell").length).toBe(6);
  });

  it("maps the score to a continuous intensity tone (low → high)", () => {
    const wrapper = mount(AnomalySwimLaneChart, { props: { label: "Scores", data: jobs, max: 100 } });
    const cells = (wrapper.element as HTMLElement).querySelectorAll(".st-anomalySwimLaneChart__cell");
    expect(cells[0].classList.contains("st-anomalySwimLaneChart__cell--category1")).toBe(true);
    expect(cells[2].classList.contains("st-anomalySwimLaneChart__cell--category8")).toBe(true);
  });

  it("renders a Low → High scale legend", () => {
    const wrapper = mount(AnomalySwimLaneChart, { props: { label: "Scores", data: jobs, max: 100 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-anomalySwimLaneChart__legend")).toBeTruthy();
    expect(el.querySelectorAll(".st-anomalySwimLaneChart__legendSwatch").length).toBe(8);
  });

  it("derives max from the data when no max prop is given", () => {
    const wrapper = mount(AnomalySwimLaneChart, {
      props: {
        label: "Scores",
        data: [{ job: "J", buckets: [{ at: 0, score: 1 }, { at: 1, score: 10 }] }],
      },
    });
    const cells = (wrapper.element as HTMLElement).querySelectorAll(".st-anomalySwimLaneChart__cell");
    expect(cells[1].classList.contains("st-anomalySwimLaneChart__cell--category8")).toBe(true);
  });

  it("lays buckets out as a time grid (later bucket sits to the right)", () => {
    const wrapper = mount(AnomalySwimLaneChart, { props: { label: "Scores", data: jobs, max: 100 } });
    const cells = (wrapper.element as HTMLElement).querySelectorAll<SVGRectElement>(".st-anomalySwimLaneChart__cell");
    const x0 = Number(cells[0].getAttribute("x"));
    const x1 = Number(cells[1].getAttribute("x"));
    expect(x1).toBeGreaterThan(x0);
  });

  it("summarises each job in the accessible data list", () => {
    const wrapper = mount(AnomalySwimLaneChart, {
      props: {
        label: "Scores",
        data: [{ job: "Logins", buckets: [{ at: 0, score: 5 }, { at: 1, score: 9 }] }],
      },
    });
    expect(listItems(wrapper.element as HTMLElement)[0]).toBe("Logins: 0 = 5, 1 = 9");
  });

  it("drops non-finite buckets and unlabeled jobs before rendering", () => {
    const wrapper = mount(AnomalySwimLaneChart, {
      props: {
        label: "Filtré",
        data: [
          { job: "", buckets: [{ at: 0, score: 1 }] },
          {
            job: "Ok",
            buckets: [
              { at: Number.NaN, score: 5 },
              { at: 1, score: 7 },
            ],
          },
        ],
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-anomalySwimLaneChart__cell").length).toBe(1);
  });
});
