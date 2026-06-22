import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import AppHeader from "./lib/AppHeader.svelte";
import LanguageToggle from "./lib/LanguageToggle.svelte";
import IdentityMenu, { identityInitial } from "./lib/IdentityMenu.svelte";

const snippet = (html: string) =>
  createRawSnippet(() => ({ render: () => `<span>${html}</span>` }));

describe("AppHeader", () => {
  it("renders desktop nav + actions and hides the burger when not compact", () => {
    const { container } = render(AppHeader, {
      props: {
        nav: snippet("nav-content"),
        logo: snippet("SENT"),
        actions: snippet("actions-content"),
      },
    });
    expect(container.querySelector(".st-appHeader")).toBeTruthy();
    expect(container.querySelector(".st-appHeader__nav")?.textContent).toContain("nav-content");
    expect(container.querySelector(".st-appHeader__logo")?.textContent).toContain("SENT");
    expect(container.querySelector(".st-appHeader__actions")?.textContent).toContain("actions-content");
    expect(container.querySelector(".st-appHeader__burger")).toBeNull();
  });

  it("shows the burger on the RIGHT in compact mode and toggles", async () => {
    const onMenuToggle = vi.fn();
    const { container } = render(AppHeader, {
      props: { compact: true, menuLabel: "Menu", logo: snippet("SENT"), onMenuToggle },
    });
    const bar = container.querySelector(".st-appHeader__bar") as HTMLElement;
    const burger = container.querySelector(".st-appHeader__burger") as HTMLElement;
    const button = burger.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    // Burger must be the LAST child of the bar (i.e. on the right), logo first.
    expect(bar.lastElementChild).toBe(burger);
    expect(bar.firstElementChild).toBe(container.querySelector(".st-appHeader__logo"));
    // Desktop nav + actions are hidden in compact mode.
    expect(container.querySelector(".st-appHeader__nav")).toBeNull();
    expect(container.querySelector(".st-appHeader__actions")).toBeNull();
    await fireEvent.click(button);
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it("renders the drawer when compact + menuOpen", () => {
    const { container } = render(AppHeader, {
      props: { compact: true, menuOpen: true, drawer: snippet("drawer-content") },
    });
    const drawer = container.querySelector(".st-appHeader__drawer") as HTMLElement;
    expect(drawer).toBeTruthy();
    expect(drawer.textContent).toContain("drawer-content");
    expect(container.querySelector("button.st-appHeader__burgerButton")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("wires aria-controls (burger) to the drawer id (a11y)", () => {
    const { container } = render(AppHeader, {
      props: { compact: true, menuOpen: true, drawer: snippet("drawer-content") },
    });
    const button = container.querySelector("button.st-appHeader__burgerButton") as HTMLButtonElement;
    const drawer = container.querySelector(".st-appHeader__drawer") as HTMLElement;
    const controls = button.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(drawer.id).toBe(controls);
  });

  it("honours a provided drawerId on both burger and drawer", () => {
    const { container } = render(AppHeader, {
      props: { compact: true, menuOpen: true, drawerId: "my-drawer", drawer: snippet("x") },
    });
    expect(container.querySelector("button.st-appHeader__burgerButton")?.getAttribute("aria-controls")).toBe("my-drawer");
    expect((container.querySelector(".st-appHeader__drawer") as HTMLElement).id).toBe("my-drawer");
  });

  it("renders the canonical brand block (logo + name + product) from props", () => {
    const { container } = render(AppHeader, {
      props: {
        brandName: "Sentropic",
        productName: "dataviz",
        logoSrc: "/SENT-logo-squared.svg",
        brandHref: "/home",
        brandMode: "full",
      },
    });
    const brand = container.querySelector("a.st-appHeader__brand") as HTMLAnchorElement;
    expect(brand).toBeTruthy();
    expect(brand.getAttribute("href")).toBe("/home");
    // aria-label dérivé de brandName + productName.
    expect(brand.getAttribute("aria-label")).toBe("Sentropic dataviz");
    const mark = container.querySelector("img.st-appHeader__brandMark") as HTMLImageElement;
    expect(mark.getAttribute("src")).toBe("/SENT-logo-squared.svg");
    expect(container.querySelector(".st-appHeader__brandName")?.textContent).toBe("Sentropic");
    expect(container.querySelector(".st-appHeader__brandProduct")?.textContent).toBe("dataviz");
  });

  it("prefers the logo snippet over the default brand block when both are supplied", () => {
    const { container } = render(AppHeader, {
      props: { logo: snippet("CUSTOM"), brandName: "Sentropic", logoSrc: "/x.svg" },
    });
    expect(container.querySelector(".st-appHeader__logo")?.textContent).toContain("CUSTOM");
    expect(container.querySelector(".st-appHeader__brand")).toBeNull();
  });

  it("omits the default brand entirely when no brand props are provided", () => {
    const { container } = render(AppHeader, { props: { nav: snippet("n") } });
    expect(container.querySelector(".st-appHeader__brand")).toBeNull();
    expect(container.querySelector(".st-appHeader__logo")).toBeNull();
  });
});

describe("LanguageToggle", () => {
  it("renders the <select> variant calquing the source", () => {
    const { container } = render(LanguageToggle, {
      props: { locale: "fr", frLabel: "FR", enLabel: "EN" },
    });
    const select = container.querySelector("select.st-languageToggle__select") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("fr");
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["fr", "en"]);
  });

  it("calls onLocaleChange when the select changes", async () => {
    const onLocaleChange = vi.fn();
    const { container } = render(LanguageToggle, {
      props: { locale: "fr", onLocaleChange },
    });
    const select = container.querySelector("select") as HTMLSelectElement;
    await fireEvent.change(select, { target: { value: "en" } });
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });

  it("calls onLocaleChange from the accordion option buttons", async () => {
    const onLocaleChange = vi.fn();
    const { container, getByText } = render(LanguageToggle, {
      props: { variant: "accordion", locale: "fr", accordionLabel: "Langue", onLocaleChange },
    });
    // Open the accordion.
    await fireEvent.click(container.querySelector(".st-languageToggle__accordionTrigger") as HTMLButtonElement);
    await fireEvent.click(getByText("EN"));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });

  it("associates a <label for> with the <select> (a11y)", () => {
    const { container } = render(LanguageToggle, {
      props: { locale: "fr", label: "Choisir la langue" },
    });
    const select = container.querySelector("select.st-languageToggle__select") as HTMLSelectElement;
    const label = container.querySelector("label.st-languageToggle__srLabel") as HTMLLabelElement;
    expect(select.id).toBeTruthy();
    expect(label).toBeTruthy();
    expect(label.getAttribute("for")).toBe(select.id);
    expect(label.textContent).toBe("Choisir la langue");
  });

  it("honours a provided selectId on both label and select", () => {
    const { container } = render(LanguageToggle, {
      props: { locale: "fr", selectId: "lang-sel" },
    });
    expect((container.querySelector("select") as HTMLSelectElement).id).toBe("lang-sel");
    expect((container.querySelector("label.st-languageToggle__srLabel") as HTMLLabelElement).getAttribute("for")).toBe("lang-sel");
  });
});

describe("IdentityMenu", () => {
  const user = { displayName: "Ada Lovelace", email: "ada@example.com", id: "1" };

  it("derives the avatar initial from the displayName", () => {
    expect(identityInitial(user)).toBe("A");
    expect(identityInitial(null)).toBe("U");
  });

  it("renders the login button when not authenticated", async () => {
    const onLogin = vi.fn();
    const { container, getByText } = render(IdentityMenu, {
      props: { user: null, isAuthenticated: false, loginLabel: "Se connecter", onLogin },
    });
    expect(container.querySelector(".st-identityMenu__trigger")).toBeNull();
    const login = getByText("Se connecter");
    await fireEvent.click(login);
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("renders the avatar + name trigger when authenticated", () => {
    const { container } = render(IdentityMenu, {
      props: { user, isAuthenticated: true },
    });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".st-identityMenu__avatar")?.textContent).toBe("AL");
    expect(container.querySelector(".st-identityMenu__name")?.textContent).toContain("Ada Lovelace");
    expect(container.querySelector("button.st-identityMenu__login")).toBeNull();
  });

  it("opens the dropdown and fires onLogout from the danger item", async () => {
    const onLogout = vi.fn();
    const { container, getByRole } = render(IdentityMenu, {
      props: { user, isAuthenticated: true, logoutLabel: "Se déconnecter", onLogout },
    });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = getByRole("menu");
    expect(menu).toBeTruthy();
    const logout = container.querySelector(".st-identityMenu__item--danger") as HTMLButtonElement;
    expect(logout.textContent).toContain("Se déconnecter");
    await fireEvent.click(logout);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("exposes devices/settings links with the provided hrefs", async () => {
    const { container } = render(IdentityMenu, {
      props: {
        user,
        isAuthenticated: true,
        devicesHref: "/auth/devices",
        settingsHref: "/settings",
        devicesLabel: "Appareils",
        settingsLabel: "Paramètres",
      },
    });
    await fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]'));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/auth/devices", "/settings"]);
  });

  it("supports keyboard navigation (ArrowDown opens + focuses, Escape closes)", async () => {
    const { container } = render(IdentityMenu, {
      props: { user, isAuthenticated: true },
    });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    await fireEvent.keyDown(menu, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("focuses the first item on open (ArrowDown)", async () => {
    const { container } = render(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await tick();
    // Laisse passer la microtâche qui pose le focus (queueMicrotask).
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(document.activeElement).toBe(items[0]);
  });

  it.each(["Enter", " "])("activates a link item with %s (Space too)", async (key) => {
    const { container } = render(IdentityMenu, {
      props: { user, isAuthenticated: true, devicesHref: "/auth/devices" },
    });
    await fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    const devices = container.querySelector('a[role="menuitem"]') as HTMLAnchorElement;
    const clicked = vi.fn();
    devices.addEventListener("click", clicked);
    await fireEvent.keyDown(devices, { key });
    // Enter ET Space déclenchent un clic natif sur le <a role=menuitem>.
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("traps focus with Tab / Shift+Tab inside the menu", async () => {
    const { container } = render(IdentityMenu, { props: { user, isAuthenticated: true } });
    await fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    // Focus last item then Tab → wraps to first.
    items[items.length - 1].focus();
    await fireEvent.keyDown(menu, { key: "Tab" });
    expect(document.activeElement).toBe(items[0]);
    // Shift+Tab from first → wraps to last.
    await fireEvent.keyDown(menu, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it("closes from the trigger with Escape (global to the open component)", async () => {
    const { container } = render(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("restores focus to the trigger when closing via Escape", async () => {
    const { container } = render(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.click(trigger);
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    await fireEvent.keyDown(menu, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });

  it("restores focus to the trigger after selecting an item", async () => {
    const { container } = render(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.click(trigger);
    const devices = container.querySelector('a[role="menuitem"]') as HTMLAnchorElement;
    await fireEvent.click(devices);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on outside click and restores focus to the trigger", async () => {
    const { container } = render(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await fireEvent.pointerDown(document.body);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("supports a controlled open + onOpenChange (controlled/uncontrolled pattern)", async () => {
    const onOpenChange = vi.fn();
    const { container } = render(IdentityMenu, {
      props: { user, isAuthenticated: true, open: false, onOpenChange },
    });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    // Controlled closed → menu absent.
    expect(container.querySelector('[role="menu"]')).toBeNull();
    await fireEvent.click(trigger);
    // Parent is notified; the component does not flip itself while controlled.
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("reflects a controlled open=true by rendering the menu", () => {
    const { container } = render(IdentityMenu, {
      props: { user, isAuthenticated: true, open: true },
    });
    expect(container.querySelector('[role="menu"]')).toBeTruthy();
    expect(container.querySelector(".st-identityMenu__trigger")?.getAttribute("aria-expanded")).toBe("true");
  });
});
