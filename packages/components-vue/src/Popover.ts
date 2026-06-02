import { defineComponent, h, ref, watch, onUnmounted } from "vue";
import { classNames } from "./classNames.js";

export type PopoverPlacement = "top" | "right" | "bottom" | "left";

export type PopoverProps = {
  content?: string;
  open?: boolean;
  placement?: PopoverPlacement;
  class?: string;
};

export const Popover = defineComponent({
  name: "Popover",
  props: {
    content: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    placement: { type: String as () => PopoverPlacement, default: "bottom" },
    class: { type: String, default: undefined },
  },
  emits: ["update:open"],
  setup(props, { emit, slots, attrs }) {
    const localOpen = ref(false);
    const hostRef = ref<HTMLElement | null>(null);

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && hostRef.value && !hostRef.value.contains(target)) setOpen(false);
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
        if (open) {
          document.addEventListener("mousedown", onMouseDown);
          document.addEventListener("keydown", onKeyDown);
        } else {
          document.removeEventListener("mousedown", onMouseDown);
          document.removeEventListener("keydown", onKeyDown);
        }
      },
    );

    onUnmounted(() => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    });

    return () => {
      const open = isOpen();

      return h(
        "span",
        {
          ...attrs,
          ref: hostRef,
          class: classNames("st-popover-host", props.class),
          onClick: () => setOpen(true),
        },
        [
          slots.trigger?.() ?? slots.default?.(),
          open
            ? h(
                "span",
                {
                  class: classNames("st-popover", `st-popover--${props.placement}`),
                  role: "dialog",
                  "aria-label": props.content || "Popover",
                },
                props.content ?? slots.content?.(),
              )
            : null,
        ],
      );
    };
  },
});
