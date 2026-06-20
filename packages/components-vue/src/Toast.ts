import { computed, defineComponent, getCurrentInstance, h, onMounted, onUnmounted } from "vue";
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
  locale?: string;
  closeLabel?: string;
  dismissLabel?: (title: unknown) => string;
};

export const Toast = defineComponent({
  name: "Toast",
  inheritAttrs: false,
  props: {
    tone: { type: String as () => ToastTone, default: "info" },
    title: { type: [String, Object] as unknown as () => unknown, default: undefined },
    message: { type: [String, Object] as unknown as () => unknown, default: undefined },
    items: { type: Array as () => ToastItem[], default: undefined },
    autoDismiss: { type: Boolean, default: false },
    duration: { type: Number, default: 5000 },
    class: { type: String, default: undefined },
    locale: { type: String, default: "fr-FR" },
    closeLabel: { type: String, default: undefined },
    dismissLabel: { type: Function as unknown as () => (title: unknown) => string, default: undefined },
  },
  emits: ["close", "dismiss"],
  setup(props, { emit, slots, attrs }) {
    const instance = getCurrentInstance();
    const isFr = computed(() => (props.locale ?? "fr-FR").toLowerCase().startsWith("fr"));
    const resolvedCloseLabel = computed(() => props.closeLabel ?? (isFr.value ? "Fermer" : "Close"));
    const resolvedDismissLabel = computed(() => props.dismissLabel ?? ((title: unknown) => isFr.value ? `Fermer ${String(title)}` : `Dismiss ${String(title)}`));
    // Canon Svelte/React : pas de bouton de fermeture sauf si un gestionnaire
    // est branché (onClose pour un toast unique, onDismiss pour une file).
    // Avec `emits` déclaré, les écouteurs ne transitent pas par `attrs` ; on lit
    // donc les props du vnode (source fiable des écouteurs passés au composant).
    const hasListener = (name: "onClose" | "onDismiss") => {
      const fromAttrs = (attrs as Record<string, unknown>)[name];
      const fromVnode = instance?.vnode.props?.[name];
      return typeof fromAttrs === "function" || typeof fromVnode === "function";
    };
    const hasClose = () => hasListener("onClose");
    const hasDismiss = () => hasListener("onDismiss");
    const roleFor = (t: string) => (t === "error" ? "alert" : "status");
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
              "section",
              {
                key: item.id,
                class: classNames("st-toast", `st-toast--${item.tone ?? "info"}`),
                role: roleFor(item.tone ?? "info"),
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
                hasDismiss()
                  ? h(
                      "button",
                      {
                        type: "button",
                        "aria-label": resolvedDismissLabel.value(item.title),
                        onClick: () => emit("dismiss", item.id),
                      },
                      resolvedCloseLabel.value,
                    )
                  : null,
              ],
            ),
          ),
        );
      }

      return h(
        "section",
        {
          ...attrs,
          class: classNames("st-toast", `st-toast--${props.tone}`, props.class),
          role: roleFor(props.tone),
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
          hasClose()
            ? h(
                "button",
                {
                  type: "button",
                  onClick: () => emit("close"),
                },
                resolvedCloseLabel.value,
              )
            : null,
        ],
      );
    };
  },
});
