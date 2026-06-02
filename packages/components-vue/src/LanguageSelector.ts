import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type LanguageOption = {
  value: string;
  label: unknown;
};

export type LanguageSelectorProps = {
  options: LanguageOption[];
  value?: string;
  open?: boolean;
  class?: string;
};

export const LanguageSelector = defineComponent({
  name: "LanguageSelector",
  props: {
    options: { type: Array as () => LanguageOption[], required: true },
    value: { type: String, default: undefined },
    open: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { emit, attrs }) {
    return () => {
      const current =
        props.options.find((opt) => opt.value === props.value) ?? props.options[0];

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-languageSelector", props.class),
        },
        [
          h(
            "button",
            { type: "button", class: "st-languageSelector__trigger" },
            h(
              "span",
              { class: "st-languageSelector__current" },
              current?.label as string,
            ),
          ),
          props.open
            ? h(
                "ul",
                { class: "st-languageSelector__menu" },
                props.options.map((option) =>
                  h("li", { key: option.value }, [
                    h(
                      "button",
                      {
                        type: "button",
                        class: classNames(
                          "st-languageSelector__option",
                          option.value === props.value &&
                            "st-languageSelector__option--active",
                        ),
                        onClick: () => emit("change", option.value),
                      },
                      option.label as string,
                    ),
                  ]),
                ),
              )
            : null,
        ],
      );
    };
  },
});
