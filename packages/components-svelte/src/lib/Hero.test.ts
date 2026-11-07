import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Hero from "./Hero.svelte";

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));
const source = readFileSync(resolve("src/lib/Hero.svelte"), "utf8");

describe("Hero", () => {
  it("defaults to the full, centered size with a decorative overlay", () => {
    const { container } = render(Hero, { props: { title: "Architecture IA" } });
    const root = container.querySelector("section.st-hero") as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.classList.contains("st-hero--full")).toBe(true);
    expect(root.classList.contains("st-hero--align-center")).toBe(true);
    const backdrop = root.querySelector(".st-hero__backdrop") as HTMLElement;
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.querySelector(".st-hero__overlay")).toBeTruthy();
    expect(backdrop.querySelector("img")).toBeNull();
    expect(root.querySelector("h1.st-hero__title")?.textContent).toBe("Architecture IA");
    expect(root.querySelector(".st-hero__scrollCue")).toBeNull();
  });

  it("renders the background image as a decorative img and can drop the overlay", () => {
    const { container } = render(Hero, { props: { image: "/hero.jpg", overlay: false } });
    const img = container.querySelector(".st-hero__image") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/hero.jpg");
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("fetchpriority")).toBe("high");
    expect(container.querySelector(".st-hero__overlay")).toBeNull();
  });

  it("compact size aligns to start and accepts an h2 heading", () => {
    const { container } = render(Hero, {
      props: { size: "compact", title: "Article", subtitle: "Résumé", headingLevel: 2 }
    });
    const root = container.querySelector(".st-hero") as HTMLElement;
    expect(root.classList.contains("st-hero--compact")).toBe(true);
    expect(root.classList.contains("st-hero--align-start")).toBe(true);
    expect(root.querySelector("h2.st-hero__title")?.textContent).toBe("Article");
    expect(root.querySelector("p.st-hero__subtitle")?.textContent).toBe("Résumé");
    expect(root.querySelector(".st-hero__image")?.getAttribute("fetchpriority") ?? null).toBeNull();
  });

  it("renders leading, actions and children in order", () => {
    const { container } = render(Hero, {
      props: {
        title: "T",
        leading: snippet("<a href='/blog'>Retour</a>"),
        actions: snippet("<button>Contact</button>"),
        children: snippet("<div class='cards'>cards</div>")
      }
    });
    const intro = container.querySelector(".st-hero__intro") as HTMLElement;
    const order = Array.from(intro.children).map((el) => el.className.split(/\s+/)[0]);
    expect(order).toEqual(["st-hero__leading", "st-hero__title", "st-hero__actions"]);
    expect(container.querySelector(".st-hero__content .cards")).toBeTruthy();
  });

  it("scroll cue is decorative without href and a labelled link with one", () => {
    const decorative = render(Hero, { props: { scrollCue: true } });
    const cue = decorative.container.querySelector(".st-hero__scrollCue") as HTMLElement;
    expect(cue.tagName).toBe("SPAN");
    expect(cue.getAttribute("aria-hidden")).toBe("true");
    decorative.unmount();

    const linked = render(Hero, {
      props: { scrollCue: true, scrollCueHref: "#services", scrollCueLabel: "Voir les services" }
    });
    const link = linked.container.querySelector("a.st-hero__scrollCue") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("#services");
    expect(link.getAttribute("aria-label")).toBe("Voir les services");
  });

  it("passes id and attributes through for anchor targets", () => {
    const { container } = render(Hero, { props: { id: "top", "aria-label": "Accueil" } });
    const root = container.querySelector(".st-hero") as HTMLElement;
    expect(root.id).toBe("top");
    expect(root.getAttribute("aria-label")).toBe("Accueil");
  });

  it("styles are token-driven: overlay reads the hero/gradient tokens, no raw colour without a var()", () => {
    expect(source).toContain("var(\n      --st-component-hero-overlay,");
    expect(source).toContain("--st-semantic-gradient-hero");
    expect(source).toContain("--st-component-hero-overlayOpacity, 0.9");
    const style = source.slice(source.indexOf("<style>"));
    const rawColours = style
      .split("\n")
      .filter((line) => /#[0-9a-f]{3,8}\b/i.test(line) && !/var\(/.test(line));
    expect(rawColours).toEqual([]);
  });
});

describe("Hero — links on the overlay", () => {
  it("re-points the DS Link colour tokens to the hero text colour inside the intro", () => {
    const intro = source.slice(source.indexOf(".st-hero__intro {"));
    const block = intro.slice(0, intro.indexOf("}"));
    expect(block).toContain("--st-component-link-text: currentColor;");
    expect(block).toContain("--st-component-link-hoverText: currentColor;");
  });
});
