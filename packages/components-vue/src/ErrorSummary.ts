import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

/** A single field error: `href` points to the offending control, `text` is the message. */
export type ErrorSummaryItem = { href: string; text: string };

export type ErrorSummaryProps = {
  heading?: string;
  errors?: ErrorSummaryItem[];
  class?: string;
};

/**
 * ErrorSummary — GCDS « Error summary »: an aggregated list of a form's errors,
 * each entry linking to the field that needs attention.
 */
export const ErrorSummary = defineComponent({
  name: "ErrorSummary",
  props: {
    heading: { type: String, default: "There was a problem" },
    errors: {
      type: Array as () => ErrorSummaryItem[],
      default: () => [],
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: classNames("st-error-summary", props.class),
          role: "alert",
          tabindex: "-1",
        },
        [
          h("h2", { class: "st-error-summary__heading" }, props.heading),
          props.errors.length > 0
            ? h(
                "ul",
                { class: "st-error-summary__list" },
                props.errors.map((error) =>
                  h("li", { class: "st-error-summary__item", key: error.href }, [
                    h(
                      "a",
                      { class: "st-error-summary__link", href: error.href },
                      error.text,
                    ),
                  ]),
                ),
              )
            : null,
        ],
      );
  },
});
