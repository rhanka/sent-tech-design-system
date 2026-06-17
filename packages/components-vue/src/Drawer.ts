import { defineComponent, h, onMounted, onUnmounted, ref, watch } from "vue";
import { classNames } from "./classNames.js";

export type DrawerPlacement = "left" | "right" | "bottom";

export type DrawerProps = {
  open?: boolean;
  title?: string;
  description?: string;
  placement?: DrawerPlacement;
  class?: string;
};

export const Drawer = defineComponent({
  name: "Drawer",
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    placement: { type: String as () => DrawerPlacement, default: "right" },
    class: { type: String, default: undefined },
  },
  emits: ["close"],
  setup(props, { emit, slots, attrs }) {
    const panelRef = ref<HTMLElement | null>(null);

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
        {
          class: "st-drawer__backdrop",
          "data-testid": "st-drawer-backdrop",
          role: "presentation",
          onClick: (event: MouseEvent) => {
            if (event.target === event.currentTarget) emit("close");
          },
        },
        h(
          "aside",
          {
            ...attrs,
            ref: panelRef,
            class: classNames(
              "st-drawer",
              `st-drawer--${props.placement}`,
              props.class,
            ),
            role: "dialog",
            "aria-modal": "true",
            "aria-label": props.title || "Drawer",
            tabindex: -1,
          },
          [
            h("div", { class: "st-drawer__header" }, [
              props.title
                ? h("h2", { class: "st-drawer__title" }, props.title)
                : null,
              h(
                "button",
                {
                  type: "button",
                  class: "st-drawer__close",
                  "aria-label": "Close",
                  onClick: () => emit("close"),
                },
                "x",
              ),
            ]),
            props.description
              ? h("p", { class: "st-drawer__description" }, props.description)
              : null,
            h("div", { class: "st-drawer__body" }, slots.default?.()),
            slots.footer
              ? h("div", { class: "st-drawer__footer" }, slots.footer())
              : null,
          ],
        ),
      );
    };
  },
});
