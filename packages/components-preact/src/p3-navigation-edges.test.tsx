import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackToTop } from "./BackToTop.js";
import { Badge } from "./Badge.js";
import { Breadcrumb } from "./Breadcrumb.js";
import { ColorSwatch } from "./ColorSwatch.js";
import { Footer } from "./Footer.js";
import { Header } from "./Header.js";
import { LanguageToggle } from "./LanguageToggle.js";
import { NavActionStack } from "./NavActionStack.js";
import { NavItem } from "./NavItem.js";
import { Pagination } from "./Pagination.js";
import { PaginationNav } from "./PaginationNav.js";
import { SideNav } from "./SideNav.js";
import { Stepper } from "./Stepper.js";
import { TableOfContents } from "./TableOfContents.js";

afterEach(cleanup);

describe("P3 group 2 edges (navigation: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-2 module", () => {
    const { container } = render(
      <>
        <BackToTop data-testid="e-backtotop" className={signal("x-backtotop")} />
        <Breadcrumb data-testid="e-breadcrumb" items={[{ label: "A", href: "/" }]} className={signal("x-breadcrumb")} />
        <Footer data-testid="e-footer" copyright="c" className={signal("x-footer")} />
        <Header data-testid="e-header" className={signal("x-header")} />
        <LanguageToggle locale="fr" className={signal("x-languagetoggle")} />
        <NavActionStack actions={[{ label: "A" }]} className={signal("x-navactionstack")} />
        <NavItem title="T" className={signal("x-navitem")} />
        <Pagination data-testid="e-pagination" page={1} totalPages={3} className={signal("x-pagination")} />
        <PaginationNav data-testid="e-paginationnav" page={1} pageCount={5} className={signal("x-paginationnav")} />
        <SideNav data-testid="e-sidenav" items={[{ label: "A", href: "/" }]} className={signal("x-sidenav")} />
        <Stepper data-testid="e-stepper" steps={[{ label: "A" }]} className={signal("x-stepper")} />
        <TableOfContents data-testid="e-tableofcontents" items={[{ id: "a", label: "A" }]} className={signal("x-tableofcontents")} />
        <Badge data-testid="e-badge" className={signal("x-badge")}>3</Badge>
        <ColorSwatch data-testid="e-colorswatch" color="#336699" className={signal("x-colorswatch")} />
      </>,
    );
    for (const [testId, extra] of [
      ["e-backtotop", "x-backtotop"],
      ["e-breadcrumb", "x-breadcrumb"],
      ["e-footer", "x-footer"],
      ["e-header", "x-header"],
      ["e-pagination", "x-pagination"],
      ["e-paginationnav", "x-paginationnav"],
      ["e-sidenav", "x-sidenav"],
      ["e-stepper", "x-stepper"],
      ["e-tableofcontents", "x-tableofcontents"],
      ["e-badge", "x-badge"],
      ["e-colorswatch", "x-colorswatch"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
    expect(container.querySelector(".st-languageToggle__select")?.className).toContain("x-languagetoggle");
    // NavActionStack and NavItem take no rest props (identical to
    // components-react), so their className signals are read off the wrapper
    // through the container instead.
    expect(container.querySelector(".st-navActionStack")?.className).toContain("x-navactionstack");
    expect(container.querySelector(".st-navItem")?.className).toContain("x-navitem");
  });

  it("BackToTop keeps a consumer onClick and still scrolls to top", () => {
    const onClick = vi.fn();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    try {
      render(<BackToTop onClick={onClick} autoHide={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Retour en haut" }));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    } finally {
      scrollTo.mockRestore();
    }
  });

  it("BackToTop follows an autoHide signal mutated after mount", async () => {
    const autoHide = signal(true);
    const { container } = render(<BackToTop autoHide={autoHide} />);
    expect(container.querySelector("button")?.getAttribute("aria-hidden")).toBe("true");
    autoHide.value = false;
    await waitFor(() => expect(container.querySelector("button")?.getAttribute("aria-hidden")).toBeNull());
  });

  it("Header follows a sticky signal mutated after mount", async () => {
    const sticky = signal(false);
    const { container } = render(<Header sticky={sticky} />);
    expect(container.querySelector("header")?.className).not.toContain("st-header--sticky");
    sticky.value = true;
    await waitFor(() =>
      expect(container.querySelector("header")?.className).toContain("st-header--sticky"),
    );
  });

  it("LanguageToggle follows a locale signal mutated after mount", async () => {
    const locale = signal<"fr" | "en">("fr");
    render(<LanguageToggle locale={locale} />);
    expect((screen.getByLabelText("Langue") as HTMLSelectElement).value).toBe("fr");
    locale.value = "en";
    await waitFor(() => expect((screen.getByLabelText("Langue") as HTMLSelectElement).value).toBe("en"));
  });

  it("NavItem follows selected, status, count and divider signals mutated after mount and keeps onSelect", async () => {
    const selected = signal(false);
    const status = signal<"neutral" | "error">("neutral");
    const count = signal(2);
    const divider = signal(false);
    const onSelect = vi.fn();
    const { container } = render(
      <NavItem title="T" selected={selected} status={status} count={count} divider={divider} onSelect={onSelect} />,
    );
    const row = () => container.querySelector('[role="button"]') as HTMLElement;
    expect(row().getAttribute("aria-pressed")).toBe("false");
    selected.value = true;
    await waitFor(() => expect(row().getAttribute("aria-pressed")).toBe("true"));
    status.value = "error";
    await waitFor(() =>
      expect(container.querySelector(".st-navItem")?.className).toContain("st-navItem--status-error"),
    );
    expect(container.querySelector(".st-badge")?.textContent).toBe("2");
    count.value = 5;
    await waitFor(() => expect(container.querySelector(".st-badge")?.textContent).toBe("5"));
    expect(container.querySelector(".st-navItem__divider")).toBeNull();
    divider.value = true;
    await waitFor(() => expect(container.querySelector(".st-navItem__divider")).toBeTruthy());
    fireEvent.click(row());
    expect(onSelect).toHaveBeenCalledWith(false);
    await waitFor(() => expect(row().getAttribute("aria-pressed")).toBe("false"));
  });

  it("Stepper follows current and clickable signals mutated after mount and keeps onStepClick", async () => {
    const current = signal(0);
    const clickable = signal(false);
    const onStepClick = vi.fn();
    const { container } = render(
      <Stepper steps={[{ label: "A" }, { label: "B" }]} current={current} clickable={clickable} onStepClick={onStepClick} />,
    );
    const currentStep = () => container.querySelector('[aria-current="step"]');
    expect(currentStep()?.textContent).toContain("A");
    expect(container.querySelector("button")).toBeNull();
    clickable.value = true;
    await waitFor(() => expect(container.querySelectorAll("button")).toHaveLength(2));
    current.value = 1;
    await waitFor(() => expect(currentStep()?.textContent).toContain("B"));
    fireEvent.click(screen.getByLabelText("A"));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it("Pagination follows a page signal mutated after mount and keeps onPageChange", async () => {
    const page = signal(1);
    const onPageChange = vi.fn();
    const { container } = render(<Pagination page={page} totalPages={3} onPageChange={onPageChange} />);
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("1");
    page.value = 2;
    await waitFor(() => expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("2"));
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("PaginationNav follows a page signal mutated after mount", async () => {
    const page = signal(1);
    const { container } = render(<PaginationNav page={page} pageCount={5} />);
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("1");
    page.value = 3;
    await waitFor(() => expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("3"));
  });

  it("TableOfContents follows an activeId signal mutated after mount", async () => {
    const activeId = signal("a");
    const { container } = render(
      <TableOfContents items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} activeId={activeId} />,
    );
    expect(container.querySelector('[aria-current="location"]')?.textContent).toBe("A");
    activeId.value = "b";
    await waitFor(() => expect(container.querySelector('[aria-current="location"]')?.textContent).toBe("B"));
  });

  it("NavActionStack keeps consumer action handlers", () => {
    const onClick = vi.fn();
    render(<NavActionStack actions={[{ label: "A", onClick }]} />);
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
