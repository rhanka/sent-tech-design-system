import { defineComponent, h, onUnmounted, ref, watch } from "vue";
import { X } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type ModalProps = {
  open?: boolean;
  title?: string;
  description?: string;
  class?: string;
};

export const Modal = defineComponent({
  name: "Modal",
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["close"],
  setup(props, { emit, slots, attrs }) {
    const dialogRef = ref<HTMLElement | null>(null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        emit("close");
      }
    };

    watch(
      () => props.open,
      (open) => {
        if (open) {
          document.body.style.overflow = "hidden";
          document.addEventListener("keydown", onKeyDown);
        } else {
          document.body.style.overflow = "";
          document.removeEventListener("keydown", onKeyDown);
        }
      },
    );

    onUnmounted(() => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    });

    return () => {
      if (!props.open) return null;

      return h(
        "div",
        { class: "st-modal__backdrop" },
        h(
          "section",
          {
            ...attrs,
            ref: dialogRef,
            class: classNames("st-modal", props.class),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": props.title || "Modal",
            tabindex: -1,
          },
          [
            h("div", { class: "st-modal__header" }, [
              props.title ? h("h2", { class: "st-modal__title" }, props.title) : null,
              h(
                "button",
                {
                  type: "button",
                  class: "st-modal__close",
                  "aria-label": "Close",
                  onClick: () => emit("close"),
                },
                h(X, { size: 18, strokeWidth: 2.25, "aria-hidden": "true" }),
              ),
            ]),
            props.description
              ? h("p", { class: "st-modal__description" }, props.description)
              : null,
            h("div", { class: "st-modal__body" }, slots.default?.()),
            slots.footer
              ? h("div", { class: "st-modal__footer" }, slots.footer())
              : null,
          ],
        ),
      );
    };
  },
});
