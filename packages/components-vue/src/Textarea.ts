import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type TextareaProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  invalid?: boolean;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-textarea-${++_counter}`;
}

export const Textarea = defineComponent({
  name: "Textarea",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    errorText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    invalid: { type: Boolean, default: false },
    modelValue: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    rows: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change", "input"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextId());

    return () => {
      const inputId = autoId.value;
      const isInvalid = props.invalid || Boolean(props.errorText);

      return h(
        "div",
        { class: classNames("st-field", props.class) },
        [
          h(
            "label",
            { class: "st-field__control", for: inputId },
            [
              props.label
                ? h(
                    "span",
                    { class: "st-field__label" },
                    props.label as string,
                  )
                : null,
              h("textarea", {
                ...attrs,
                id: inputId,
                class: "st-textarea st-control",
                "aria-invalid": isInvalid ? "true" : undefined,
                value: props.modelValue,
                placeholder: props.placeholder,
                disabled: props.disabled,
                readonly: props.readonly,
                rows: props.rows,
                onInput: (event: Event) => {
                  emit(
                    "update:modelValue",
                    (event.target as HTMLTextAreaElement).value,
                  );
                  emit("input", event);
                },
                onChange: (event: Event) => {
                  emit("change", event);
                },
              }),
            ],
          ),
          props.errorText
            ? h(
                "span",
                { class: "st-field__error" },
                props.errorText as string,
              )
            : props.helperText
              ? h(
                  "span",
                  { class: "st-field__help" },
                  props.helperText as string,
                )
              : null,
        ],
      );
    };
  },
});
