import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Button from "./lib/Button.svelte";

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe("Button", () => {
  it("renders slotted text", () => {
    render(Button, { props: { variant: "primary", children: text("Save") } });
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("forwards disabled state", () => {
    render(Button, { props: { disabled: true, children: text("Save") } });
    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty("disabled", true);
  });
});
