import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Transcription from "./lib/Transcription.svelte";

describe("Transcription", () => {
  it("renders title, lines and timestamps", () => {
    render(Transcription, {
      props: {
        title: "Transcription de test",
        segments: [
          {
            speaker: "Narration",
            startTime: "00:00",
            endTime: "00:10",
            text: "Bonjour et bienvenue"
          },
          {
            speaker: "Intervenant",
            startTime: "00:11",
            endTime: "00:20",
            text: "Hello there"
          }
        ]
      }
    });

    expect(screen.getByText("Transcription de test")).toBeTruthy();
    expect(screen.getByText("Narration")).toBeTruthy();
    expect(screen.getByText("00:00 — 00:10")).toBeTruthy();
    expect(screen.getByText("Hello there")).toBeTruthy();
  });

  it("allows open/close via summary", async () => {
    const { container } = render(Transcription, {
      props: {
        title: "Mini",
        text: "Texte de transcription",
        open: false
      }
    });

    const details = container.querySelector("details");
    const summary = screen.getByText("Mini");

    expect((details as HTMLDetailsElement).open).toBe(false);
    await fireEvent.click(summary);
    expect((details as HTMLDetailsElement).open).toBe(true);
  });
});
