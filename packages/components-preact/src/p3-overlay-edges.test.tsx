import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer.js";
import { LanguageSelector } from "./LanguageSelector.js";
import { SkipLink } from "./SkipLink.js";
import { SlideIndicator } from "./SlideIndicator.js";
import { TreeView } from "./TreeView.js";

afterEach(cleanup);

describe("P3 group 3 edges (overlay: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-3 module", () => {
    render(
      <>
        <Drawer open data-testid="e-drawer" title="T" className={signal("x-drawer")}>
          Body
        </Drawer>
        <LanguageSelector
          data-testid="e-languageselector"
          options={[{ value: "fr", label: "FR" }]}
          className={signal("x-languageselector")}
        />
        <SkipLink data-testid="e-skiplink" href="#main" className={signal("x-skiplink")}>
          Skip
        </SkipLink>
        <SlideIndicator data-testid="e-slideindicator" count={3} className={signal("x-slideindicator")} />
        <TreeView
          data-testid="e-treeview"
          nodes={[{ id: "r", label: "R" }]}
          onSelect={() => {}}
          className={signal("x-treeview")}
        />
      </>,
    );
    for (const [testId, extra] of [
      ["e-drawer", "x-drawer"],
      ["e-languageselector", "x-languageselector"],
      ["e-skiplink", "x-skiplink"],
      ["e-slideindicator", "x-slideindicator"],
      ["e-treeview", "x-treeview"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("Drawer follows an open signal mutated after mount and keeps onClose and onKeyDown", async () => {
    const open = signal(false);
    const onClose = vi.fn();
    const { container } = render(
      <Drawer open={open} title="Filters" onClose={onClose}>
        Body
      </Drawer>,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    open.value = true;
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeTruthy());
    fireEvent.click(container.querySelector(".st-drawer__backdrop") as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
    const consumerKeyDown = vi.fn();
    const { container: keyed } = render(
      <Drawer open title="T" onKeyDown={consumerKeyDown}>
        Body
      </Drawer>,
    );
    fireEvent.keyDown(keyed.querySelector('[role="dialog"]') as HTMLElement, { key: "Tab" });
    expect(consumerKeyDown).toHaveBeenCalledTimes(1);
  });

  it("LanguageSelector follows value and open signals mutated after mount and keeps onChange", async () => {
    const value = signal("fr");
    const open = signal(false);
    const onChange = vi.fn();
    const options = [
      { value: "fr", label: "Français" },
      { value: "en", label: "English" },
    ];
    const { container } = render(
      <LanguageSelector options={options} value={value} open={open} onChange={onChange} />,
    );
    expect(container.querySelector(".st-languageSelector__menu")).toBeNull();
    open.value = true;
    await waitFor(() => expect(container.querySelector(".st-languageSelector__menu")).toBeTruthy());
    expect(container.querySelector(".st-languageSelector__option--active")?.textContent).toBe("Français");
    value.value = "en";
    await waitFor(() =>
      expect(container.querySelector(".st-languageSelector__option--active")?.textContent).toBe("English"),
    );
    const optionButtons = Array.from(
      container.querySelectorAll(".st-languageSelector__option"),
    ) as HTMLElement[];
    fireEvent.click(optionButtons[0]);
    expect(onChange).toHaveBeenCalledWith("fr");
  });

  it("SkipLink renders its defaults and keeps a consumer onClick", () => {
    const onClick = vi.fn();
    render(<SkipLink onClick={onClick}>Skip target</SkipLink>);
    const link = screen.getByRole("link", { name: "Skip target" });
    expect(link.getAttribute("href")).toBe("#main");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("SlideIndicator follows a current signal mutated after mount and keeps onChange", async () => {
    const current = signal(0);
    const onChange = vi.fn();
    const { container } = render(<SlideIndicator count={3} current={current} onChange={onChange} />);
    const dots = () => Array.from(container.querySelectorAll(".st-slideIndicator__dot")) as HTMLElement[];
    expect(container.querySelector('[aria-current="true"]')?.getAttribute("aria-label")).toBe(
      "Diapositive 1",
    );
    current.value = 2;
    await waitFor(() =>
      expect(container.querySelector('[aria-current="true"]')?.getAttribute("aria-label")).toBe(
        "Diapositive 3",
      ),
    );
    fireEvent.click(dots()[1]);
    expect(onChange).toHaveBeenCalledWith(1);
    fireEvent.keyDown(dots()[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("TreeView follows selected and expanded signals mutated after mount and keeps onSelect", async () => {
    const selected = signal("leaf1");
    const expanded = signal<string[]>(["root"]);
    const onSelect = vi.fn();
    const onChange = vi.fn();
    const nodes = [
      {
        id: "root",
        label: "Root",
        children: [
          { id: "leaf1", label: "Leaf 1" },
          { id: "leaf2", label: "Leaf 2" },
        ],
      },
    ];
    render(
      <TreeView
        nodes={nodes}
        selectedId={selected}
        expandedIds={expanded}
        onSelect={onSelect}
        onChange={onChange}
      />,
    );
    const rowOf = (label: string) =>
      screen.getByText(label).closest('[role="treeitem"]') as HTMLElement;
    expect(rowOf("Leaf 1").getAttribute("aria-selected")).toBe("true");
    selected.value = "leaf2";
    await waitFor(() => expect(rowOf("Leaf 2").getAttribute("aria-selected")).toBe("true"));
    expanded.value = [];
    await waitFor(() => expect(screen.queryByText("Leaf 1")).toBeNull());
    expanded.value = ["root"];
    await waitFor(() => expect(screen.getByText("Leaf 1")).toBeTruthy());
    fireEvent.click(screen.getByText("Leaf 2"));
    expect(onSelect).toHaveBeenCalledWith("leaf2");
    expect(onChange).toHaveBeenCalledWith("leaf2");
  });
});
