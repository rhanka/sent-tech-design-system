import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Checkbox from "./lib/Checkbox.svelte";
import Combobox from "./lib/Combobox.svelte";
import Input from "./lib/Input.svelte";
import MultiSelect from "./lib/MultiSelect.svelte";
import NumberInput from "./lib/NumberInput.svelte";
import PasswordInput from "./lib/PasswordInput.svelte";
import Radio from "./lib/Radio.svelte";
import Search from "./lib/Search.svelte";
import Select from "./lib/Select.svelte";
import Slider from "./lib/Slider.svelte";
import Switch from "./lib/Switch.svelte";
import Textarea from "./lib/Textarea.svelte";
import Toggle from "./lib/Toggle.svelte";

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

  it("renders a NumberInput with increment and decrement buttons", () => {
    render(NumberInput, { props: { label: "Quantity", value: 3, min: 0, max: 10 } });
    const field = screen.getByLabelText("Quantity") as HTMLInputElement;
    expect(field.type).toBe("number");
    expect(field.value).toBe("3");
    expect(screen.getByRole("button", { name: "Increment value" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Decrement value" })).toBeTruthy();
  });

  it("disables NumberInput buttons at min/max boundaries", () => {
    render(NumberInput, { props: { label: "Floor", value: 0, min: 0, max: 5 } });
    expect(
      (screen.getByRole("button", { name: "Decrement value" }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Increment value" }) as HTMLButtonElement).disabled
    ).toBe(false);
  });

  it("renders a Search input with searchbox role", () => {
    render(Search, { props: { label: "Recherche", placeholder: "Filter" } });
    const box = screen.getByRole("searchbox", { name: "Recherche" }) as HTMLInputElement;
    expect(box.type).toBe("search");
    expect(box.placeholder).toBe("Filter");
  });

  it("renders a PasswordInput hidden by default with toggle button", () => {
    render(PasswordInput, { props: { label: "Mot de passe" } });
    const field = screen.getByLabelText("Mot de passe") as HTMLInputElement;
    expect(field.type).toBe("password");
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  it("renders a Combobox with combobox role and option list when expanded", async () => {
    render(Combobox, {
      props: {
        label: "Pays",
        options: [
          { label: "France", value: "fr" },
          { label: "Belgique", value: "be" },
          { label: "Suisse", value: "ch" }
        ]
      }
    });
    const field = screen.getByLabelText("Pays") as HTMLInputElement;
    expect(field.getAttribute("role")).toBe("combobox");
    expect(field.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.focus(field);
    expect(field.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("option", { name: "France" })).toBeTruthy();
  });

  it("filters Combobox options as the user types", async () => {
    render(Combobox, {
      props: {
        label: "Cible",
        options: [
          { label: "Forge", value: "forge" },
          { label: "Entropic", value: "entropic" }
        ]
      }
    });
    const field = screen.getByLabelText("Cible") as HTMLInputElement;
    await fireEvent.focus(field);
    await fireEvent.input(field, { target: { value: "ent" } });
    expect(screen.queryByRole("option", { name: "Forge" })).toBeNull();
    expect(screen.getByRole("option", { name: "Entropic" })).toBeTruthy();
  });

  it("renders a MultiSelect trigger and toggles option selection", async () => {
    let captured: string[] = [];
    render(MultiSelect, {
      props: {
        label: "Tags",
        options: [
          { label: "Alpha", value: "a" },
          { label: "Beta", value: "b" }
        ],
        onchange: (next: string[]) => {
          captured = next;
        }
      }
    });
    const trigger = screen.getByRole("button", { expanded: false });
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    await fireEvent.click(trigger);
    await fireEvent.click(screen.getByRole("option", { name: /Alpha/ }));
    expect(captured).toEqual(["a"]);
    await fireEvent.click(screen.getByRole("option", { name: /Beta/ }));
    expect(captured).toEqual(["a", "b"]);
  });

  it("renders a Slider with range input bound to value", async () => {
    let latest = 0;
    render(Slider, {
      props: {
        label: "Volume",
        value: 25,
        min: 0,
        max: 100,
        step: 5,
        onchange: (next: number) => {
          latest = next;
        }
      }
    });
    const range = screen.getByLabelText("Volume") as HTMLInputElement;
    expect(range.type).toBe("range");
    expect(range.value).toBe("25");
    await fireEvent.input(range, { target: { value: "60" } });
    expect(latest).toBe(60);
  });

  it("renders a Toggle with on/off side label reflecting state", () => {
    render(Toggle, { props: { label: "Notifications", checked: true } });
    expect(screen.getByRole("switch", { name: "Notifications" }).getAttribute("aria-checked")).toBe(
      "true"
    );
    expect(screen.getByText("On")).toBeTruthy();
  });

  it("renders a Toggle with custom labelOn/labelOff", () => {
    render(Toggle, {
      props: { label: "Mode", labelOn: "Sombre", labelOff: "Clair", checked: false }
    });
    expect(screen.getByText("Clair")).toBeTruthy();
  });
});
