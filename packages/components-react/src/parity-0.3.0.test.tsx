import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  BackToTop,
  DisplaySettings,
  MediaContent,
  Notification,
  TableOfContents,
  Transcription,
} from "./index.js";

afterEach(cleanup);

describe("React parity 0.3.0 components", () => {
  it("BackToTop renders an accessible button and scrolls on click", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    render(<BackToTop autoHide={false} label="Top" />);
    const btn = screen.getByRole("button", { name: "Top" });
    expect(btn.className).toContain("st-backToTop");
    fireEvent.click(btn);
    expect(scrollTo).toHaveBeenCalled();
  });

  it("Notification fires onDismiss when the close button is pressed", () => {
    const onDismiss = vi.fn();
    render(
      <Notification
        title="Saved"
        message="All good"
        dismissible
        onDismiss={onDismiss}
        dismissLabel="Close"
      />,
    );
    expect(screen.getByText("Saved").className).toContain("st-notification__title");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("MediaContent renders an image and its caption", () => {
    render(<MediaContent media="/cover.png" mediaAlt="Cover art" title="Cover" caption="A caption" />);
    expect(screen.getByRole("img", { name: "Cover art" }).getAttribute("src")).toBe("/cover.png");
    expect(screen.getByText("Cover").className).toContain("st-mediaContent__title");
  });

  it("TableOfContents renders anchor links and marks the active item", () => {
    render(
      <TableOfContents
        title="On this page"
        activeId="intro"
        items={[
          { id: "intro", label: "Intro" },
          { id: "#usage", label: "Usage", level: 2 },
        ]}
      />,
    );
    const intro = screen.getByRole("link", { name: "Intro" });
    expect(intro.getAttribute("href")).toBe("#intro");
    expect(intro.getAttribute("aria-current")).toBe("location");
    expect(screen.getByRole("link", { name: "Usage" }).getAttribute("href")).toBe("#usage");
  });

  it("Transcription renders segments inside a details disclosure", () => {
    render(
      <Transcription
        open
        title="Transcript"
        segments={[{ speaker: "A", startTime: "0:00", endTime: "0:05", text: "Hello" }]}
      />,
    );
    expect(screen.getByText("Transcript")).toBeTruthy();
    expect(screen.getByText("Hello").className).toContain("st-transcription__text");
    expect(screen.getByText("A").className).toContain("st-transcription__speaker");
  });

  it("DisplaySettings emits the full settings state on change", () => {
    const onChange = vi.fn();
    render(<DisplaySettings onChange={onChange} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "large" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fontScale: "large",
        contrast: "default",
        lineSpacing: "normal",
        reducedMotion: false,
      }),
    );
  });
});
