import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type AlertTone = "info" | "success" | "warning" | "error";

export type AlertProps = {
  tone?: AlertTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
  class?: string;
};

export const Alert = defineComponent({
  name: "Alert",
  props: {
    tone: {
      type: String as () => AlertTone,
      default: "info",
    },
    title: { type: [String, Object] as unknown as () => unknown, required: true },
    message: { type: [String, Object] as unknown as () => unknown, default: undefined },
    actions: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: classNames("st-alert", `st-alert--${props.tone}`, props.class),
          role:
            props.tone === "warning" || props.tone === "error"
              ? "alert"
              : "status",
        },
        [
          h("div", { class: "st-alert__content" }, [
            h("h2", { class: "st-alert__title" }, props.title as string),
            props.message
              ? h("p", { class: "st-alert__message" }, props.message as string)
              : null,
            slots.default?.(),
          ]),
          props.actions
            ? h("div", { class: "st-alert__actions" }, props.actions as string)
            : null,
        ],
      );
  },
});
