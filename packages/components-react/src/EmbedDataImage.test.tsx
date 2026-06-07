import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Embed, DataImage } from "./index.js";

describe("Embed (FR2)", () => {
  it("renders a lazy iframe with src + required title inside a ratio container", () => {
    const { container } = render(<Embed src="https://example.com" title="Carte interactive" />);
    const frame = container.querySelector("iframe");
    expect(frame).not.toBeNull();
    expect(frame?.getAttribute("src")).toBe("https://example.com");
    expect(frame?.getAttribute("title")).toBe("Carte interactive");
    expect(frame?.getAttribute("loading")).toBe("lazy");
    expect(container.querySelector(".st-embed .st-aspectRatio")).not.toBeNull();
  });

  it("defaults to a strict sandbox and 16/9 ratio", () => {
    const { container } = render(<Embed src="https://example.com" title="X" />);
    const frame = container.querySelector("iframe");
    expect(frame?.getAttribute("sandbox")).toBe("");
    const ratioBox = container.querySelector<HTMLElement>(".st-aspectRatio");
    expect(ratioBox?.style.aspectRatio).toBe("16/9");
  });

  it("honours a custom sandbox, aspectRatio and allow", () => {
    const { container } = render(
      <Embed src="s" title="T" sandbox="allow-scripts" aspectRatio="4/3" allow="fullscreen" />,
    );
    const frame = container.querySelector("iframe");
    expect(frame?.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame?.getAttribute("allow")).toBe("fullscreen");
    expect(container.querySelector<HTMLElement>(".st-aspectRatio")?.style.aspectRatio).toBe("4/3");
  });

  it("allows eager iframe loading when needed", () => {
    const { container } = render(<Embed src="https://example.com" title="Hero map" loading="eager" />);
    expect(container.querySelector("iframe")?.getAttribute("loading")).toBe("eager");
  });
});

describe("DataImage (FR2)", () => {
  it("renders a lazy img with src + required alt", () => {
    const { container } = render(<DataImage src="/a.png" alt="Aperçu" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/a.png");
    expect(img?.getAttribute("alt")).toBe("Aperçu");
    expect(img?.getAttribute("loading")).toBe("lazy");
  });

  it("defaults fit to cover, applies contain when asked", () => {
    const cover = render(<DataImage src="/a.png" alt="a" />);
    expect(cover.container.querySelector("img")?.classList.contains("st-dataImage--cover")).toBe(true);
    const contain = render(<DataImage src="/a.png" alt="a" fit="contain" />);
    expect(contain.container.querySelector("img")?.classList.contains("st-dataImage--contain")).toBe(true);
  });

  it("maps numeric width/height/radius to px styles", () => {
    const { container } = render(<DataImage src="/a.png" alt="a" width={120} height={80} radius={8} />);
    const img = container.querySelector<HTMLImageElement>("img");
    expect(img?.style.width).toBe("120px");
    expect(img?.style.height).toBe("80px");
    expect(img?.style.borderRadius).toBe("8px");
  });

  it("accepts CSS-length string dimensions verbatim", () => {
    const { container } = render(<DataImage src="/a.png" alt="a" width="100%" radius="50%" />);
    const img = container.querySelector<HTMLImageElement>("img");
    expect(img?.style.width).toBe("100%");
    expect(img?.style.borderRadius).toBe("50%");
  });

  it("preserves caller style while applying dimensions", () => {
    const { container } = render(<DataImage src="/a.png" alt="a" width={120} style={{ objectPosition: "center" }} />);
    const img = container.querySelector<HTMLImageElement>("img");
    expect(img?.style.width).toBe("120px");
    expect(img?.style.objectPosition).toBe("center");
  });

  it("allows eager loading and decoding overrides", () => {
    const { container } = render(<DataImage src="/a.png" alt="a" loading="eager" decoding="sync" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("loading")).toBe("eager");
    expect(img?.getAttribute("decoding")).toBe("sync");
  });
});
