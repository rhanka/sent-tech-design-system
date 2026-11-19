import { signal } from "@preact/signals";
import { sentTechTheme } from "@sentropic/design-system-themes";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { useLayoutEffect } from "preact/hooks";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { ThemeProvider } from "./ThemeProvider.js";

afterEach(cleanup);

const styleSelector = `style[data-st-theme-provider="${sentTechTheme.id}"]`;

describe("ThemeProvider (Preact)", () => {
  it("scopes its children and injects the compiled theme CSS", () => {
    render(
      <ThemeProvider theme={sentTechTheme}>
        <Button>Inside</Button>
      </ThemeProvider>,
    );
    const wrapper = screen.getByRole("button", { name: "Inside" }).parentElement;
    expect(wrapper?.getAttribute("data-st-theme")).toBe(sentTechTheme.id);
    const style = document.head.querySelector(styleSelector);
    expect(style?.textContent).toContain(`[data-st-theme="${sentTechTheme.id}"]`);
    expect(style?.textContent).toContain("--st-semantic-text-primary");
  });

  it("runs in the layout phase: a child layout effect does not see the stylesheet yet", () => {
    let seenByLayoutEffect: boolean | undefined;
    function Probe() {
      useLayoutEffect(() => {
        seenByLayoutEffect = document.head.querySelector(styleSelector) !== null;
      }, []);
      return null;
    }
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    // Documents the runtime difference. React runs insertion effects before
    // every layout effect, so a child would see the stylesheet. Preact has no
    // insertion phase: the adapter maps it to the layout phase, which runs
    // children first.
    expect(seenByLayoutEffect).toBe(false);
    expect(document.head.querySelector(styleSelector)).not.toBeNull();
  });

  it("removes the stylesheet it created on unmount", () => {
    const { unmount } = render(<ThemeProvider>Body</ThemeProvider>);
    expect(document.head.querySelector(styleSelector)).not.toBeNull();
    unmount();
    expect(document.head.querySelector(styleSelector)).toBeNull();
  });

  it("reuses a pre-existing theme stylesheet in place and preserves it on unmount", () => {
    const preExisting = document.createElement("style");
    preExisting.dataset.stThemeProvider = sentTechTheme.id;
    document.head.appendChild(preExisting);
    try {
      const { unmount } = render(<ThemeProvider theme={sentTechTheme}>Body</ThemeProvider>);
      expect(document.head.querySelectorAll(styleSelector)).toHaveLength(1);
      expect(preExisting.textContent).toContain(`[data-st-theme="${sentTechTheme.id}"]`);
      unmount();
      expect(document.head.contains(preExisting)).toBe(true);
    } finally {
      preExisting.remove();
    }
  });

  it("accepts a signal for `theme` and swaps the scoped theme and stylesheet post-mount", async () => {
    const theme = signal(sentTechTheme);
    const { container, unmount } = render(
      <ThemeProvider theme={theme}>
        <span data-testid="themed-child">Body</span>
      </ThemeProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper?.getAttribute("data-st-theme")).toBe(sentTechTheme.id);
    expect(document.head.querySelector(styleSelector)?.textContent).toContain(`[data-st-theme="${sentTechTheme.id}"]`);
    const customId = "p5-signal-theme";
    theme.value = { ...sentTechTheme, id: customId };
    const customSelector = `style[data-st-theme-provider="${customId}"]`;
    await waitFor(() => expect(wrapper?.getAttribute("data-st-theme")).toBe(customId));
    expect(document.head.querySelector(styleSelector)).toBeNull();
    expect(document.head.querySelector(customSelector)?.textContent).toContain(`[data-st-theme="${customId}"]`);
    unmount();
    expect(document.head.querySelector(customSelector)).toBeNull();
  });

  it("accepts a signal for `namespace` and recompiles the stylesheet post-mount", async () => {
    const namespace = signal("st");
    const { unmount } = render(<ThemeProvider namespace={namespace}>Body</ThemeProvider>);
    const before = document.head.querySelector(styleSelector)?.textContent ?? "";
    expect(before).toContain("--st-semantic-text-primary");
    namespace.value = "p5ns";
    await waitFor(() => {
      const after = document.head.querySelector(styleSelector)?.textContent ?? "";
      expect(after).toContain("--p5ns-semantic-text-primary");
      expect(after).not.toContain("--st-semantic-text-primary");
    });
    unmount();
    expect(document.head.querySelector(styleSelector)).toBeNull();
  });
});
