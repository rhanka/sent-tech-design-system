import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";
import Section from "./Section.svelte";

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));
const source = readFileSync(resolve("src/lib/Section.svelte"), "utf8");

describe("Section", () => {
  it("defaults to a default-tone, lg-rhythm band with content in an xl Container", () => {
    const { container } = render(Section, { props: { children: snippet("<p class='body'>x</p>") } });
    const root = container.querySelector("section.st-section") as HTMLElement;
    expect(root.classList.contains("st-section--default")).toBe(true);
    expect(root.classList.contains("st-section--spacing-lg")).toBe(true);
    const inner = root.querySelector(".st-container") as HTMLElement;
    expect(inner.classList.contains("st-container--xl")).toBe(true);
    expect(inner.querySelector(".body")).toBeTruthy();
    expect(root.querySelector(".st-section__header")).toBeNull();
  });

  it.each(["default", "subtle", "inverse", "gradient"] as const)("tone=%s sets its modifier", (tone) => {
    const { container } = render(Section, { props: { tone } });
    expect(container.querySelector(".st-section")?.classList.contains(`st-section--${tone}`)).toBe(true);
  });

  it("renders a centered h2 title and a lead", () => {
    const { container } = render(Section, { props: { title: "Services", lead: "Ce que nous faisons" } });
    const header = container.querySelector(".st-section__header") as HTMLElement;
    expect(header.classList.contains("st-section__header--center")).toBe(true);
    expect(header.querySelector("h2.st-section__title")?.textContent).toBe("Services");
    expect(header.querySelector("p.st-section__lead")?.textContent).toBe("Ce que nous faisons");
  });

  it("supports start alignment, h3 headings, spacing and width overrides", () => {
    const { container } = render(Section, {
      props: { title: "Détails", headingLevel: 3, align: "start", spacing: "md", width: "lg" }
    });
    const root = container.querySelector(".st-section") as HTMLElement;
    expect(root.classList.contains("st-section--spacing-md")).toBe(true);
    expect(root.querySelector(".st-container--lg")).toBeTruthy();
    expect(root.querySelector(".st-section__header--start h3.st-section__title")).toBeTruthy();
  });

  it("passes the id through so it can be an anchor target", () => {
    const { container } = render(Section, { props: { id: "services", as: "div" } });
    const root = container.querySelector("#services") as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root.classList.contains("st-section")).toBe(true);
  });

  it("is token-driven and keeps every header modifier selector (no unused-CSS pruning)", () => {
    for (const token of [
      "--st-component-section-paddingBlock, 6rem",
      "--st-component-section-subtleBackground",
      "--st-component-section-inverseBackground",
      "--st-semantic-gradient-subtle",
      "--st-component-section-measure, 48rem",
      "--st-component-section-scrollMargin, 5rem"
    ]) {
      expect(source).toContain(token);
    }
    const result = compile(source, { css: "external", filename: "Section.svelte" });
    expect(result.warnings.filter((w) => w.code === "css_unused_selector")).toEqual([]);
    expect(result.css?.code).toContain(".st-section__header--start");
  });
});
