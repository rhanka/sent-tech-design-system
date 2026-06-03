import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type NotificationTone = "info" | "success" | "warning" | "error";

export type NotificationProps = {
  tone?: NotificationTone;
  title: string;
  message?: string;
  dismissible?: boolean;
  dismissLabel?: string;
  class?: string;
};

export const Notification = defineComponent({
  name: "Notification",
  props: {
    tone: { type: String as () => NotificationTone, default: "info" },
    title: { type: String, required: true },
    message: { type: String, default: undefined },
    dismissible: { type: Boolean, default: false },
    dismissLabel: { type: String, default: "Dismiss" },
    class: { type: String, default: undefined },
  },
  emits: ["dismiss"],
  setup(props, { emit, slots, attrs }) {
    return () => {
      const role = props.tone === "error" ? "alert" : "status";
      return h(
        "section",
        {
          ...attrs,
          class: classNames("st-notification", `st-notification--${props.tone}`, props.class),
          role,
        },
        [
          h("div", { class: "st-notification__content" }, [
            h("h2", { class: "st-notification__title" }, props.title),
            props.message ? h("p", { class: "st-notification__message" }, props.message) : null,
            slots.default?.(),
          ]),
          h("div", { class: "st-notification__meta" }, [
            slots.actions ? h("div", { class: "st-notification__actions" }, slots.actions()) : null,
            props.dismissible
              ? h(
                  "button",
                  {
                    type: "button",
                    class: "st-notification__close",
                    "aria-label": props.dismissLabel,
                    title: props.dismissLabel,
                    onClick: () => emit("dismiss"),
                  },
                  "×",
                )
              : null,
          ]),
        ],
      );
    };
  },
});
