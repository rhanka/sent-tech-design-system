import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import {
  BackToTop,
  DisplaySettings,
  MediaContent,
  Notification,
  TableOfContents,
  Transcription,
} from "./index.js";

describe("Vue parity 0.3.0 components", () => {
  it("BackToTop renders an accessible button and scrolls on click", async () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    const wrapper = mount(BackToTop, { props: { autoHide: false, label: "Top" } });
    expect(wrapper.classes()).toContain("st-backToTop");
    expect(wrapper.attributes("aria-label")).toBe("Top");
    await wrapper.trigger("click");
    expect(scrollTo).toHaveBeenCalled();
  });

  it("Notification emits dismiss when the close button is pressed", async () => {
    const wrapper = mount(Notification, {
      props: { title: "Saved", message: "All good", dismissible: true, dismissLabel: "Close" },
    });
    expect(wrapper.find(".st-notification__title").text()).toBe("Saved");
    await wrapper.find(".st-notification__close").trigger("click");
    expect(wrapper.emitted("dismiss")).toBeTruthy();
  });

  it("MediaContent renders an image and its caption", () => {
    const wrapper = mount(MediaContent, {
      props: { media: "/cover.png", mediaAlt: "Cover art", title: "Cover", caption: "A caption" },
    });
    expect(wrapper.find("img").attributes("src")).toBe("/cover.png");
    expect(wrapper.find(".st-mediaContent__title").text()).toBe("Cover");
  });

  it("TableOfContents renders anchor links and marks the active item", () => {
    const wrapper = mount(TableOfContents, {
      props: {
        title: "On this page",
        activeId: "intro",
        items: [
          { id: "intro", label: "Intro" },
          { id: "#usage", label: "Usage", level: 2 },
        ],
      },
    });
    const links = wrapper.findAll("a");
    expect(links[0].attributes("href")).toBe("#intro");
    expect(links[0].attributes("aria-current")).toBe("location");
    expect(links[1].attributes("href")).toBe("#usage");
  });

  it("Transcription renders segments inside a details disclosure", () => {
    const wrapper = mount(Transcription, {
      props: {
        open: true,
        title: "Transcript",
        segments: [{ speaker: "A", startTime: "0:00", endTime: "0:05", text: "Hello" }],
      },
    });
    expect(wrapper.find("summary").text()).toBe("Transcript");
    expect(wrapper.find(".st-transcription__text").text()).toBe("Hello");
    expect(wrapper.find(".st-transcription__speaker").text()).toBe("A");
  });

  it("DisplaySettings emits the full settings state on change", async () => {
    const wrapper = mount(DisplaySettings);
    const selects = wrapper.findAll("select");
    await selects[0].setValue("large");
    const events = wrapper.emitted("change");
    expect(events).toBeTruthy();
    expect(events?.[events.length - 1][0]).toMatchObject({
      fontScale: "large",
      contrast: "default",
      lineSpacing: "normal",
      reducedMotion: false,
    });
  });
});
