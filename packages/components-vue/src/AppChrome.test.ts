import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { AppChrome } from "./AppChrome.js";

const themes = [
  { id: "sent-tech", label: "Sentropic" },
  { id: "forge", label: "Forge" },
  { id: "entropic", label: "Entropic" },
  { id: "carbon", label: "Carbon" },
  { id: "dsfr", label: "DSFR" },
  { id: "airbus", label: "Airbus" },
];

const nav = [
  { label: "Vues", href: "/views", active: true },
  { label: "Données", href: "/data" },
  { label: "Réglages", href: "/settings" },
];

describe("AppChrome — marque", () => {
  it("renders the canonical brand block (logo + name + product)", () => {
    const wrapper = mount(AppChrome, {
      props: { brandName: "Sentropic", productName: "dataviz", logoSrc: "/SENT-logo-squared.svg", brandHref: "/home" },
    });
    const brand = wrapper.find("a.st-appChrome__brand");
    expect(brand.exists()).toBe(true);
    expect(brand.attributes("href")).toBe("/home");
    expect(brand.attributes("aria-label")).toBe("Sentropic dataviz");
    expect(wrapper.find("img.st-appChrome__brandMark").attributes("src")).toBe("/SENT-logo-squared.svg");
    expect(wrapper.find(".st-appChrome__brandName").text()).toBe("Sentropic");
    expect(wrapper.find(".st-appChrome__brandProduct").text()).toBe("dataviz");
  });

  it("defaults brandName to Sentropic", () => {
    const wrapper = mount(AppChrome, { props: { productName: "dataviz" } });
    expect(wrapper.find(".st-appChrome__brandName").text()).toBe("Sentropic");
  });
});

describe("AppChrome — navigation", () => {
  it("renders nav links and marks the active one with aria-current", () => {
    const wrapper = mount(AppChrome, { props: { nav } });
    const links = wrapper.findAll(".st-appChrome__navLink");
    expect(links.map((a) => a.text())).toEqual(["Vues", "Données", "Réglages"]);
    expect(links[0].attributes("aria-current")).toBe("page");
    expect(links[1].attributes("aria-current")).toBeUndefined();
    expect(links[0].classes()).toContain("st-appHeader__navLink");
  });
});

describe("AppChrome — contrôle thème", () => {
  it("shows the active theme label and fires onThemeChange on selection", async () => {
    const onThemeChange = vi.fn();
    const wrapper = mount(AppChrome, { props: { themes, theme: "sent-tech", onThemeChange } });
    const trigger = wrapper.find(".st-appChrome__themeWrap button");
    expect(trigger.text()).toContain("Sentropic");
    await trigger.trigger("click");
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    const carbon = wrapper.findAll(".st-appChrome__menuItem").find((b) => b.text().includes("Carbon"))!;
    await carbon.trigger("click");
    expect(onThemeChange).toHaveBeenCalledWith("carbon");
  });

  it("hides the theme selector when themes is empty", () => {
    const wrapper = mount(AppChrome);
    expect(wrapper.find(".st-appChrome__themeWrap").exists()).toBe(false);
  });
});

describe("AppChrome — mode couleur", () => {
  it("cycles light -> dark -> auto via onColorModeChange", async () => {
    const onColorModeChange = vi.fn();
    const wrapper = mount(AppChrome, { props: { colorMode: "light", onColorModeChange } });
    await wrapper.find(".st-appChrome__iconControl").trigger("click");
    expect(onColorModeChange).toHaveBeenCalledWith("dark");
    await wrapper.setProps({ colorMode: "dark" });
    await wrapper.find(".st-appChrome__iconControl").trigger("click");
    expect(onColorModeChange).toHaveBeenLastCalledWith("auto");
    await wrapper.setProps({ colorMode: "auto" });
    await wrapper.find(".st-appChrome__iconControl").trigger("click");
    expect(onColorModeChange).toHaveBeenLastCalledWith("light");
  });

  it("hides the color-mode toggle when colorMode is undefined", () => {
    const wrapper = mount(AppChrome, { props: { nav } });
    expect(wrapper.find(".st-appChrome__iconControl").exists()).toBe(false);
  });
});

describe("AppChrome — langue", () => {
  it("shows the active locale and fires onLocaleChange on selection", async () => {
    const onLocaleChange = vi.fn();
    const wrapper = mount(AppChrome, { props: { locale: "fr", onLocaleChange } });
    const trigger = wrapper.find(".st-appChrome__localeWrap button");
    expect(trigger.text()).toContain("FR");
    await trigger.trigger("click");
    const en = wrapper.findAll(".st-appChrome__menuItem").find((b) => b.text().includes("English"))!;
    await en.trigger("click");
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });
});

describe("AppChrome — github + identité", () => {
  it("renders the github link with the provided href", () => {
    const wrapper = mount(AppChrome, { props: { githubHref: "https://github.com/x/y" } });
    const link = wrapper.find('.st-appChrome__utilityNav a[target="_blank"]');
    expect(link.attributes("href")).toBe("https://github.com/x/y");
  });

  it("renders the identity slot content", () => {
    const wrapper = mount(AppChrome, { slots: { identity: () => h("span", "account-zone") } });
    expect(wrapper.find(".st-appChrome__identity").text()).toContain("account-zone");
  });
});

describe("AppChrome — mobile burger + tiroir", () => {
  it("wires the burger aria-controls to the drawer id and renders the drawer when open", () => {
    const wrapper = mount(AppChrome, { props: { nav, mobileMenuOpen: true } });
    const burger = wrapper.find(".st-appChrome__burgerTrigger");
    const drawer = wrapper.find(".st-appChrome__drawer");
    expect(drawer.exists()).toBe(true);
    expect(burger.attributes("aria-expanded")).toBe("true");
    expect(burger.attributes("aria-controls")).toBe(drawer.attributes("id"));
    expect(wrapper.findAll(".st-appChrome__drawerLink").length).toBeGreaterThanOrEqual(3);
  });

  it("does not render the drawer when closed and toggles via callback", async () => {
    const onMobileMenuToggle = vi.fn();
    const wrapper = mount(AppChrome, { props: { nav, onMobileMenuToggle } });
    expect(wrapper.find(".st-appChrome__drawer").exists()).toBe(false);
    await wrapper.find(".st-appChrome__burgerTrigger").trigger("click");
    expect(onMobileMenuToggle).toHaveBeenCalledTimes(1);
  });
});

describe("AppChrome — extraSelectors", () => {
  it("renders extraSelectors slot content in the utility nav", () => {
    const wrapper = mount(AppChrome, { slots: { extraSelectors: () => h("span", "extra-ctrl") } });
    expect(wrapper.find(".st-appChrome__extraSelectors").text()).toContain("extra-ctrl");
  });

  it("does not render extraSelectors div when not provided", () => {
    const wrapper = mount(AppChrome);
    expect(wrapper.find(".st-appChrome__extraSelectors").exists()).toBe(false);
  });
});
