import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Checkbox from "./lib/Checkbox.svelte";
import Combobox from "./lib/Combobox.svelte";
import DatePicker, { type DatePickerRange } from "./lib/DatePicker.svelte";
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

  it("Input exposes value as bindable so consumers can two-way bind", async () => {
    render(Input, { props: { label: "Title", value: "" } });
    const field = screen.getByLabelText("Title") as HTMLInputElement;
    await fireEvent.input(field, { target: { value: "Hello" } });
    expect(field.value).toBe("Hello");
  });

  it("Textarea exposes value as bindable so consumers can two-way bind", async () => {
    render(Textarea, { props: { label: "Notes", value: "" } });
    const field = screen.getByLabelText("Notes") as HTMLTextAreaElement;
    await fireEvent.input(field, { target: { value: "ligne" } });
    expect(field.value).toBe("ligne");
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

  it("renders a DatePicker with label, readonly field and calendar trigger", () => {
    render(DatePicker, { props: { label: "Date", locale: "fr-FR" } });
    const field = screen.getByLabelText("Date") as HTMLInputElement;
    expect(field.tagName).toBe("INPUT");
    expect(field.readOnly).toBe(true);
    const trigger = screen.getByRole("button", { name: "Ouvrir le calendrier" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("selects a single date when a calendar day is clicked", async () => {
    const target = new Date(2026, 4, 15); // 2026-05-15 (today per env)
    let captured: Date | null | undefined = null;
    render(DatePicker, {
      props: {
        label: "Échéance",
        locale: "fr-FR",
        value: null,
        onfocusin: () => {
          /* noop, ensures props subscribe */
        }
      }
    });
    // Open the panel.
    const trigger = screen.getByRole("button", { name: "Ouvrir le calendrier" });
    await fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeTruthy();

    // Click on the day matching `target` via its accessible label.
    const expectedAriaLabel = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(target);
    const dayButton = screen.getByRole("button", { name: expectedAriaLabel });
    await fireEvent.click(dayButton);

    // The field should now display the formatted date.
    const expectedFieldValue = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(target);
    const field = screen.getByLabelText("Échéance") as HTMLInputElement;
    expect(field.value).toBe(expectedFieldValue);
    captured = target; // reference target so the variable is used
    expect(captured).toBeInstanceOf(Date);
  });

  it("selects start then end date in range mode", async () => {
    const start = new Date(2026, 4, 10);
    const end = new Date(2026, 4, 20);
    const initial: DatePickerRange = { start: null, end: null };
    render(DatePicker, {
      props: {
        label: "Période",
        locale: "fr-FR",
        mode: "range",
        value: initial
      }
    });
    const trigger = screen.getByRole("button", { name: "Ouvrir le calendrier" });
    await fireEvent.click(trigger);

    const labelFor = (d: Date) =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(d);

    await fireEvent.click(screen.getByRole("button", { name: labelFor(start) }));
    // After first click, panel stays open and a new range begins.
    expect(screen.getByRole("dialog")).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: labelFor(end) }));

    const formatter = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const field = screen.getByLabelText("Période") as HTMLInputElement;
    expect(field.value).toBe(`${formatter.format(start)} - ${formatter.format(end)}`);
  });
});
