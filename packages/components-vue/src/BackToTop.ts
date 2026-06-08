import { defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { ArrowUp } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type BackToTopProps = {
  label?: string;
  disabled?: boolean;
  targetId?: string;
  threshold?: number;
  autoHide?: boolean;
  smooth?: boolean;
  class?: string;
};

export const BackToTop = defineComponent({
  name: "BackToTop",
  props: {
    label: { type: String, default: "Retour en haut" },
    disabled: { type: Boolean, default: false },
    targetId: { type: String, default: "top" },
    threshold: { type: Number, default: 240 },
    autoHide: { type: Boolean, default: true },
    smooth: { type: Boolean, default: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const visible = ref(!props.autoHide);

    const updateVisibility = () => {
      visible.value = window.scrollY > props.threshold;
    };

    onMounted(() => {
      if (!props.autoHide || typeof window === "undefined") {
        visible.value = true;
        return;
      }
      updateVisibility();
      window.addEventListener("scroll", updateVisibility, { passive: true });
    });

    onUnmounted(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", updateVisibility);
      }
    });

    const goTop = () => {
      const target = props.targetId ? `#${props.targetId.replace(/^#/, "")}` : "#top";
      const anchor = target.startsWith("#") ? target.slice(1) : target;
      const element = anchor ? document.getElementById(anchor) : null;
      if (element) {
        element.scrollIntoView({ behavior: props.smooth ? "smooth" : "auto", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, behavior: props.smooth ? "smooth" : "auto" });
    };

    return () => {
      const hidden = props.autoHide && !visible.value;
      return h(
        "button",
        {
          ...attrs,
          type: "button",
          class: classNames("st-backToTop", props.class),
          onClick: goTop,
          "aria-label": props.label,
          "aria-hidden": hidden ? "true" : undefined,
          "aria-live": hidden ? "polite" : undefined,
          tabindex: hidden ? -1 : undefined,
          disabled: props.disabled,
        },
        [
          h(
            "span",
            { class: "st-backToTop__icon", "aria-hidden": "true" },
            h(ArrowUp, { size: 16 }),
          ),
          h("span", { class: "st-backToTop__label" }, props.label),
        ],
      );
    };
  },
});
