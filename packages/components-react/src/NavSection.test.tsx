import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NavSection } from "./NavSection.js";

afterEach(cleanup);

const body = (text = "contenu de section") => <div className="x-body">{text}</div>;

describe("NavSection", () => {
  it("renders the label via Overline (small-caps section heading)", () => {
    const { container } = render(<NavSection label="DOCUMENTATION">{body()}</NavSection>);
    const overline = container.querySelector(".st-overline");
    expect(overline).toBeTruthy();
    expect(overline?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the slotted children content", () => {
    const { container } = render(
      <NavSection label="SIGNAUX">{body("liste de signaux")}</NavSection>,
    );
    expect(container.querySelector(".x-body")?.textContent).toContain("liste de signaux");
  });

  it("renders a circle count badge when count is provided", () => {
    const { container } = render(
      <NavSection label="COMMUNITIES" count={12}>
        {body()}
      </NavSection>,
    );
    const badge = container.querySelector(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains("st-badge--circle")).toBe(true);
    expect(badge?.textContent).toContain("12");
  });

  it("omits the count badge when count is undefined", () => {
    const { container } = render(<NavSection label="Pastilles">{body()}</NavSection>);
    expect(container.querySelector(".st-badge")).toBeNull();
  });

  it("renders a count of 0 (falsy but present)", () => {
    const { container } = render(
      <NavSection label="Zonage" count={0}>
        {body()}
      </NavSection>,
    );
    const badge = container.querySelector(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain("0");
  });

  it("non-collapsible: renders a group titled by the Overline", () => {
    render(<NavSection label="Zonage / Potentiel">{body()}</NavSection>);
    // The Overline carries the heading id referenced by aria-labelledby.
    const group = screen.getByRole("group", { name: "Zonage / Potentiel" });
    expect(group).toBeTruthy();
  });

  it("non-collapsible: renders the Overline as the requested heading tag", () => {
    const { container } = render(
      <NavSection label="DOCUMENTATION" as="h2">
        {body()}
      </NavSection>,
    );
    const heading = container.querySelector("h2.st-overline");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the action snippet in the section header (foyer of the local action)", () => {
    const { container } = render(
      <NavSection
        label="Pastilles"
        action={
          <button type="button" className="x-action">
            Ajouter une pastille
          </button>
        }
      >
        {body()}
      </NavSection>,
    );
    const action = container.querySelector(".st-navSection__action .x-action");
    expect(action).toBeTruthy();
    expect(action?.textContent).toContain("Ajouter une pastille");
  });

  it("collapsible: renders a trigger with aria-expanded that toggles the content", () => {
    const { container } = render(
      <NavSection label="SIGNAUX" collapsible open>
        {body("signaux ouverts")}
      </NavSection>,
    );

    const trigger = screen.getByRole("button");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".x-body")).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".x-body")).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".x-body")).toBeTruthy();
  });

  it("collapsible: starts closed when open is false", () => {
    const { container } = render(
      <NavSection label="SIGNAUX" collapsible open={false}>
        {body()}
      </NavSection>,
    );
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".x-body")).toBeNull();
  });

  it("collapsible: surfaces the count in the trigger", () => {
    const { container } = render(
      <NavSection label="SIGNAUX" count={7} collapsible open>
        {body()}
      </NavSection>,
    );
    const badge = container.querySelector(".st-badge--circle");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain("7");
  });

  it("merges a consumer class onto the root", () => {
    const { container } = render(
      <NavSection label="DOCUMENTATION" className="x-extra">
        {body()}
      </NavSection>,
    );
    const rootEl = container.querySelector(".st-navSection");
    expect(rootEl).toBeTruthy();
    expect(rootEl?.classList.contains("x-extra")).toBe(true);
  });
});
