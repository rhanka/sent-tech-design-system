import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { SelectableRow } from "./index.js";

const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}

afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

describe("SelectableRow", () => {
  it("renders with role=option and the row class", () => {
    const wrapper = track(
      mount(SelectableRow, { slots: { default: () => "Documents" } }),
    );
    const row = wrapper.find('[role="option"]');
    expect(row.exists()).toBe(true);
    expect(row.classes()).toContain("st-selectableRow");
    expect(wrapper.text()).toContain("Documents");
  });

  it("selected applies aria-selected=true and the selected class", () => {
    const wrapper = track(
      mount(SelectableRow, {
        props: { selected: true },
        slots: { default: () => "Documents" },
      }),
    );
    const row = wrapper.find('[role="option"]');
    expect(row.attributes("aria-selected")).toBe("true");
    expect(row.classes()).toContain("st-selectableRow--selected");
  });

  it("is not selected by default (aria-selected=false, no selected class)", () => {
    const wrapper = track(
      mount(SelectableRow, { slots: { default: () => "Documents" } }),
    );
    const row = wrapper.find('[role="option"]');
    expect(row.attributes("aria-selected")).toBe("false");
    expect(row.classes()).not.toContain("st-selectableRow--selected");
  });

  it("click calls onSelect and emits select with the toggled state", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(SelectableRow, {
        props: { onSelect },
        slots: { default: () => "Documents" },
      }),
    );
    await wrapper.find('[role="option"]').trigger("click");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
    expect(wrapper.emitted("select")?.[0]).toEqual([true]);
  });

  it("click on a selected row calls onSelect(false)", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(SelectableRow, {
        props: { selected: true, onSelect },
        slots: { default: () => "Documents" },
      }),
    );
    await wrapper.find('[role="option"]').trigger("click");
    expect(onSelect).toHaveBeenLastCalledWith(false);
  });

  it("reflects controlled selected updates", async () => {
    const wrapper = track(
      mount(SelectableRow, {
        props: { selected: false },
        slots: { default: () => "Documents" },
      }),
    );
    const row = wrapper.find('[role="option"]');
    expect(row.attributes("aria-selected")).toBe("false");
    await wrapper.setProps({ selected: true });
    expect(row.attributes("aria-selected")).toBe("true");
    expect(row.classes()).toContain("st-selectableRow--selected");
  });

  it("Enter key selects (calls onSelect)", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(SelectableRow, {
        props: { onSelect },
        slots: { default: () => "Documents" },
      }),
    );
    await wrapper.find('[role="option"]').trigger("keydown", { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("Space key selects (calls onSelect)", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(SelectableRow, {
        props: { onSelect },
        slots: { default: () => "Documents" },
      }),
    );
    await wrapper.find('[role="option"]').trigger("keydown", { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("disabled does not emit select on click or key, and exposes aria-disabled", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(SelectableRow, {
        props: { disabled: true, onSelect },
        slots: { default: () => "Documents" },
      }),
    );
    const row = wrapper.find('[role="option"]');
    expect(row.attributes("aria-disabled")).toBe("true");
    expect(row.attributes("tabindex")).toBe("-1");
    await row.trigger("click");
    await row.trigger("keydown", { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
    expect(wrapper.emitted("select")).toBeFalsy();
  });

  it("is focusable (tabindex 0) when not disabled", () => {
    const wrapper = track(
      mount(SelectableRow, { slots: { default: () => "Documents" } }),
    );
    expect(wrapper.find('[role="option"]').attributes("tabindex")).toBe("0");
  });

  it("exposes value as data-value", () => {
    const wrapper = track(
      mount(SelectableRow, {
        props: { value: "docs" },
        slots: { default: () => "Documents" },
      }),
    );
    expect(wrapper.find('[role="option"]').attributes("data-value")).toBe("docs");
  });

  it("renders leading and trailing slots", () => {
    const wrapper = track(
      mount(SelectableRow, {
        slots: {
          default: () => "Documents",
          leading: () => h("span", { "data-testid": "lead" }, "L"),
          trailing: () => h("span", { "data-testid": "trail" }, "T"),
        },
      }),
    );
    expect(wrapper.find(".st-selectableRow__leading").exists()).toBe(true);
    expect(wrapper.find(".st-selectableRow__trailing").exists()).toBe(true);
    expect(wrapper.find('[data-testid="lead"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="trail"]').exists()).toBe(true);
  });

  it("has name SelectableRow", () => {
    expect(SelectableRow.name).toBe("SelectableRow");
  });
});
