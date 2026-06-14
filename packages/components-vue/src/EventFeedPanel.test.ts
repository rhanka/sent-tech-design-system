import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { EventFeedPanel } from "./EventFeedPanel.js";

const events = [
  { at: 1_700_000_000_000, type: "deploy", severity: "info" as const, message: "Deployed v1.2.0" },
  { at: 1_700_000_300_000, type: "alert", severity: "error" as const, message: "5xx spike" },
  { at: 1_700_000_100_000, type: "scale", severity: "success" as const, message: "Scaled up" },
  { at: 1_700_000_200_000, type: "warn", severity: "warning" as const, message: "High latency" },
];

const items = (el: HTMLElement) => Array.from(el.querySelectorAll(".st-eventFeedPanel__item"));

describe("EventFeedPanel", () => {
  it("renders a feed with one article per event", () => {
    const wrapper = mount(EventFeedPanel, { props: { data: events, label: "Activité" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="feed"]')).toBeTruthy();
    expect(items(el).length).toBe(4);
    expect(el.querySelectorAll('[role="article"]').length).toBe(4);
  });

  it("sorts events by timestamp descending (newest first)", () => {
    const wrapper = mount(EventFeedPanel, { props: { data: events, label: "A" } });
    const el = wrapper.element as HTMLElement;
    const messages = items(el).map((li) => li.querySelector(".st-eventFeedPanel__message")?.textContent);
    expect(messages).toEqual(["5xx spike", "High latency", "Scaled up", "Deployed v1.2.0"]);
  });

  it("applies a severity tone class per item", () => {
    const wrapper = mount(EventFeedPanel, { props: { data: events, label: "A" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-eventFeedPanel__item--info")).toBeTruthy();
    expect(el.querySelector(".st-eventFeedPanel__item--success")).toBeTruthy();
    expect(el.querySelector(".st-eventFeedPanel__item--warning")).toBeTruthy();
    expect(el.querySelector(".st-eventFeedPanel__item--error")).toBeTruthy();
  });

  it("falls back to the neutral tone for unknown severities", () => {
    const wrapper = mount(EventFeedPanel, {
      props: { data: [{ at: 1, type: "x", severity: "debug", message: "noise" }], label: "A" },
    });
    expect((wrapper.element as HTMLElement).querySelector(".st-eventFeedPanel__item--neutral")).toBeTruthy();
  });

  it("drops non-finite timestamps before rendering", () => {
    const wrapper = mount(EventFeedPanel, {
      props: {
        data: [
          { at: Number.NaN, type: "x", severity: "info", message: "bad" },
          { at: 2, type: "y", severity: "info", message: "good" },
        ],
        label: "A",
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(items(el).length).toBe(1);
    expect(el.querySelector(".st-eventFeedPanel__message")?.textContent).toBe("good");
  });

  it("constrains the scroll height when maxHeight is set", () => {
    const wrapper = mount(EventFeedPanel, { props: { data: events, maxHeight: 180 } });
    const list = (wrapper.element as HTMLElement).querySelector(".st-eventFeedPanel__list") as HTMLElement;
    expect(list.style.maxHeight).toBe("180px");
  });

  it("accepts height as an alias of maxHeight", () => {
    const wrapper = mount(EventFeedPanel, { props: { data: events, height: 120 } });
    const list = (wrapper.element as HTMLElement).querySelector(".st-eventFeedPanel__list") as HTMLElement;
    expect(list.style.maxHeight).toBe("120px");
  });

  it("merges a custom class onto the root", () => {
    const wrapper = mount(EventFeedPanel, { props: { data: events, class: "mine" } });
    const root = wrapper.element as HTMLElement;
    expect(root.classList.contains("st-eventFeedPanel")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });
});
