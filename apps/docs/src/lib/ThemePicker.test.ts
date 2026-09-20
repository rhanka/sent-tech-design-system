// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/svelte";
import ThemePicker from "./ThemePicker.svelte";
import { THEMES } from "./theme-catalog";

afterEach(cleanup);

describe("theme picker keyboard", () => {
  it("focuses search, filters labels, and selects an enterprise theme with arrows and Enter", async () => {
    const onselect = vi.fn();
    const view = render(ThemePicker, { open: true, themes: THEMES, activeThemeId: "sent-tech", locale: "fr", onselect });
    const input = view.getByRole("searchbox", { name: "Rechercher un thème" });
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(view.getAllByRole("menuitem")).toHaveLength(127);
    await fireEvent.input(input, { target: { value: "DESJ" } });
    expect(view.getAllByRole("menuitem")).toHaveLength(1);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const result = view.getByRole("menuitem", { name: /Desjardins/ });
    expect(document.activeElement).toBe(result);
    await fireEvent.keyDown(result, { key: "Enter" });
    expect(onselect).toHaveBeenCalledWith("desjardins");
    expect(view.queryByRole("dialog")).toBeNull();
  });

  it("handles empty results and restores focus on Escape", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const view = render(ThemePicker, { open: true, themes: THEMES, activeThemeId: "sent-tech", locale: "fr", onselect: vi.fn() });
    const input = view.getByRole("searchbox");
    await waitFor(() => expect(document.activeElement).toBe(input));
    await fireEvent.input(input, { target: { value: "no-such-theme" } });
    expect(view.getByText("Aucun thème trouvé")).toBeTruthy();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(document.activeElement).toBe(input);
    await fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(view.queryByRole("dialog")).toBeNull();
    trigger.remove();
  });
});
