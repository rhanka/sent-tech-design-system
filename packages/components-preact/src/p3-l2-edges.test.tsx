import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it } from "vitest";
import { Badge } from "./Badge.js";
import { ColorSwatch } from "./ColorSwatch.js";
import { Footer } from "./Footer.js";
import { Header } from "./Header.js";
import { LanguageToggle } from "./LanguageToggle.js";
import { NavActionStack } from "./NavActionStack.js";
import { NavItem } from "./NavItem.js";
import { SideNav } from "./SideNav.js";

afterEach(cleanup);

describe("P3 lane 2 edges (signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every P3 lane 2 module", () => {
    render(
      <>
        <Header data-testid="e-header" className={signal("x-header")} brand="B" />
        <Footer data-testid="e-footer" className={signal("x-footer")} brand="B" />
        <SideNav data-testid="e-sidenav" items={[]} className={signal("x-sidenav")} />
        <NavItem title="T" className={signal("x-navitem")} />
        <NavActionStack actions={[]} className={signal("x-stack")} />
        <LanguageToggle className={signal("x-lang")} locale="fr" />
        <Badge data-testid="e-badge" className={signal("x-badge")}>
          1
        </Badge>
        <ColorSwatch data-testid="e-swatch" color="#000" className={signal("x-swatch")} />
      </>,
    );
    for (const [testId, extra] of [
      ["e-header", "x-header"],
      ["e-footer", "x-footer"],
      ["e-sidenav", "x-sidenav"],
      ["e-badge", "x-badge"],
      ["e-swatch", "x-swatch"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
    expect(document.querySelector(".st-navItem")?.className).toContain("x-navitem");
    expect(document.querySelector(".st-navActionStack")?.className).toContain("x-stack");
    expect(document.querySelector(".st-languageToggle__select, .st-languageToggle")?.className).toContain(
      "x-lang",
    );
  });

  it("Header follows a sticky signal mutated after mount", async () => {
    const sticky = signal(false);
    const { container } = render(<Header brand="B" sticky={sticky} />);
    expect(container.querySelector("header")?.className).not.toContain("st-header--sticky");
    sticky.value = true;
    await waitFor(() => expect(container.querySelector("header")?.className).toContain("st-header--sticky"));
  });

  it("Header follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    const { container } = render(<Header brand="B" className={cls} />);
    expect(container.querySelector("header")?.className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(container.querySelector("header")?.className).toContain("x-after"));
    await waitFor(() => expect(container.querySelector("header")?.className).not.toContain("x-before"));
  });

  it("Footer follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    const { container } = render(<Footer brand="B" className={cls} />);
    expect(container.querySelector("footer")?.className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(container.querySelector("footer")?.className).toContain("x-after"));
  });

  it("SideNav follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    const { container } = render(<SideNav items={[{ label: "A", href: "/a" }]} className={cls} />);
    expect(container.querySelector("nav")?.className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(container.querySelector("nav")?.className).toContain("x-after"));
  });

  it("NavActionStack follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    const { container } = render(<NavActionStack actions={[{ label: "A" }]} className={cls} />);
    expect(container.querySelector(".st-navActionStack")?.className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(container.querySelector(".st-navActionStack")?.className).toContain("x-after"));
  });

  it("NavItem follows depth, status, selected, disabled, divider and count signals mutated after mount", async () => {
    const depth = signal<0 | 1 | 2 | 3>(0);
    const status = signal<"neutral" | "error">("neutral");
    const selected = signal(false);
    const disabled = signal(false);
    const divider = signal(false);
    const count = signal(2);
    const { container } = render(
      <NavItem
        title="Alerts"
        depth={depth}
        status={status}
        selected={selected}
        disabled={disabled}
        divider={divider}
        count={count}
      />,
    );
    const wrapper = () => container.querySelector(".st-navItem");
    const row = () => container.querySelector(".st-selectableRow");
    expect(wrapper()?.className).toContain("st-navItem--depth0");
    expect(wrapper()?.className).not.toContain("st-navItem--status-");
    expect(row()?.getAttribute("aria-pressed")).toBe("false");
    expect(row()?.getAttribute("aria-disabled")).toBeNull();
    expect(container.querySelector(".st-navItem__divider")).toBeNull();
    expect(container.querySelector(".st-badge")?.textContent?.trim()).toBe("2");

    depth.value = 2;
    status.value = "error";
    selected.value = true;
    disabled.value = true;
    divider.value = true;
    count.value = 7;

    await waitFor(() => expect(wrapper()?.className).toContain("st-navItem--depth2"));
    await waitFor(() => expect(wrapper()?.className).toContain("st-navItem--status-error"));
    await waitFor(() => expect(row()?.getAttribute("aria-pressed")).toBe("true"));
    await waitFor(() => expect(row()?.getAttribute("aria-disabled")).toBe("true"));
    await waitFor(() => expect(container.querySelector(".st-navItem__divider")).toBeTruthy());
    await waitFor(() => expect(container.querySelector(".st-badge")?.textContent?.trim()).toBe("7"));
    await waitFor(() => expect(container.querySelector(".st-badge")?.getAttribute("aria-label")).toBe("7 Alerts"));
  });

  it("NavItem treats signal(undefined) as absent for status and selected", async () => {
    const status = signal(undefined as never);
    const selected = signal(undefined as never);
    const { container } = render(<NavItem title="T" status={status} selected={selected} />);
    expect(container.querySelector(".st-navItem")?.className).not.toContain("st-navItem--status-");
    expect(container.querySelector(".st-selectableRow")?.getAttribute("aria-pressed")).toBe("false");
  });

  it("LanguageToggle follows a locale signal mutated after mount", async () => {
    const locale = signal<"fr" | "en">("fr");
    render(<LanguageToggle locale={locale} />);
    const select = screen.getByLabelText("Langue") as HTMLSelectElement;
    expect(select.value).toBe("fr");
    locale.value = "en";
    await waitFor(() => expect((screen.getByLabelText("Langue") as HTMLSelectElement).value).toBe("en"));
  });

  it("LanguageToggle follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    render(<LanguageToggle locale="fr" className={cls} />);
    expect(screen.getByLabelText("Langue").className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(screen.getByLabelText("Langue").className).toContain("x-after"));
  });

  it("LanguageToggle follows a locale signal in accordion variant", async () => {
    const locale = signal<"fr" | "en">("fr");
    const { container } = render(<LanguageToggle locale={locale} variant="accordion" />);
    (container.querySelector(".st-languageToggle__accordionTrigger") as HTMLButtonElement).click();
    await waitFor(() =>
      expect(
        container.querySelectorAll(".st-languageToggle__option")[0].className,
      ).toContain("st-languageToggle__option--active"),
    );
    locale.value = "en";
    await waitFor(() =>
      expect(
        container.querySelectorAll(".st-languageToggle__option")[1].className,
      ).toContain("st-languageToggle__option--active"),
    );
  });

  it("Badge follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    const { container } = render(
      <Badge className={cls} tone="info">
        3
      </Badge>,
    );
    expect(container.querySelector(".st-badge")?.className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(container.querySelector(".st-badge")?.className).toContain("x-after"));
  });

  it("ColorSwatch follows a className signal mutated after mount", async () => {
    const cls = signal("x-before");
    const { container } = render(<ColorSwatch color="#16a34a" className={cls} />);
    expect(container.querySelector(".st-colorSwatch")?.className).toContain("x-before");
    cls.value = "x-after";
    await waitFor(() => expect(container.querySelector(".st-colorSwatch")?.className).toContain("x-after"));
  });

  it("Header, Footer and SideNav accept string and signal styles via rest spread", async () => {
    const { container } = render(
      <>
        <Header brand="B" style="color: rgb(255, 0, 0)" />
        <Footer brand="B" style={{ color: "rgb(0, 0, 255)" }} />
        <SideNav items={[]} style={signal({ color: "rgb(0, 255, 0)" })} />
      </>,
    );
    await waitFor(() => expect(container.querySelector("header")?.style.color).toBe("rgb(255, 0, 0)"));
    await waitFor(() => expect(container.querySelector("footer")?.style.color).toBe("rgb(0, 0, 255)"));
    await waitFor(() => expect(container.querySelector("nav")?.style.color).toBe("rgb(0, 255, 0)"));
  });
});
