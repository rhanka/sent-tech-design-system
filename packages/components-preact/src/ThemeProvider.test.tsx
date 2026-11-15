import { sentTechTheme } from "@sentropic/design-system-themes";
import { cleanup, render, screen } from "@testing-library/preact";
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
});
