import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import {
  Autosave,
  Calendar,
  Rating,
  SlideIndicator,
  TimePicker,
} from "./index.js";

// Invariants mirrored from the Svelte/React sources for the specialized
// components ported to Vue.

describe("Rating", () => {
  it("renders a radiogroup with `max` radio stars (integer mode)", () => {
    const wrapper = mount(Rating, { props: { max: 5, value: 0 } });
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(5);
  });

  it("marks filled stars and aria-checks the current value", () => {
    const wrapper = mount(Rating, { props: { value: 3, max: 5 } });
    expect(wrapper.findAll(".st-rating__star--full")).toHaveLength(3);
    const radios = wrapper.findAll('[role="radio"]');
    expect(radios[2].attributes("aria-checked")).toBe("true");
  });

  it("emits the clicked value via onChange prop and change event", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Rating, { props: { value: 0, max: 5, onChange } });
    await wrapper.findAll('[role="radio"]')[3].trigger("click");
    expect(onChange).toHaveBeenCalledWith(4);
    expect(wrapper.emitted("change")?.[0]).toEqual([4]);
  });

  it("re-clicking the current value resets to 0", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Rating, { props: { value: 4, max: 5, onChange } });
    await wrapper.findAll('[role="radio"]')[3].trigger("click");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  // allowHalf : mode slider ARIA (pas radiogroup).
  it("allowHalf uses role=slider instead of radiogroup", () => {
    const wrapper = mount(Rating, { props: { value: 2, max: 5, allowHalf: true } });
    expect(wrapper.find('[role="slider"]').exists()).toBe(true);
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(false);
  });

  it("allowHalf slider exposes aria-valuenow and aria-valuetext", () => {
    const wrapper = mount(Rating, { props: { value: 2.5, max: 5, allowHalf: true } });
    const slider = wrapper.find('[role="slider"]');
    expect(slider.attributes("aria-valuenow")).toBe("2.5");
    expect(slider.attributes("aria-valuetext")).toBe("2.5 / 5");
  });

  it("supports half-step keyboard increments when allowHalf (slider keydown)", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Rating, {
      props: { value: 2, max: 5, allowHalf: true, onChange },
    });
    // Le slider entend onKeydown directement sur le conteneur role=slider.
    await wrapper.find('[role="slider"]').trigger("keydown", { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  // readonly : role=img sur le conteneur, pas de boutons interactifs.
  it("readonly uses role=img and exposes aria-label with value text", () => {
    const wrapper = mount(Rating, { props: { value: 2, max: 5, readonly: true, label: "Note" } });
    const img = wrapper.find('[role="img"]');
    expect(img.exists()).toBe(true);
    expect(img.attributes("aria-label")).toBe("Note : 2 / 5");
    // Pas d'éléments interactifs disabled.
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(0);
    expect(wrapper.findAll('button[disabled]')).toHaveLength(0);
  });

  it("readonly does not emit when interacted with (no interactive children)", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Rating, { props: { value: 2, readonly: true, onChange } });
    // Pas de boutons disabled : on clique le conteneur lui-même.
    await wrapper.find('[role="img"]').trigger("click");
    expect(onChange).not.toHaveBeenCalled();
  });

  // Home→1 en mode entier (pas 0).
  it("Home key in integer mode goes to star 1 (not 0)", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Rating, { props: { value: 3, max: 5, onChange } });
    await wrapper.find('[role="radiogroup"]').trigger("keydown", { key: "Home" });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("works uncontrolled (internal state) when value omitted", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Rating, { props: { max: 5, onChange } });
    await wrapper.findAll('[role="radio"]')[2].trigger("click");
    expect(onChange).toHaveBeenCalledWith(3);
    expect(wrapper.findAll(".st-rating__star--full")).toHaveLength(3);
  });

  // Roving tabindex : la bonne étoile reçoit tabindex=0.
  it("roving tabindex: focused star gets tabindex 0, others -1", () => {
    const wrapper = mount(Rating, { props: { value: 3, max: 5 } });
    const radios = wrapper.findAll('[role="radio"]');
    // Star 3 est la focusedStar (Math.ceil(3) === 3).
    expect(radios[2].attributes("tabindex")).toBe("0");
    expect(radios[0].attributes("tabindex")).toBe("-1");
    expect(radios[4].attributes("tabindex")).toBe("-1");
  });
});

describe("TimePicker", () => {
  it("renders a combobox closed by default", () => {
    const wrapper = mount(TimePicker, { props: { value: "" } });
    expect(wrapper.find('[role="combobox"]').exists()).toBe(true);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("opens a listbox of slots generated by step", async () => {
    const wrapper = mount(TimePicker, {
      props: { value: "", step: 60, min: "09:00", max: "11:00" },
    });
    await wrapper.find('[role="combobox"]').trigger("click");
    const options = wrapper.findAll('[role="option"]');
    expect(options.map((o) => o.text())).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("emits HH:mm 24h value even when format is 12 (display only)", async () => {
    const onChange = vi.fn();
    const wrapper = mount(TimePicker, {
      props: { value: "", step: 60, min: "13:00", max: "14:00", format: "12", onChange },
    });
    await wrapper.find('[role="combobox"]').trigger("click");
    const options = wrapper.findAll('[role="option"]');
    expect(options[0].text()).toBe("01:00 PM");
    await options[0].trigger("click");
    expect(onChange).toHaveBeenCalledWith("13:00");
    expect(wrapper.emitted("change")?.[0]).toEqual(["13:00"]);
  });

  it("does not open when disabled", async () => {
    const wrapper = mount(TimePicker, { props: { value: "", disabled: true } });
    await wrapper.find('[role="combobox"]').trigger("click");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  // A11Y : aria-activedescendant sur l'input.
  it("sets aria-activedescendant on the combobox input when list is open", async () => {
    const wrapper = mount(TimePicker, {
      props: { value: "", step: 60, min: "09:00", max: "10:00" },
    });
    await wrapper.find('[role="combobox"]').trigger("click");
    const combobox = wrapper.find('[role="combobox"]');
    expect(combobox.attributes("aria-activedescendant")).toBeTruthy();
  });

  // Navigation clavier : ArrowDown ouvre et active la première option.
  it("ArrowDown on combobox opens list and activates first option", async () => {
    const wrapper = mount(TimePicker, {
      props: { value: "", step: 60, min: "09:00", max: "11:00" },
    });
    const combobox = wrapper.find('[role="combobox"]');
    await combobox.trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(combobox.attributes("aria-activedescendant")).toBeTruthy();
  });

  // Enter sélectionne l'option active.
  it("Enter on open combobox selects the active option", async () => {
    const onChange = vi.fn();
    const wrapper = mount(TimePicker, {
      props: { value: "", step: 60, min: "09:00", max: "11:00", onChange },
    });
    const combobox = wrapper.find('[role="combobox"]');
    await combobox.trigger("keydown", { key: "ArrowDown" });
    await combobox.trigger("keydown", { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("09:00");
  });

  // Escape ferme la liste.
  it("Escape closes the listbox", async () => {
    const wrapper = mount(TimePicker, {
      props: { value: "", step: 60, min: "09:00", max: "10:00" },
    });
    await wrapper.find('[role="combobox"]').trigger("click");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    await wrapper.find('[role="combobox"]').trigger("keydown", { key: "Escape" });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  // tabindex=-1 sur le bouton trigger (non tabbable).
  it("clock trigger button has tabindex=-1", () => {
    const wrapper = mount(TimePicker, { props: { value: "" } });
    expect(wrapper.find(".st-timepicker__trigger").attributes("tabindex")).toBe("-1");
  });
});

describe("Calendar", () => {
  it("renders an inline grid of 42 day cells in 6 rows", () => {
    const wrapper = mount(Calendar, { props: { value: "2024-03-15", month: "2024-03" } });
    expect(wrapper.find('[role="grid"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(42);
    // 6 semaines + 1 rangée d'en-têtes = 7 rows au total.
    expect(wrapper.findAll('[role="row"]').length).toBeGreaterThanOrEqual(7);
  });

  it("emits a YYYY-MM-DD string on day click (local time)", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar, {
      props: { value: "2024-03-01", month: "2024-03", onChange },
    });
    const cells = wrapper.findAll('[role="gridcell"]');
    const target = cells.find((c) => c.text() === "15" && !c.classes("st-calendar__day--outside"));
    await target!.trigger("click");
    expect(onChange).toHaveBeenCalledWith("2024-03-15");
  });

  it("disables out-of-bounds dates via min/max", () => {
    const wrapper = mount(Calendar, {
      props: { value: "2024-03-15", month: "2024-03", min: "2024-03-10", max: "2024-03-20" },
    });
    const cells = wrapper.findAll('[role="gridcell"]');
    const before = cells.find(
      (c) => c.text() === "5" && !c.classes("st-calendar__day--outside"),
    );
    expect((before!.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("builds a [start, end] tuple in range mode", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Calendar, {
      props: { value: ["2024-03-05", null], month: "2024-03", range: true, onChange },
    });
    const cells = wrapper.findAll('[role="gridcell"]');
    const end = cells.find((c) => c.text() === "12" && !c.classes("st-calendar__day--outside"));
    await end!.trigger("click");
    expect(onChange).toHaveBeenCalledWith(["2024-03-05", "2024-03-12"]);
  });

  it("navigates months with the next button", async () => {
    const wrapper = mount(Calendar, { props: { value: "2024-03-15", month: "2024-03" } });
    await wrapper.find('[aria-label="Mois suivant"]').trigger("click");
    expect(wrapper.find(".st-calendar__monthLabel").text().toLowerCase()).toContain("avril");
  });

  // Roving tabindex : exactement 1 cellule avec tabindex=0 par mois.
  it("exactly one enabled cell has tabindex=0 (roving tabindex)", () => {
    const wrapper = mount(Calendar, { props: { value: "2024-03-15", month: "2024-03" } });
    const tabbable = wrapper.findAll('[role="gridcell"][tabindex="0"]');
    expect(tabbable).toHaveLength(1);
  });

  // La cellule avec tabindex=0 correspond à la date sélectionnée.
  it("the tabbable cell matches the selected date when in current month", () => {
    const wrapper = mount(Calendar, { props: { value: "2024-03-15", month: "2024-03" } });
    const tabbable = wrapper.find('[role="gridcell"][tabindex="0"]');
    expect(tabbable.attributes("data-date")).toBe("2024-03-15");
  });

  // Les cellules disabled ne doivent jamais avoir tabindex=0.
  it("disabled cells never get tabindex=0", () => {
    const wrapper = mount(Calendar, {
      props: { value: "2024-03-15", month: "2024-03", min: "2024-03-14", max: "2024-03-16" },
    });
    const disabledWithTabstop = wrapper.findAll('[aria-disabled="true"][tabindex="0"]');
    expect(disabledWithTabstop).toHaveLength(0);
  });

  // PageUp/Down naviguent entre mois.
  it("PageDown navigates to next month", async () => {
    const wrapper = mount(Calendar, { props: { value: "2024-03-15", month: "2024-03" } });
    await wrapper.find('[role="grid"]').trigger("keydown", { key: "PageDown" });
    expect(wrapper.find(".st-calendar__monthLabel").text().toLowerCase()).toContain("avril");
  });

  it("PageUp navigates to previous month", async () => {
    const wrapper = mount(Calendar, { props: { value: "2024-03-15", month: "2024-03" } });
    await wrapper.find('[role="grid"]').trigger("keydown", { key: "PageUp" });
    expect(wrapper.find(".st-calendar__monthLabel").text().toLowerCase()).toContain("février");
  });
});

describe("SlideIndicator", () => {
  // A11y correct: role="group" + boutons avec aria-current (pas tablist/tab).
  it("renders a group with `count` buttons (not tablist)", () => {
    const wrapper = mount(SlideIndicator, { props: { count: 4 } });
    expect(wrapper.find('[role="group"]').exists()).toBe(true);
    expect(wrapper.findAll("button")).toHaveLength(4);
    // role="tablist" est invalide sans tabpanel associé.
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false);
  });

  it("applies roving tabindex: current button has tabindex=0, others -1", () => {
    const wrapper = mount(SlideIndicator, { props: { count: 4, current: 2 } });
    const buttons = wrapper.findAll("button");
    expect(buttons[2].attributes("tabindex")).toBe("0");
    expect(buttons[0].attributes("tabindex")).toBe("-1");
    // aria-current="true" sur le bouton courant.
    expect(buttons[2].attributes("aria-current")).toBe("true");
    expect(buttons[0].attributes("aria-current")).toBeUndefined();
  });

  it("emits the target index on click", async () => {
    const onChange = vi.fn();
    const wrapper = mount(SlideIndicator, { props: { count: 4, current: 1, onChange } });
    await wrapper.findAll("button")[3].trigger("click");
    expect(onChange).toHaveBeenCalledWith(3);
    expect(wrapper.emitted("change")).toBeTruthy();
  });

  it("ArrowRight emits the next index", async () => {
    const onChange = vi.fn();
    const wrapper = mount(SlideIndicator, { props: { count: 4, current: 1, onChange } });
    await wrapper.findAll("button")[1].trigger("keydown", { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("Home emits index 0", async () => {
    const onChange = vi.fn();
    const wrapper = mount(SlideIndicator, { props: { count: 4, current: 3, onChange } });
    await wrapper.findAll("button")[3].trigger("keydown", { key: "Home" });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("End emits last index", async () => {
    const onChange = vi.fn();
    const wrapper = mount(SlideIndicator, { props: { count: 4, current: 0, onChange } });
    await wrapper.findAll("button")[0].trigger("keydown", { key: "End" });
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("accessible label is applied to the group and each button", () => {
    const wrapper = mount(SlideIndicator, {
      props: { count: 3, label: "Diapositive" },
    });
    expect(wrapper.find('[role="group"]').attributes("aria-label")).toBe("Diapositive");
    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("aria-label")).toBe("Diapositive 1");
    expect(buttons[2].attributes("aria-label")).toBe("Diapositive 3");
  });
});

describe("Autosave", () => {
  it("uses role=status outside of error", () => {
    const wrapper = mount(Autosave, { props: { status: "saved" } });
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
  });

  it("uses role=alert on error and shows a retry button when onRetry given", async () => {
    const onRetry = vi.fn();
    const wrapper = mount(Autosave, { props: { status: "error", onRetry } });
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    const btn = wrapper.find(".st-autosave__retry");
    expect(btn.exists()).toBe(true);
    await btn.trigger("click");
    expect(onRetry).toHaveBeenCalled();
    expect(wrapper.emitted("retry")).toBeTruthy();
  });

  it("renders overridable labels", () => {
    const wrapper = mount(Autosave, {
      props: { status: "saving", labels: { saving: "Custom saving" } },
    });
    expect(wrapper.find(".st-autosave__label").text()).toBe("Custom saving");
  });

  it("renders a relative time on saved", () => {
    const wrapper = mount(Autosave, {
      props: { status: "saved", lastSaved: new Date(Date.now() - 60_000) },
    });
    expect(wrapper.find(".st-autosave__time").exists()).toBe(true);
  });
});
