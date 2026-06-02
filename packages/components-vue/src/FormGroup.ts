import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type FormGroupProps = {
  legend: unknown;
  helperText?: unknown;
  class?: string;
};

export const FormGroup = defineComponent({
  name: "FormGroup",
  props: {
    legend: { type: [String, Object] as unknown as () => unknown, required: true },
    helperText: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "fieldset",
        {
          ...attrs,
          class: classNames("st-form-group st-formGroup", props.class),
        },
        [
          h(
            "legend",
            { class: "st-form-group__legend st-formGroup__legend" },
            props.legend as string,
          ),
          props.helperText
            ? h(
                "p",
                { class: "st-form-group__help st-formGroup__help" },
                props.helperText as string,
              )
            : null,
          h(
            "div",
            { class: "st-form-group__body st-formGroup__body" },
            slots.default?.(),
          ),
        ],
      );
  },
});
