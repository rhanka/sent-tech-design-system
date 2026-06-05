import { defineComponent, h, type PropType, type VNode } from "vue";
import { classNames } from "./classNames.js";

export type SelectableRowProps = {
  /** Selected state (controlled). */
  selected?: boolean;
  /** Notified on every toggle with the new selected state. */
  onSelect?: (selected: boolean) => void;
  /** Non-interactive when true. */
  disabled?: boolean;
  /** Optional stable value, surfaced as `data-value` for the consumer. */
  value?: string;
  class?: string;
};

/**
 * Compact, full-width selectable list/rail row. The selected state is truly
 * themed (a tinted surface + accented text + a fine 2px flush accent bar) —
 * deliberately NOT the off-theme "boudin box" it replaces. role="option" +
 * aria-selected, keyboard-activatable (Enter / Space), inert when disabled.
 * Slots: default (content), leading (icon / avatar), trailing (meta / icon).
 */
export const SelectableRow = defineComponent({
  name: "SelectableRow",
  props: {
    selected: { type: Boolean, default: false },
    onSelect: {
      type: Function as PropType<(selected: boolean) => void>,
      default: undefined,
    },
    disabled: { type: Boolean, default: false },
    value: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: {
    select: (_selected: boolean) => true,
  },
  setup(props, { slots, attrs, emit }) {
    function toggle() {
      if (props.disabled) return;
      const next = !props.selected;
      // `emit("select")` invokes the `onSelect` prop/listener exactly once
      // (Vue resolves the `onXxx` handler for the emitted event). Calling
      // `props.onSelect` here as well would double-fire it.
      emit("select", next);
    }

    function handleKeydown(e: KeyboardEvent) {
      if (props.disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    }

    return () => {
      const children: VNode[] = [];
      if (slots.leading) {
        children.push(h("span", { class: "st-selectableRow__leading" }, slots.leading()));
      }
      children.push(h("span", { class: "st-selectableRow__content" }, slots.default?.()));
      if (slots.trailing) {
        children.push(h("span", { class: "st-selectableRow__trailing" }, slots.trailing()));
      }

      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-selectableRow",
            props.selected && "st-selectableRow--selected",
            props.disabled && "st-selectableRow--disabled",
            props.class,
          ),
          role: "option",
          "aria-selected": props.selected ? "true" : "false",
          "aria-disabled": props.disabled ? "true" : undefined,
          "data-value": props.value,
          tabindex: props.disabled ? -1 : 0,
          onClick: toggle,
          onKeydown: handleKeydown,
        },
        children,
      );
    };
  },
});
