import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type AccordionItem = {
  id?: string;
  title: string;
  content: string | (() => unknown);
  disabled?: boolean;
};

export type AccordionProps = {
  items: AccordionItem[];
  openIds?: string[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  /** Svelte-canonical alias for `defaultOpenIds` (initially open item ids). */
  open?: string[];
  /** Svelte-canonical alias for `allowMultiple`. */
  multiple?: boolean;
  class?: string;
};

function idFrom(item: { id?: string }, index: number, prefix: string): string {
  return item.id ?? `${prefix}-${index}`;
}

export const Accordion = defineComponent({
  name: "Accordion",
  props: {
    items: { type: Array as () => AccordionItem[], required: true },
    openIds: { type: Array as () => string[], default: undefined },
    defaultOpenIds: { type: Array as () => string[], default: undefined },
    allowMultiple: { type: Boolean, default: undefined },
    open: { type: Array as () => string[], default: undefined },
    multiple: { type: Boolean, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { emit, attrs }) {
    const localOpen = ref<string[]>(props.defaultOpenIds ?? props.open ?? []);

    return () => {
      const open = props.openIds ?? localOpen.value;
      const allowMultiple = props.allowMultiple ?? props.multiple ?? true;

      const toggle = (id: string) => {
        const next = open.includes(id)
          ? open.filter((v) => v !== id)
          : allowMultiple
            ? [...open, id]
            : [id];
        if (props.openIds === undefined) {
          localOpen.value = next;
        }
        emit("change", next);
      };

      return h(
        "div",
        { ...attrs, class: classNames("st-accordion", props.class) },
        props.items.map((item, index) => {
          const itemId = idFrom(item, index, "accordion");
          const isOpen = open.includes(itemId);
          const triggerId = `st-accordion-trigger-${itemId}`;
          const panelId = `st-accordion-panel-${itemId}`;
          return h(
            "section",
            {
              key: itemId,
              class: classNames(
                "st-accordion__item",
                isOpen && "st-accordion__item--open",
              ),
            },
            [
              h("h3", { class: "st-accordion__heading" }, [
                h(
                  "button",
                  {
                    id: triggerId,
                    type: "button",
                    class: "st-accordion__trigger",
                    disabled: item.disabled,
                    "aria-expanded": isOpen,
                    "aria-controls": panelId,
                    onClick: () => toggle(itemId),
                  },
                  [
                    h(
                      "span",
                      { class: "st-accordion__title" },
                      item.title as string,
                    ),
                    h(
                      "span",
                      { class: "st-accordion__icon", "aria-hidden": "true" },
                      isOpen ? "-" : "+",
                    ),
                  ],
                ),
              ]),
              isOpen
                ? h(
                    "div",
                    {
                      class: "st-accordion__panel",
                      id: panelId,
                      role: "region",
                      "aria-labelledby": triggerId,
                    },
                    typeof item.content === "function"
                      ? String(item.content())
                      : item.content,
                  )
                : null,
            ],
          );
        }),
      );
    };
  },
});
