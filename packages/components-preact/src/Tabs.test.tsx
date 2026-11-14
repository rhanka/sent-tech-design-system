import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs.js";

afterEach(cleanup);

const items = [
  { value: "svelte", label: "Svelte", content: "Svelte content" },
  { value: "react", label: "React", content: "React content" },
  { value: "vue", label: "Vue", content: "Vue content", disabled: true },
  { value: "preact", label: "Preact", content: "Preact content" },
];

describe("Tabs (Preact)", () => {
  it("wires the tablist, tab and tabpanel relationships", () => {
    render(<Tabs label="Framework" items={items} className="extra" />);
    expect(screen.getByRole("tablist", { name: "Framework" }).className).toBe("st-tabs__list");
    const svelte = screen.getByRole("tab", { name: "Svelte" });
    const panel = screen.getByRole("tabpanel");
    expect(svelte.getAttribute("aria-selected")).toBe("true");
    expect(svelte.className).toBe("st-tabs__tab st-tabs__tab--active");
    expect(svelte.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("tab", { name: "React" }).getAttribute("tabindex")).toBe("-1");
    expect(panel.id).toBe(svelte.getAttribute("aria-controls"));
    expect(panel.getAttribute("aria-labelledby")).toBe(svelte.id);
    expect(panel.textContent).toBe("Svelte content");
    expect(panel.parentElement?.className).toBe("st-tabs extra");
  });

  it("roves with the arrow keys, Home and End, skipping disabled tabs and wrapping", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} onChange={onChange} />);
    const svelte = screen.getByRole("tab", { name: "Svelte" });
    const react = screen.getByRole("tab", { name: "React" });
    const vue = screen.getByRole("tab", { name: "Vue" });
    const preact = screen.getByRole("tab", { name: "Preact" });

    fireEvent.keyDown(svelte, { key: "ArrowRight" });
    expect(react.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(react);
    expect(screen.getByRole("tabpanel").textContent).toBe("React content");

    // Vue is disabled: ArrowRight lands on Preact.
    fireEvent.keyDown(react, { key: "ArrowRight" });
    expect(preact.getAttribute("aria-selected")).toBe("true");
    expect(vue.getAttribute("aria-selected")).toBe("false");
    expect((vue as HTMLButtonElement).disabled).toBe(true);

    // Wraps from the last enabled tab to the first.
    fireEvent.keyDown(preact, { key: "ArrowRight" });
    expect(svelte.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(svelte, { key: "ArrowLeft" });
    expect(preact.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(preact, { key: "Home" });
    expect(svelte.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(svelte, { key: "End" });
    expect(preact.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(preact);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(["react", "preact", "svelte", "preact", "svelte", "preact"]);
  });

  it("selects on click, ignores a disabled tab and accepts the lowercase `onchange` alias", () => {
    const onchange = vi.fn();
    render(<Tabs items={items} onchange={onchange} />);
    fireEvent.click(screen.getByRole("tab", { name: "React" }));
    expect(onchange).toHaveBeenLastCalledWith("react");
    fireEvent.click(screen.getByRole("tab", { name: "Vue" }));
    expect(onchange).toHaveBeenCalledTimes(1);
  });

  it("is controlled by `activeValue`: the parent decides the selected tab", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Tabs items={items} activeValue="react" onChange={onChange} />);
    expect(screen.getByRole("tab", { name: "React" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Preact" }));
    expect(onChange).toHaveBeenLastCalledWith("preact");
    expect(screen.getByRole("tab", { name: "React" }).getAttribute("aria-selected")).toBe("true");
    rerender(<Tabs items={items} activeValue="preact" onChange={onChange} />);
    expect(screen.getByRole("tab", { name: "Preact" }).getAttribute("aria-selected")).toBe("true");
  });

  it("accepts a signal for `activeValue` at the edge and follows it", async () => {
    const active = signal<string | undefined>("react");
    render(<Tabs items={items} activeValue={active} onChange={(value) => (active.value = value)} />);
    expect(screen.getByRole("tabpanel").textContent).toBe("React content");
    fireEvent.click(screen.getByRole("tab", { name: "Preact" }));
    expect(active.value).toBe("preact");
    await waitFor(() => expect(screen.getByRole("tabpanel").textContent).toBe("Preact content"));
    active.value = "svelte";
    await waitFor(() => expect(screen.getByRole("tab", { name: "Svelte" }).getAttribute("aria-selected")).toBe("true"));
  });
});
