import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Embed, DataImage } from "./index.js";

describe("Embed (FR2)", () => {
  it("renders a lazy iframe with src + required title inside a ratio container", () => {
    const el = mount(Embed, { props: { src: "https://example.com", title: "Carte interactive" } })
      .element as HTMLElement;
    const frame = el.querySelector("iframe");
    expect(frame).not.toBeNull();
    expect(frame?.getAttribute("src")).toBe("https://example.com");
    expect(frame?.getAttribute("title")).toBe("Carte interactive");
    expect(frame?.getAttribute("loading")).toBe("lazy");
    expect(el.querySelector(".st-aspectRatio")).not.toBeNull();
  });

  it("defaults to a strict sandbox and 16/9 ratio", () => {
    const el = mount(Embed, { props: { src: "https://example.com", title: "X" } }).element as HTMLElement;
    const frame = el.querySelector("iframe");
    expect(frame?.getAttribute("sandbox")).toBe("");
    expect((el.querySelector<HTMLElement>(".st-aspectRatio")?.style.aspectRatio || "").replace(/\s/g, "")).toBe("16/9");
  });

  it("honours a custom sandbox, aspectRatio and allow", () => {
    const el = mount(Embed, { props: { src: "s", title: "T", sandbox: "allow-scripts", aspectRatio: "4/3", allow: "fullscreen" } })
      .element as HTMLElement;
    const frame = el.querySelector("iframe");
    expect(frame?.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame?.getAttribute("allow")).toBe("fullscreen");
    expect((el.querySelector<HTMLElement>(".st-aspectRatio")?.style.aspectRatio || "").replace(/\s/g, "")).toBe("4/3");
  });

  it("allows eager iframe loading when needed", () => {
    const el = mount(Embed, { props: { src: "https://example.com", title: "Hero map", loading: "eager" } })
      .element as HTMLElement;
    expect(el.querySelector("iframe")?.getAttribute("loading")).toBe("eager");
  });
});

describe("DataImage (FR2)", () => {
  it("renders a lazy img with src + required alt", () => {
    const el = mount(DataImage, { props: { src: "/a.png", alt: "Aperçu" } }).element as HTMLImageElement;
    expect(el.getAttribute("src")).toBe("/a.png");
    expect(el.getAttribute("alt")).toBe("Aperçu");
    expect(el.getAttribute("loading")).toBe("lazy");
  });

  it("defaults fit to cover, applies contain when asked", () => {
    const cover = mount(DataImage, { props: { src: "/a.png", alt: "a" } }).element as HTMLElement;
    expect(cover.classList.contains("st-dataImage--cover")).toBe(true);
    const contain = mount(DataImage, { props: { src: "/a.png", alt: "a", fit: "contain" } }).element as HTMLElement;
    expect(contain.classList.contains("st-dataImage--contain")).toBe(true);
  });

  it("maps numeric width/height/radius to px styles", () => {
    const el = mount(DataImage, { props: { src: "/a.png", alt: "a", width: 120, height: 80, radius: 8 } })
      .element as HTMLImageElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("80px");
    expect(el.style.borderRadius).toBe("8px");
  });

  it("accepts CSS-length string dimensions verbatim", () => {
    const el = mount(DataImage, { props: { src: "/a.png", alt: "a", width: "100%", radius: "50%" } })
      .element as HTMLImageElement;
    expect(el.style.width).toBe("100%");
    expect(el.style.borderRadius).toBe("50%");
  });

  it("preserves caller style while applying dimensions", () => {
    const el = mount(DataImage, {
      props: { src: "/a.png", alt: "a", width: 120 },
      attrs: { style: "object-position: center;" },
    }).element as HTMLImageElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.objectPosition).toBe("center");
  });

  it("allows eager loading and decoding overrides", () => {
    const el = mount(DataImage, { props: { src: "/a.png", alt: "a", loading: "eager", decoding: "sync" } })
      .element as HTMLImageElement;
    expect(el.getAttribute("loading")).toBe("eager");
    expect(el.getAttribute("decoding")).toBe("sync");
  });
});
