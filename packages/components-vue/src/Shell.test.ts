import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { AppHeader, LanguageToggle, IdentityMenu, identityInitial } from "./index.js";

describe("AppHeader", () => {
  it("renders desktop nav + actions and hides the burger when not compact", () => {
    const wrapper = mount(AppHeader, {
      slots: {
        nav: () => h("a", { href: "/x" }, "nav-content"),
        logo: () => h("span", "SENT"),
        actions: () => h("span", "actions-content"),
      },
    });
    expect(wrapper.find(".st-appHeader").exists()).toBe(true);
    expect(wrapper.find(".st-appHeader__nav").text()).toContain("nav-content");
    expect(wrapper.find(".st-appHeader__logo").text()).toContain("SENT");
    expect(wrapper.find(".st-appHeader__actions").text()).toContain("actions-content");
    expect(wrapper.find(".st-appHeader__burger").exists()).toBe(false);
  });

  it("shows the burger on the RIGHT in compact mode and toggles", async () => {
    const wrapper = mount(AppHeader, {
      props: { compact: true, menuLabel: "Menu" },
      slots: { logo: () => h("span", "SENT") },
    });
    const bar = wrapper.find(".st-appHeader__bar");
    const burger = wrapper.find(".st-appHeader__burger");
    const button = burger.find("button");
    expect(button.attributes("aria-label")).toBe("Menu");
    expect(button.attributes("aria-expanded")).toBe("false");
    // Burger must be the LAST child of the bar (i.e. on the right), logo first.
    expect((bar.element.lastElementChild as HTMLElement).classList.contains("st-appHeader__burger")).toBe(true);
    expect((bar.element.firstElementChild as HTMLElement).classList.contains("st-appHeader__logo")).toBe(true);
    expect(wrapper.find(".st-appHeader__nav").exists()).toBe(false);
    expect(wrapper.find(".st-appHeader__actions").exists()).toBe(false);
    await button.trigger("click");
    expect(wrapper.emitted("menuToggle")).toHaveLength(1);
  });

  it("renders the drawer when compact + menuOpen", () => {
    const wrapper = mount(AppHeader, {
      props: { compact: true, menuOpen: true },
      slots: { drawer: () => h("nav", "drawer-content") },
    });
    const drawer = wrapper.find(".st-appHeader__drawer");
    expect(drawer.exists()).toBe(true);
    expect(drawer.text()).toContain("drawer-content");
    expect(wrapper.find("button.st-appHeader__burgerButton").attributes("aria-expanded")).toBe("true");
  });

  it("wires aria-controls (burger) to the drawer id (a11y)", () => {
    const wrapper = mount(AppHeader, {
      props: { compact: true, menuOpen: true },
      slots: { drawer: () => h("nav", "drawer-content") },
    });
    const button = wrapper.find("button.st-appHeader__burgerButton");
    const drawer = wrapper.find(".st-appHeader__drawer");
    const controls = button.attributes("aria-controls");
    expect(controls).toBeTruthy();
    expect(drawer.attributes("id")).toBe(controls);
  });

  it("honours a provided drawerId on both burger and drawer", () => {
    const wrapper = mount(AppHeader, {
      props: { compact: true, menuOpen: true, drawerId: "my-drawer" },
      slots: { drawer: () => h("nav", "x") },
    });
    expect(wrapper.find("button.st-appHeader__burgerButton").attributes("aria-controls")).toBe("my-drawer");
    expect(wrapper.find(".st-appHeader__drawer").attributes("id")).toBe("my-drawer");
  });

  it("renders the canonical brand block (logo + name + product) from props", () => {
    const wrapper = mount(AppHeader, {
      props: {
        brandName: "Sentropic",
        productName: "dataviz",
        logoSrc: "/SENT-logo-squared.svg",
        brandHref: "/home",
      },
    });
    const brand = wrapper.find("a.st-appHeader__brand");
    expect(brand.exists()).toBe(true);
    expect(brand.attributes("href")).toBe("/home");
    expect(brand.attributes("aria-label")).toBe("Sentropic dataviz");
    expect(wrapper.find("img.st-appHeader__brandMark").attributes("src")).toBe("/SENT-logo-squared.svg");
    expect(wrapper.find(".st-appHeader__brandName").text()).toBe("Sentropic");
    expect(wrapper.find(".st-appHeader__brandProduct").text()).toBe("dataviz");
  });

  it("prefers the logo slot over the default brand block when both are supplied", () => {
    const wrapper = mount(AppHeader, {
      props: { brandName: "Sentropic", logoSrc: "/x.svg" },
      slots: { logo: () => h("span", "CUSTOM") },
    });
    expect(wrapper.find(".st-appHeader__logo").text()).toContain("CUSTOM");
    expect(wrapper.find(".st-appHeader__brand").exists()).toBe(false);
  });

  it("omits the default brand entirely when no brand props are provided", () => {
    const wrapper = mount(AppHeader, { slots: { nav: () => h("a", { href: "/" }, "n") } });
    expect(wrapper.find(".st-appHeader__brand").exists()).toBe(false);
    expect(wrapper.find(".st-appHeader__logo").exists()).toBe(false);
  });
});

describe("LanguageToggle", () => {
  it("renders the <select> variant calquing the source", () => {
    const wrapper = mount(LanguageToggle, { props: { locale: "fr" } });
    const select = wrapper.find("select.st-languageToggle__select");
    expect(select.exists()).toBe(true);
    expect((select.element as HTMLSelectElement).value).toBe("fr");
    const options = wrapper.findAll("option").map((o) => o.attributes("value"));
    expect(options).toEqual(["fr", "en"]);
  });

  it("emits localeChange when the select changes", async () => {
    const wrapper = mount(LanguageToggle, { props: { locale: "fr" } });
    const select = wrapper.find("select");
    await select.setValue("en");
    expect(wrapper.emitted("localeChange")?.[0]).toEqual(["en"]);
  });

  it("emits localeChange from the accordion option buttons", async () => {
    const wrapper = mount(LanguageToggle, {
      props: { variant: "accordion", locale: "fr", accordionLabel: "Langue" },
    });
    await wrapper.find(".st-languageToggle__accordionTrigger").trigger("click");
    const options = wrapper.findAll(".st-languageToggle__option");
    await options[1].trigger("click");
    expect(wrapper.emitted("localeChange")?.[0]).toEqual(["en"]);
  });

  it("associates a <label for> with the <select> (a11y)", () => {
    const wrapper = mount(LanguageToggle, { props: { locale: "fr", label: "Choisir la langue" } });
    const select = wrapper.find("select.st-languageToggle__select");
    const label = wrapper.find("label.st-languageToggle__srLabel");
    const selectId = select.attributes("id");
    expect(selectId).toBeTruthy();
    expect(label.exists()).toBe(true);
    expect(label.attributes("for")).toBe(selectId);
    expect(label.text()).toBe("Choisir la langue");
  });

  it("honours a provided selectId on both label and select", () => {
    const wrapper = mount(LanguageToggle, { props: { locale: "fr", selectId: "lang-sel" } });
    expect(wrapper.find("select").attributes("id")).toBe("lang-sel");
    expect(wrapper.find("label.st-languageToggle__srLabel").attributes("for")).toBe("lang-sel");
  });
});

describe("IdentityMenu", () => {
  const user = { displayName: "Ada Lovelace", email: "ada@example.com", id: "1" };

  it("derives the avatar initial from the displayName", () => {
    expect(identityInitial(user)).toBe("A");
    expect(identityInitial(null)).toBe("U");
  });

  it("renders the login button when not authenticated", async () => {
    const wrapper = mount(IdentityMenu, {
      props: { user: null, isAuthenticated: false, loginLabel: "Se connecter" },
    });
    expect(wrapper.find(".st-identityMenu__trigger").exists()).toBe(false);
    const login = wrapper.find(".st-identityMenu__login");
    expect(login.text()).toContain("Se connecter");
    await login.trigger("click");
    expect(wrapper.emitted("login")).toHaveLength(1);
  });

  it("renders the avatar + name trigger when authenticated", () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    expect(trigger.exists()).toBe(true);
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find(".st-identityMenu__avatar").text()).toBe("A");
    expect(wrapper.find(".st-identityMenu__name").text()).toContain("Ada Lovelace");
    expect(wrapper.find("button.st-identityMenu__login").exists()).toBe(false);
  });

  it("opens the dropdown and emits logout from the danger item", async () => {
    const wrapper = mount(IdentityMenu, {
      props: { user, isAuthenticated: true, logoutLabel: "Se déconnecter" },
    });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    const logout = wrapper.find(".st-identityMenu__item--danger");
    expect(logout.text()).toContain("Se déconnecter");
    await logout.trigger("click");
    expect(wrapper.emitted("logout")).toHaveLength(1);
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("exposes devices/settings links with the provided hrefs", async () => {
    const wrapper = mount(IdentityMenu, {
      props: {
        user,
        isAuthenticated: true,
        devicesHref: "/auth/devices",
        settingsHref: "/settings",
        devicesLabel: "Appareils",
        settingsLabel: "Paramètres",
      },
    });
    await wrapper.find(".st-identityMenu__trigger").trigger("click");
    const links = wrapper.findAll('a[role="menuitem"]');
    expect(links.map((a) => a.attributes("href"))).toEqual(["/auth/devices", "/settings"]);
  });

  it("supports keyboard navigation (ArrowDown opens, Escape closes)", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    expect(trigger.attributes("aria-expanded")).toBe("true");
    await wrapper.find('[role="menu"]').trigger("keydown", { key: "Escape" });
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("focuses the first item on open (ArrowDown)", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true }, attachTo: document.body });
    await wrapper.find(".st-identityMenu__trigger").trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();
    const items = wrapper.findAll('[role="menuitem"]');
    expect(document.activeElement).toBe(items[0].element);
    wrapper.unmount();
  });

  it.each(["Enter", " "])("activates a link item with %s (Space too)", async (key) => {
    const wrapper = mount(IdentityMenu, {
      props: { user, isAuthenticated: true, devicesHref: "/auth/devices" },
      attachTo: document.body,
    });
    await wrapper.find(".st-identityMenu__trigger").trigger("click");
    const devices = wrapper.find('a[role="menuitem"]');
    const clicked = vi.fn();
    devices.element.addEventListener("click", clicked);
    await devices.trigger("keydown", { key });
    expect(clicked).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it("traps focus with Tab / Shift+Tab inside the menu", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true }, attachTo: document.body });
    await wrapper.find(".st-identityMenu__trigger").trigger("click");
    const menu = wrapper.find('[role="menu"]');
    const items = wrapper.findAll('[role="menuitem"]');
    (items[items.length - 1].element as HTMLElement).focus();
    await menu.trigger("keydown", { key: "Tab" });
    expect(document.activeElement).toBe(items[0].element);
    await menu.trigger("keydown", { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(items[items.length - 1].element);
    wrapper.unmount();
  });

  it("closes from the trigger with Escape (global to the open component)", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    await trigger.trigger("keydown", { key: "Escape" });
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("restores focus to the trigger when closing via Escape", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true }, attachTo: document.body });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("click");
    await wrapper.find('[role="menu"]').trigger("keydown", { key: "Escape" });
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("restores focus to the trigger after selecting an item", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true }, attachTo: document.body });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("click");
    await wrapper.find('a[role="menuitem"]').trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("closes on outside click and restores focus to the trigger", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true }, attachTo: document.body });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await nextTick();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("supports a controlled open + openChange (controlled/uncontrolled pattern)", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true, open: false } });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
    await trigger.trigger("click");
    expect(wrapper.emitted("openChange")?.[0]).toEqual([true]);
    expect(wrapper.emitted("update:open")?.[0]).toEqual([true]);
  });

  it("reflects a controlled open=true by rendering the menu", () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true, open: true } });
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    expect(wrapper.find(".st-identityMenu__trigger").attributes("aria-expanded")).toBe("true");
  });
});
