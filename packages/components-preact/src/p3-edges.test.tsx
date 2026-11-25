import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackToTop } from "./BackToTop.js";
import { Breadcrumb } from "./Breadcrumb.js";
import { Pagination } from "./Pagination.js";
import { PaginationNav } from "./PaginationNav.js";
import { Stepper } from "./Stepper.js";
import { TableOfContents } from "./TableOfContents.js";

afterEach(cleanup);

describe("P3 lane 3 edges (signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every P3 lane 3 module", () => {
    render(
      <>
        <Pagination data-testid="e-pagination" page={1} totalPages={3} className={signal("x-pagination")} />
        <PaginationNav data-testid="e-paginationNav" page={1} totalPages={3} className={signal("x-paginationNav")} />
        <Breadcrumb data-testid="e-breadcrumb" items={[{ label: "Home" }]} className={signal("x-breadcrumb")} />
        <BackToTop data-testid="e-backToTop" autoHide={false} className={signal("x-backToTop")} />
        <Stepper data-testid="e-stepper" steps={[{ label: "One" }]} className={signal("x-stepper")} />
        <TableOfContents
          data-testid="e-tableOfContents"
          items={[{ id: "a", label: "A" }]}
          className={signal("x-tableOfContents")}
        />
      </>,
    );
    for (const [testId, extra] of [
      ["e-pagination", "x-pagination"],
      ["e-paginationNav", "x-paginationNav"],
      ["e-breadcrumb", "x-breadcrumb"],
      ["e-backToTop", "x-backToTop"],
      ["e-stepper", "x-stepper"],
      ["e-tableOfContents", "x-tableOfContents"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("follows a className signal mutated after mount", async () => {
    const cls = signal("before");
    render(<Pagination data-testid="e-pagination-class" page={1} totalPages={2} className={cls} />);
    expect(screen.getByTestId("e-pagination-class").className).toContain("before");
    cls.value = "after";
    await waitFor(() => expect(screen.getByTestId("e-pagination-class").className).toContain("after"));

    const cls2 = signal("before-nav");
    render(<PaginationNav data-testid="e-paginationNav-class" page={1} totalPages={2} className={cls2} />);
    expect(screen.getByTestId("e-paginationNav-class").className).toContain("before-nav");
    cls2.value = "after-nav";
    await waitFor(() => expect(screen.getByTestId("e-paginationNav-class").className).toContain("after-nav"));

    const cls3 = signal("before-crumb");
    render(
      <Breadcrumb
        data-testid="e-breadcrumb-class"
        items={[{ label: "Home" }]}
        className={cls3}
      />,
    );
    expect(screen.getByTestId("e-breadcrumb-class").className).toContain("before-crumb");
    cls3.value = "after-crumb";
    await waitFor(() => expect(screen.getByTestId("e-breadcrumb-class").className).toContain("after-crumb"));

    const cls4 = signal("before-back");
    render(<BackToTop data-testid="e-backToTop-class" autoHide={false} className={cls4} />);
    expect(screen.getByTestId("e-backToTop-class").className).toContain("before-back");
    cls4.value = "after-back";
    await waitFor(() => expect(screen.getByTestId("e-backToTop-class").className).toContain("after-back"));

    const cls5 = signal("before-step");
    render(<Stepper data-testid="e-stepper-class" steps={[{ label: "One" }]} className={cls5} />);
    expect(screen.getByTestId("e-stepper-class").className).toContain("before-step");
    cls5.value = "after-step";
    await waitFor(() => expect(screen.getByTestId("e-stepper-class").className).toContain("after-step"));

    const cls6 = signal("before-toc");
    render(
      <TableOfContents
        data-testid="e-tableOfContents-class"
        items={[{ id: "a", label: "A" }]}
        className={cls6}
      />,
    );
    expect(screen.getByTestId("e-tableOfContents-class").className).toContain("before-toc");
    cls6.value = "after-toc";
    await waitFor(() => expect(screen.getByTestId("e-tableOfContents-class").className).toContain("after-toc"));
  });

  it("Pagination follows a page signal mutated after mount", async () => {
    const page = signal(1);
    const onPageChange = vi.fn();
    render(<Pagination page={page} totalPages={4} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Previous" })).toHaveProperty("disabled", true);
    page.value = 3;
    await waitFor(() => expect(screen.getByRole("button", { name: "Page 3" }).getAttribute("aria-current")).toBe("page"));
    expect(screen.getByRole("button", { name: "Previous" })).toHaveProperty("disabled", false);
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it("PaginationNav follows a page signal mutated after mount", async () => {
    const page = signal(1);
    const onPageChange = vi.fn();
    render(<PaginationNav page={page} totalPages={5} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
    page.value = 3;
    await waitFor(() => expect(screen.getByRole("button", { name: "Page 3" }).getAttribute("aria-current")).toBe("page"));
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it("Breadcrumb renders items and current state, accepts className signal", async () => {
    const cls = signal("extra");
    render(
      <Breadcrumb
        data-testid="e-crumb"
        className={cls}
        items={[
          { label: "Home", href: "/" },
          { label: "Current", current: true },
        ]}
      />,
    );
    const nav = screen.getByTestId("e-crumb");
    expect(nav.className).toContain("extra");
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe("Current");
    cls.value = "extra2";
    await waitFor(() => expect(nav.className).toContain("extra2"));
  });

  it("Stepper follows current and clickable signals mutated after mount", async () => {
    const current = signal(0);
    const clickable = signal(false);
    const onStepClick = vi.fn();
    render(
      <Stepper
        steps={[
          { label: "One" },
          { label: "Two" },
          { label: "Three" },
        ]}
        current={current}
        clickable={clickable}
        onStepClick={onStepClick}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0].getAttribute("aria-current")).toBe("step");
    expect(items[1].getAttribute("aria-current")).toBeNull();
    // Not clickable -> no button
    expect(screen.queryByRole("button", { name: "One" })).toBeNull();
    current.value = 1;
    await waitFor(() => expect(screen.getAllByRole("listitem")[1].getAttribute("aria-current")).toBe("step"));
    clickable.value = true;
    await waitFor(() => expect(screen.getByRole("button", { name: "One" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "One" }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it("BackToTop follows disabled, autoHide and smooth signals mutated after mount", async () => {
    const disabled = signal(false);
    const { container } = render(<BackToTop disabled={disabled} autoHide={false} label="Top" />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
    disabled.value = true;
    await waitFor(() => expect((container.querySelector("button") as HTMLButtonElement).disabled).toBe(true));
    disabled.value = false;
    await waitFor(() => expect((container.querySelector("button") as HTMLButtonElement).disabled).toBe(false));
  });

  it("BackToTop follows smooth signal mutated after mount", async () => {
    const smooth = signal(false);
    const target = document.createElement("div");
    target.id = "top";
    document.body.appendChild(target);
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    try {
      const { container } = render(<BackToTop smooth={smooth} autoHide={false} label="Top" targetId="top" />);
      const btn = container.querySelector("button") as HTMLButtonElement;
      fireEvent.click(btn);
      expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: "auto", block: "start" });
      smooth.value = true;
      // Let the signal re-render pick up the new value before the next click.
      await new Promise((resolve) => setTimeout(resolve, 0));
      fireEvent.click(btn);
      expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: "smooth", block: "start" });
    } finally {
      target.remove();
    }
  });

  it("BackToTop follows autoHide signal to toggle visibility", async () => {
    const autoHide = signal(false);
    const { container } = render(<BackToTop autoHide={autoHide} label="Top" />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.getAttribute("aria-hidden")).toBeNull();
    autoHide.value = true;
    await waitFor(() => {
      const b = container.querySelector("button") as HTMLButtonElement;
      // hidden when autoHide and not visible (scrollY 0, threshold 240)
      expect(b.getAttribute("aria-hidden")).toBe("true");
      expect(b.getAttribute("tabindex")).toBe("-1");
    });
    autoHide.value = false;
    await waitFor(() => {
      const b = container.querySelector("button") as HTMLButtonElement;
      expect(b.getAttribute("aria-hidden")).toBeNull();
    });
  });

  it("TableOfContents follows activeId signal mutated after mount", async () => {
    const activeId = signal("");
    render(
      <TableOfContents
        title="On this page"
        activeId={activeId}
        items={[
          { id: "intro", label: "Intro" },
          { id: "usage", label: "Usage" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Intro" }).getAttribute("aria-current")).toBeNull();
    activeId.value = "intro";
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Intro" }).getAttribute("aria-current")).toBe("location"),
    );
    activeId.value = "usage";
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Usage" }).getAttribute("aria-current")).toBe("location"),
    );
    expect(screen.getByRole("link", { name: "Intro" }).getAttribute("aria-current")).toBeNull();
  });

  it("TableOfContents normalises ids with leading hash", () => {
    render(
      <TableOfContents
        activeId="#intro"
        items={[{ id: "intro", label: "Intro" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "Intro" }).getAttribute("href")).toBe("#intro");
    expect(screen.getByRole("link", { name: "Intro" }).getAttribute("aria-current")).toBe("location");
  });

  it("Pagination renders page buttons with correct disabled and active states", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} previousLabel="Prev" nextLabel="Next" />);
    expect(screen.getByRole("button", { name: "Prev" })).toHaveProperty("disabled", false);
    expect(screen.getByRole("button", { name: "Next" })).toHaveProperty("disabled", false);
    expect(screen.getByRole("button", { name: "Page 2" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: "Prev" }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it("PaginationNav renders ellipses for large page counts", () => {
    render(<PaginationNav page={5} totalPages={10} siblings={1} />);
    // With 10 pages and siblings 1, both ellipses appear in the middle
    const ellipses = document.querySelectorAll(".st-paginationNav__ellipsis");
    expect(ellipses.length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Page 5" }).getAttribute("aria-current")).toBe("page");
  });

  it("Pagination accepts style as string, object and signal without corruption", async () => {
    render(<Pagination data-testid="e-pagination-style" page={1} totalPages={2} style="color: rgb(255, 0, 0);" />);
    expect((screen.getByTestId("e-pagination-style") as HTMLElement).style.color).toBe("rgb(255, 0, 0)");
    cleanup();
    render(<Pagination data-testid="e-pagination-style-obj" page={1} totalPages={2} style={{ color: "red" }} />);
    expect((screen.getByTestId("e-pagination-style-obj") as HTMLElement).style.color).toBe("red");
    cleanup();
    const styleSig = signal({ color: "red" });
    render(<Pagination data-testid="e-pagination-style-sig" page={1} totalPages={2} style={styleSig} />);
    expect((screen.getByTestId("e-pagination-style-sig") as HTMLElement).style.color).toBe("red");
    styleSig.value = { color: "blue" };
    await waitFor(() =>
      expect((screen.getByTestId("e-pagination-style-sig") as HTMLElement).style.color).toBe("blue"),
    );
  });
});
