import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type EmptyStateProps = {
  title: unknown;
  message?: unknown;
  action?: unknown;
  class?: string;
};

export const EmptyState = defineComponent({
  name: "EmptyState",
  props: {
    title: { type: [String, Object] as unknown as () => unknown, required: true },
    message: { type: [String, Object] as unknown as () => unknown, default: undefined },
    action: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: classNames("st-empty-state st-emptyState", props.class),
        },
        [
          h("div", { class: "st-empty-state__content" }, [
            h(
              "h2",
              {
                class: "st-empty-state__title st-emptyState__title",
              },
              props.title as string,
            ),
            props.message
              ? h(
                  "p",
                  {
                    class: "st-empty-state__message st-emptyState__message",
                  },
                  props.message as string,
                )
              : null,
            slots.default?.(),
            props.action
              ? h(
                  "div",
                  { class: "st-empty-state__action" },
                  props.action as string,
                )
              : null,
          ]),
        ],
      );
  },
});
