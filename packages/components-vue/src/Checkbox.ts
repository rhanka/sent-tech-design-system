import { defineComponent, h, ref } from "vue";
import type { VNodeChild } from "vue";
import { classNames } from "./classNames.js";

export type CheckboxProps = {
  label: string;
  helperText?: string;
  /** Secondary muted description line under the label (e.g. a filter hint). */
  description?: string;
  invalid?: boolean;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-checkbox-${++_counter}`;
}

export const Checkbox = defineComponent({
  name: "Checkbox",
  props: {
    label: { type: String, required: true },
    helperText: { type: String, default: undefined },
    description: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    modelValue: { type: Boolean, default: undefined },
    checked: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, slots, attrs }) {
    const autoId = ref(nextId());

    return () => {
      const descriptionId = `${autoId.value}-description`;
      // Merge our description id with any consumer-provided aria-describedby so we
      // never clobber an existing one.
      const consumerDescribedBy = attrs["aria-describedby"] as string | undefined;
      const describedBy = props.description
        ? [consumerDescribedBy, descriptionId].filter(Boolean).join(" ")
        : consumerDescribedBy;

      const contentChildren: VNodeChild[] = [
        h("span", { class: "st-choice__label" }, props.label),
      ];
      if (props.description) {
        contentChildren.push(
          h(
            "span",
            { class: "st-choice__description", id: descriptionId },
            props.description,
          ),
        );
      }
      if (props.helperText) {
        contentChildren.push(h("span", { class: "st-choice__help" }, props.helperText));
      }

      const children: VNodeChild[] = [
        h("input", {
          ...attrs,
          class: "st-choice__input",
          type: "checkbox",
          name: props.name,
          value: props.value,
          checked: props.modelValue ?? props.checked,
          disabled: props.disabled,
          "aria-invalid": props.invalid ? "true" : undefined,
          "aria-describedby": describedBy,
          onChange: (event: Event) => {
            const checked = (event.target as HTMLInputElement).checked;
            emit("update:modelValue", checked);
            emit("change", event);
          },
        }),
        h("span", { class: "st-choice__content" }, contentChildren),
      ];

      if (slots.trailing) {
        children.push(h("span", { class: "st-choice__trailing" }, slots.trailing()));
      }

      return h(
        "label",
        {
          class: classNames(
            "st-choice",
            "st-choice--checkbox",
            props.description ? "st-choice--described" : undefined,
            props.class,
          ),
        },
        children,
      );
    };
  },
});
