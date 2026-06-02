import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import DisplaySettings from "./lib/DisplaySettings.svelte";

describe("DisplaySettings", () => {
  it("renders display controls", () => {
    render(DisplaySettings, {
      props: {
        title: "Affichage"
      }
    });

    expect(screen.getByText("Affichage")).toBeTruthy();
    expect(screen.getByLabelText("Taille de texte")).toBeTruthy();
    expect(screen.getByLabelText("Contraste")).toBeTruthy();
    expect(screen.getByLabelText("Interligne")).toBeTruthy();
    expect(screen.getByLabelText("Animations (réduction)")).toBeTruthy();
  });

  it("emits changes", async () => {
    const onChange = vi.fn();

    render(DisplaySettings, {
      props: {
        onChange
      }
    });

    const fontSelect = screen.getByLabelText("Taille de texte");
    await fireEvent.change(fontSelect, { target: { value: "extra-large" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      fontScale: "extra-large",
      contrast: "default",
      lineSpacing: "normal",
      reducedMotion: false
    });
  });
});
