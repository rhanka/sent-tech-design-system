import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge, Button, Card, Input, ThemeProvider } from "./index.js";
import { sentTechTheme } from "@sentropic/design-system-themes";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

describe("React design system MVP", () => {
  it("renders Button with the shared DS class contract", () => {
    render(
      <Button variant="secondary" size="sm" className="extra" disabled>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("type")).toBe("button");
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.className).toContain("st-button");
    expect(button.className).toContain("st-button--secondary");
    expect(button.className).toContain("st-button--sm");
    expect(button.className).toContain("extra");
  });

  it("renders Input label, helper and invalid state with Svelte-compatible classes", () => {
    render(
      <Input
        label="Email"
        helperText="Adresse professionnelle"
        errorText="Email requis"
        invalid
        size="lg"
        name="email"
      />,
    );

    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("name")).toBe("email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("st-control");
    expect(input.className).toContain("st-control--lg");
    expect(screen.getByText("Email requis").className).toBe("st-field__error");
    expect(screen.queryByText("Adresse professionnelle")).toBeNull();
  });

  it("renders Card and Badge with stable class names", () => {
    render(
      <Card interactive className="panel">
        <Badge tone="info">Beta</Badge>
      </Card>,
    );

    const card = screen.getByText("Beta").closest("section");
    expect(card?.className).toContain("st-card");
    expect(card?.className).toContain("st-card--interactive");
    expect(card?.className).toContain("panel");

    const badge = screen.getByText("Beta");
    expect(badge.className).toContain("st-badge");
    expect(badge.className).toContain("st-badge--info");
  });

  it("renders ThemeProvider with scoped theme data and CSS injection", () => {
    render(
      <ThemeProvider theme={sentTechTheme}>
        <Button>Inside</Button>
      </ThemeProvider>,
    );

    const wrapper = screen.getByRole("button", { name: "Inside" }).parentElement;
    expect(wrapper?.getAttribute("data-st-theme")).toBe(sentTechTheme.id);
    const style = document.head.querySelector("style[data-st-theme-provider='sent-tech']");
    expect(style?.textContent).toContain('[data-st-theme="sent-tech"]');
    expect(style?.textContent).toContain("--st-semantic-text-primary");
  });
});
