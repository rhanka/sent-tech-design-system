import { defineComponent, h, onMounted, onUnmounted } from "vue";
import { classNames } from "./classNames.js";

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  tone?: ToastTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
};

export type ToastProps = {
  tone?: ToastTone;
  title?: unknown;
  message?: unknown;
  items?: ToastItem[];
  autoDismiss?: boolean;
  duration?: number;
  class?: string;
};

export const Toast = defineComponent({
  name: "Toast",
  props: {
    tone: { type: String as () => ToastTone, default: "info" },
    title: { type: [String, Object] as unknown as () => unknown, default: undefined },
    message: { type: [String, Object] as unknown as () => unknown, default: undefined },
    items: { type: Array as () => ToastItem[], default: undefined },
    autoDismiss: { type: Boolean, default: false },
    duration: { type: Number, default: 5000 },
    class: { type: String, default: undefined },
  },
  emits: ["close", "dismiss"],
  setup(props, { emit, slots, attrs }) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const startAutoDismiss = () => {
      if (props.autoDismiss && props.items?.length) {
        timer = setTimeout(() => {
          emit("dismiss", props.items![0].id);
        }, props.duration);
      }
    };

    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    onMounted(() => startAutoDismiss());
    onUnmounted(() => clearTimer());

    return () => {
      if (props.items?.length) {
        return h(
          "div",
          {
            ...attrs,
            class: classNames("st-toastQueue", props.class),
          },
          props.items.map((item) =>
            h(
              "aside",
              {
                key: item.id,
                class: classNames("st-toast", `st-toast--${item.tone ?? "info"}`),
                role: "status",
              },
              [
                h("div", { class: "st-toast__content" }, [
                  h("h2", { class: "st-toast__title" }, item.title as string),
                  item.message
                    ? h("p", { class: "st-toast__message" }, item.message as string)
                    : null,
                ]),
                item.actions
                  ? h("div", { class: "st-toast__actions" }, item.actions as unknown as string)
                  : null,
                h(
                  "button",
                  {
                    type: "button",
                    "aria-label": `Dismiss ${String(item.title)}`,
                    onClick: () => emit("dismiss", item.id),
                  },
                  "Close",
                ),
              ],
            ),
          ),
        );
      }

      return h(
        "aside",
        {
          ...attrs,
          class: classNames("st-toast", `st-toast--${props.tone}`, props.class),
          role: "status",
        },
        [
          h("div", { class: "st-toast__content" }, [
            h("h2", { class: "st-toast__title" }, (props.title as string | undefined) ?? ""),
            props.message
              ? h("p", { class: "st-toast__message" }, props.message as string)
              : slots.default?.(),
          ]),
          slots.actions
            ? h("div", { class: "st-toast__actions" }, slots.actions())
            : null,
          h(
            "button",
            {
              type: "button",
              onClick: () => emit("close"),
            },
            "Close",
          ),
        ],
      );
    };
  },
});
