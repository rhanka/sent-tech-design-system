import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Checkbox from "./lib/Checkbox.svelte";
import Input from "./lib/Input.svelte";
import Radio from "./lib/Radio.svelte";
import Select from "./lib/Select.svelte";
import Switch from "./lib/Switch.svelte";
import Textarea from "./lib/Textarea.svelte";

const options = createRawSnippet(() => ({
  render: () => '<option value="forge">Forge</option><option value="entropic">Entropic</option>'
}));

describe("form controls", () => {
  it("renders an accessible text input", () => {
    render(Input, { props: { label: "Project", placeholder: "Sent Tech" } });
    expect(screen.getByLabelText("Project")).toHaveProperty("placeholder", "Sent Tech");
  });

  it("marks invalid inputs with aria-invalid", () => {
    render(Input, { props: { label: "Email", invalid: true, errorText: "Email requis" } });
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Email requis")).toBeTruthy();
  });

  it("renders textarea and select controls with labels", () => {
    render(Textarea, { props: { label: "Description" } });
    render(Select, { props: { label: "Produit", children: options } });
    expect(screen.getByLabelText("Description")).toBeTruthy();
    expect(screen.getByLabelText("Produit")).toBeTruthy();
  });

  it("renders checkbox and radio with native checked state", () => {
    render(Checkbox, { props: { label: "Actif", checked: true } });
    render(Radio, { props: { label: "Principal", name: "choice", checked: true } });
    expect(screen.getByLabelText("Actif")).toHaveProperty("checked", true);
    expect(screen.getByLabelText("Principal")).toHaveProperty("checked", true);
  });

  it("renders a switch using the switch role", () => {
    render(Switch, { props: { label: "Notifications", checked: true } });
    expect(screen.getByRole("switch", { name: "Notifications" }).getAttribute("aria-checked")).toBe(
      "true"
    );
  });
});
