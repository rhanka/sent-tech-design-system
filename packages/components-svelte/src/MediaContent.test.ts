import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import MediaContent from "./lib/MediaContent.svelte";

describe("MediaContent", () => {
  it("renders image and caption", () => {
    render(MediaContent, {
      props: {
        media: "/assets/media.jpg",
        mediaAlt: "Aperçu d’un média",
        caption: "Légende de la figure"
      }
    });

    expect(screen.getByRole("img")).toBeTruthy();
    expect(screen.getByText("Légende de la figure")).toBeTruthy();
  });

  it("renders fallback slot when source is absent", () => {
    render(MediaContent, {
      props: {
        title: "Média personnalisé",
        children: createRawSnippet(() => ({ render: () => "<p>Données médias externes</p>" }))
      }
    });

    expect(screen.getByText("Données médias externes")).toBeTruthy();
  });

  it("adds a captions track for video media", () => {
    const { container } = render(MediaContent, {
      props: {
        media: "/assets/video.mp4",
        mediaKind: "video",
        mediaAlt: "Vidéo de démonstration",
        mediaCaptionsLabel: "Français"
      }
    });

    const track = container.querySelector("track");
    expect(track).toBeTruthy();
    expect(track?.getAttribute("kind")).toBe("captions");
    expect(track?.getAttribute("srclang")).toBe("fr");
  });
});
