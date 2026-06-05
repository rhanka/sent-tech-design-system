import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { SelectableList, SelectableRow } from "./index.js";

const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}

afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

function rows() {
  return [
    h(SelectableRow, { value: "a" }, { default: () => "Alpha" }),
    h(SelectableRow, { value: "b" }, { default: () => "Beta" }),
    h(SelectableRow, { value: "c" }, { default: () => "Gamma" }),
  ];
}

function mountList(
  props: Record<string, unknown> = {},
  children = rows,
): VueWrapper {
  return track(
    mount(SelectableList, {
      attachTo: document.body,
      props: { label: "Items", ...props },
      slots: { default: children },
    }),
  );
}

describe("SelectableList", () => {
  it("renders a listbox with its option rows", () => {
    const wrapper = mountList();
    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.exists()).toBe(true);
    expect(listbox.attributes("aria-label")).toBe("Items");
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
  });

  it("aria-multiselectable reflects the multiple prop", async () => {
    const wrapper = mountList();
    expect(
      wrapper.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBeUndefined();
    await wrapper.setProps({ multiple: true });
    expect(
      wrapper.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBe("true");
  });

  it("roving tabindex: first row tabbable, rest -1", async () => {
    const wrapper = mountList();
    // Registration happens on mount; let the resulting re-render flush.
    await nextTick();
    const opts = wrapper.findAll('[role="option"]');
    expect(opts[0].attributes("tabindex")).toBe("0");
    expect(opts[1].attributes("tabindex")).toBe("-1");
    expect(opts[2].attributes("tabindex")).toBe("-1");
  });

  it("ArrowDown moves the roving tab stop and focus", async () => {
    const wrapper = mountList();
    const opts = wrapper.findAll('[role="option"]');
    (opts[0].element as HTMLElement).focus();
    await opts[0].trigger("keydown", { key: "ArrowDown" });
    expect(opts[1].attributes("tabindex")).toBe("0");
    expect(opts[0].attributes("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(opts[1].element);
  });

  it("Home / End jump to the first / last row (no wrap)", async () => {
    const wrapper = mountList();
    const opts = wrapper.findAll('[role="option"]');
    (opts[0].element as HTMLElement).focus();
    await opts[0].trigger("keydown", { key: "End" });
    expect(opts[2].attributes("tabindex")).toBe("0");
    expect(document.activeElement).toBe(opts[2].element);
    await opts[2].trigger("keydown", { key: "Home" });
    expect(opts[0].attributes("tabindex")).toBe("0");
    expect(document.activeElement).toBe(opts[0].element);
  });

  it("ArrowUp at the top stays put (clamped, no wrap)", async () => {
    const wrapper = mountList();
    const opts = wrapper.findAll('[role="option"]');
    (opts[0].element as HTMLElement).focus();
    await opts[0].trigger("keydown", { key: "ArrowUp" });
    expect(opts[0].attributes("tabindex")).toBe("0");
    expect(document.activeElement).toBe(opts[0].element);
  });

  it("Space toggles selection (single-select) and fires change", async () => {
    const onChange = vi.fn();
    const wrapper = mountList({ onChange });
    const opts = wrapper.findAll('[role="option"]');
    await opts[1].trigger("keydown", { key: " " });
    expect(onChange).toHaveBeenLastCalledWith("b");
    expect(opts[1].attributes("aria-selected")).toBe("true");
    // Single-select: selecting another deselects the first.
    await opts[2].trigger("keydown", { key: " " });
    expect(onChange).toHaveBeenLastCalledWith("c");
    expect(opts[1].attributes("aria-selected")).toBe("false");
    expect(opts[2].attributes("aria-selected")).toBe("true");
  });

  it("Enter activates the row too", async () => {
    const onChange = vi.fn();
    const wrapper = mountList({ onChange });
    await wrapper.findAll('[role="option"]')[0].trigger("keydown", {
      key: "Enter",
    });
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("single-select toggles off when re-activating the selected row", async () => {
    const onChange = vi.fn();
    const wrapper = mountList({ onChange });
    const opt = wrapper.findAll('[role="option"]')[0];
    await opt.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith("a");
    await opt.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("multiple allows several selected and emits an array", async () => {
    const onChange = vi.fn();
    const wrapper = mountList({ multiple: true, onChange });
    const opts = wrapper.findAll('[role="option"]');
    await opts[0].trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    await opts[2].trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(opts[0].attributes("aria-selected")).toBe("true");
    expect(opts[2].attributes("aria-selected")).toBe("true");
    await opts[0].trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(["c"]);
  });

  it("controlled value drives the selected row", async () => {
    const Controlled = defineComponent({
      setup() {
        const value = ref<string | null>("b");
        return () =>
          h(
            SelectableList,
            {
              label: "Items",
              value: value.value,
              onChange: (v: string | string[] | null) => {
                value.value = v as string | null;
              },
            },
            { default: rows },
          );
      },
    });
    const wrapper = track(mount(Controlled, { attachTo: document.body }));
    // Registration happens on mount; let the resulting re-render flush.
    await nextTick();
    const opts = wrapper.findAll('[role="option"]');
    expect(opts[1].attributes("aria-selected")).toBe("true");
    await opts[0].trigger("click");
    expect(opts[0].attributes("aria-selected")).toBe("true");
    expect(opts[1].attributes("aria-selected")).toBe("false");
  });

  it("a disabled row is skipped from the registry (not a tab stop)", async () => {
    const wrapper = track(
      mount(SelectableList, {
        attachTo: document.body,
        props: { label: "Items" },
        slots: {
          default: () => [
            h(SelectableRow, { value: "a", disabled: true }, { default: () => "Alpha" }),
            h(SelectableRow, { value: "b" }, { default: () => "Beta" }),
          ],
        },
      }),
    );
    await nextTick();
    const opts = wrapper.findAll('[role="option"]');
    expect(opts[0].attributes("tabindex")).toBe("-1");
    expect(opts[1].attributes("tabindex")).toBe("0");
  });
});
