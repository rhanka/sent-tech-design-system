import { defineComponent, h, Teleport } from "vue";
import { classNames } from "./classNames.js";

export type PortalProps = {
  /**
   * Where to teleport the children. A CSS selector string or an actual
   * `HTMLElement`. Defaults to the document `<body>`.
   */
  target?: string | HTMLElement;
  /** When `true`, render inline in place (no teleportation). */
  disabled?: boolean;
  /** Optional class applied to the portal container element. */
  class?: string;
};

/**
 * Teleport `children` into another part of the DOM via Vue's native
 * `<Teleport>`. A `target` string is passed straight through as a CSS selector;
 * an `HTMLElement` is accepted as well. When `disabled` is set the children
 * render inline in place. Teleport is SSR-aware, so no manual DOM access here.
 */
export const Portal = defineComponent({
  name: "Portal",
  props: {
    target: {
      type: [String, Object] as unknown as () => string | HTMLElement,
      default: "body",
    },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h(
        Teleport,
        { to: props.target, disabled: props.disabled },
        h(
          "div",
          {
            class: classNames("st-portal", props.class),
            "data-st-portal": props.disabled ? "inline" : "teleported",
          },
          slots.default?.(),
        ),
      );
  },
});
