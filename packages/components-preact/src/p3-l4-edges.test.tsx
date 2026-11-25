import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it } from "vitest";
import { Drawer } from "./Drawer.js";
import { LanguageSelector } from "./LanguageSelector.js";
import { SkipLink } from "./SkipLink.js";
import { SlideIndicator } from "./SlideIndicator.js";
import { TreeView } from "./TreeView.js";

afterEach(cleanup);

describe("P3 lane 4 edges (signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every P3 lane 4 module", () => {
    render(
      <>
        <Drawer data-testid="e-drawer" open title="T" className={signal("x-drawer")}>
          body
        </Drawer>
        <TreeView
          data-testid="e-tree"
          nodes={[{ id: "root", label: "Root" }]}
          className={signal("x-tree")}
          onSelect={() => {}}
        />
        <SlideIndicator data-testid="e-slide" count={3} className={signal("x-slide")} />
        <SkipLink data-testid="e-skip" href="#main" className={signal("x-skip")}>
          Skip
        </SkipLink>
        <LanguageSelector
          data-testid="e-lang"
          options={[{ value: "fr", label: "French" }]}
          value="fr"
          className={signal("x-lang")}
        />
      </>,
    );
    for (const [testId, extra] of [
      ["e-drawer", "x-drawer"],
      ["e-tree", "x-tree"],
      ["e-slide", "x-slide"],
      ["e-skip", "x-skip"],
      ["e-lang", "x-lang"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("Drawer follows an open signal mutated after mount", async () => {
    const open = signal(false);
    const onClose = () => {
      open.value = false;
    };
    render(
      <Drawer open={open} title="Filters" onClose={onClose}>
        body
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    open.value = true;
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "Filters");
    open.value = false;
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("Drawer follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    render(
      <Drawer open title="T" className={cls}>
        body
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(screen.getByRole("dialog").className).toContain("x-after"));
    await waitFor(() => expect(screen.getByRole("dialog").className).not.toContain("x-before"));
  });

  it("TreeView follows selectedId and expandedIds signals mutated after mount", async () => {
    const selectedId = signal("leaf-a");
    const expandedIds = signal(["root"]);
    const nodes = [
      {
        id: "root",
        label: "Root",
        children: [
          { id: "leaf-a", label: "Leaf A" },
          { id: "leaf-b", label: "Leaf B" },
        ],
      },
    ];
    const { container } = render(
      <TreeView nodes={nodes} selectedId={selectedId} expandedIds={expandedIds} onSelect={() => {}} />,
    );
    const row = (id: string) => container.querySelector(`[data-tree-id="${id}"]`);
    expect(row("leaf-a")?.getAttribute("aria-selected")).toBe("true");
    expect(row("leaf-b")?.getAttribute("aria-selected")).toBe("false");
    selectedId.value = "leaf-b";
    await waitFor(() => expect(row("leaf-b")?.getAttribute("aria-selected")).toBe("true"));
    await waitFor(() => expect(row("leaf-a")?.getAttribute("aria-selected")).toBe("false"));
    expandedIds.value = [];
    await waitFor(() => expect(row("leaf-a")).toBeNull());
    expandedIds.value = ["root"];
    await waitFor(() => expect(row("leaf-a")).toBeTruthy());
  });

  it("TreeView follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    const { container } = render(
      <TreeView
        nodes={[{ id: "root", label: "Root" }]}
        className={cls}
        onSelect={() => {}}
      />,
    );
    expect(container.querySelector(".st-treeView")?.className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(container.querySelector(".st-treeView")?.className).toContain("x-after"));
  });

  it("SlideIndicator follows a current signal mutated after mount", async () => {
    const current = signal(0);
    const onChange = () => {};
    render(<SlideIndicator count={4} current={current} onChange={onChange} label="Slide" />);
    const dots = screen.getAllByRole("button");
    expect(dots).toHaveLength(4);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(dots[0]).toHaveAttribute("tabindex", "0");
    current.value = 2;
    await waitFor(() => expect(screen.getAllByRole("button")[2]).toHaveAttribute("aria-current", "true"));
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toHaveAttribute("aria-current"));
    await waitFor(() => expect(screen.getAllByRole("button")[2]).toHaveAttribute("tabindex", "0"));
  });

  it("SlideIndicator emits onChange on click", () => {
    let received = -1;
    render(<SlideIndicator count={3} current={0} onChange={(index) => (received = index)} />);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(received).toBe(1);
  });

  it("LanguageSelector follows open and value signals mutated after mount", async () => {
    const open = signal(false);
    const value = signal("fr");
    const options = [
      { value: "fr", label: "Français" },
      { value: "en", label: "English" },
    ];
    const { container } = render(<LanguageSelector options={options} value={value} open={open} />);
    expect(container.querySelector(".st-languageSelector__menu")).toBeNull();
    open.value = true;
    await waitFor(() => expect(container.querySelector(".st-languageSelector__menu")).toBeTruthy());
    const active = () => container.querySelector(".st-languageSelector__option--active");
    expect(active()?.textContent).toBe("Français");
    value.value = "en";
    await waitFor(() => expect(active()?.textContent).toBe("English"));
    open.value = false;
    await waitFor(() => expect(container.querySelector(".st-languageSelector__menu")).toBeNull());
  });

  it("SkipLink follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    render(
      <SkipLink href="#main" className={cls}>
        Skip
      </SkipLink>,
    );
    expect(screen.getByRole("link").className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(screen.getByRole("link").className).toContain("x-after"));
    await waitFor(() => expect(screen.getByRole("link").className).not.toContain("x-before"));
  });
});
