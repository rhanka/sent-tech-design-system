import { defineComponent, h, onMounted, onUnmounted, ref } from "vue";
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
            h(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: 16,
                height: 16,
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": 2,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "aria-hidden": "true",
              },
              [h("path", { d: "m5 12 7-7 7 7" }), h("path", { d: "M12 19V5" })],
            ),
          ),
          h("span", { class: "st-backToTop__label" }, props.label),
        ],
      );
    };
  },
});
