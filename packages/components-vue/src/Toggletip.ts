import { defineComponent, h, ref, watch, onUnmounted } from "vue";
import { classNames } from "./classNames.js";

export type ToggletipPlacement = "top" | "bottom" | "start" | "end";

export type ToggletipProps = {
  label: unknown;
  content?: unknown;
  open?: boolean;
  placement?: ToggletipPlacement;
  class?: string;
};

export const Toggletip = defineComponent({
  name: "Toggletip",
  props: {
    label: { type: [String, Object] as unknown as () => unknown, required: true },
    content: { type: [String, Object] as unknown as () => unknown, default: undefined },
    open: { type: Boolean, default: undefined },
    placement: { type: String as () => ToggletipPlacement, default: "top" },
    class: { type: String, default: undefined },
  },
  emits: ["update:open"],
  setup(props, { emit, slots, attrs }) {
    const localOpen = ref(false);

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    watch(
      () => isOpen(),
      (open) => {
        if (open) document.addEventListener("keydown", onKeyDown);
        else document.removeEventListener("keydown", onKeyDown);
      },
    );

    onUnmounted(() => document.removeEventListener("keydown", onKeyDown));

    return () => {
      const open = isOpen();

      return h(
        "span",
        {
          ...attrs,
          class: classNames(
            "st-toggletip",
            `st-toggletip--${props.placement}`,
            props.class,
          ),
        },
        [
          h(
            "button",
            {
              type: "button",
              class: "st-toggletip__trigger",
              "aria-expanded": open,
              onClick: () => setOpen(!open),
            },
            props.label as string,
          ),
          open
            ? h(
                "span",
                { class: "st-toggletip__bubble", role: "status" },
                h(
                  "span",
                  { class: "st-toggletip__content" },
                  (props.content as string | undefined) ?? slots.default?.(),
                ),
              )
            : null,
        ],
      );
    };
  },
});
