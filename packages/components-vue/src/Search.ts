import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type SearchSize = "sm" | "md" | "lg";

export type SearchProps = {
  label?: unknown;
  size?: SearchSize;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-search-${++_counter}`;
}

export const Search = defineComponent({
  name: "Search",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, default: undefined },
    size: { type: String as () => SearchSize, default: "md" },
    modelValue: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    id: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change", "input", "clear"],
  setup(props, { emit, attrs }) {
    const autoId = ref(nextId());

    return () => {
      const inputId = props.id ?? autoId.value;

      return h(
        "div",
        {
          class: classNames(
            "st-search",
            `st-search--${props.size}`,
            props.class,
          ),
        },
        [
          props.label
            ? h(
                "label",
                { class: "st-field__label", for: inputId },
                props.label as string,
              )
            : null,
          h("span", {
            class: "st-search__icon",
            "aria-hidden": "true",
            innerHTML: "⌕",
          }),
          h("input", {
            ...attrs,
            id: inputId,
            class: "st-search__control st-search__input",
            type: "search",
            value: props.modelValue,
            placeholder: props.placeholder,
            disabled: props.disabled,
            onInput: (event: Event) => {
              emit(
                "update:modelValue",
                (event.target as HTMLInputElement).value,
              );
              emit("input", event);
            },
            onChange: (event: Event) => {
              emit("change", event);
            },
          }),
        ],
      );
    };
  },
});
