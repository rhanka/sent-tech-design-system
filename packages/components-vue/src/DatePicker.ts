import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type DatePickerSize = "sm" | "md" | "lg";

export type DatePickerProps = {
  label?: unknown;
  value?: string;
  size?: DatePickerSize;
  class?: string;
};

let _dpCounter = 0;
function nextDpId(): string {
  return `st-datepicker-${++_dpCounter}`;
}

export const DatePicker = defineComponent({
  name: "DatePicker",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    value: { type: String, default: undefined },
    size: { type: String as () => DatePickerSize, default: "md" },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextDpId());

    return () => {
      const inputId = autoId.value;

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-datepicker", `st-datepicker--${props.size}`, props.class),
        },
        [
          h(
            "div",
            { class: "st-field" },
            [
              h(
                "label",
                { class: "st-field__control", for: inputId },
                [
                  props.label
                    ? h("span", { class: "st-field__label" }, props.label as string)
                    : null,
                  h("input", {
                    id: inputId,
                    class: "st-control st-datepicker__control",
                    type: "date",
                    value: props.value,
                    onChange: (event: Event) => {
                      const val = (event.target as HTMLInputElement).value;
                      emit("update:modelValue", val);
                      emit("change", val);
                    },
                  }),
                ],
              ),
            ],
          ),
        ],
      );
    };
  },
});
