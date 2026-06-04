import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type TabItem = {
  id?: string;
  value?: string;
  label: unknown;
  content?: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@change` emit (which already routes to an
// `onChange` listener), an `onchange` callback prop (Svelte-canonical,
// lowercase) is accepted and fired on change.
export type TabsProps = {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onchange?: (value: string) => void;
  class?: string;
};

let _tabCounter = 0;
function nextTabId(): string {
  return `st-tabs-${++_tabCounter}`;
}

function idFrom(item: { id?: string; value?: string }, index: number, prefix: string): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}

function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}

export const Tabs = defineComponent({
  name: "Tabs",
  props: {
    items: { type: Array as () => TabItem[], required: true },
    activeValue: { type: String, default: undefined },
    activeId: { type: String, default: undefined },
    label: { type: String, default: "Tabs" },
    onchange: { type: Function as unknown as () => (value: string) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { emit, attrs }) {
    const instanceId = ref(nextTabId());
    const first = () => props.items.find((item) => !item.disabled) ?? props.items[0];
    const itemIds = () => props.items.map((item, index) => idFrom(item, index, "tab"));

    const getInitialValue = () => {
      const f = first();
      return (
        props.activeValue ??
        props.activeId ??
        (f ? idFrom(f, props.items.indexOf(f), "tab") : "tab-0")
      );
    };

    const localCurrent = ref(getInitialValue());

    const current = () =>
      props.activeValue ?? props.activeId ?? localCurrent.value;

    const setCurrent = (val: string) => {
      if (props.activeValue === undefined && props.activeId === undefined) {
        localCurrent.value = val;
      }
      emit("change", val);
      props.onchange?.(val);
    };

    const tabRefs = ref<Array<HTMLElement | null>>([]);

    const activateIndex = (index: number) => {
      const item = props.items[index];
      if (!item || item.disabled) return;
      const ids = itemIds();
      setCurrent(ids[index]);
      tabRefs.value[index]?.focus();
    };

    const moveTab = (index: number, delta: number) => {
      const enabled = props.items
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter(({ item }) => !item.disabled);
      const enabledIndex = enabled.findIndex(({ itemIndex }) => itemIndex === index);
      const next = enabled[moveIndex(enabledIndex, enabled.length, delta)];
      if (next) activateIndex(next.itemIndex);
    };

    return () => {
      const ids = itemIds();
      const cur = current();
      const activeIndex = Math.max(0, ids.indexOf(cur));
      const active = props.items[activeIndex] ?? first();
      const uid = instanceId.value;

      return h(
        "section",
        {
          ...attrs,
          class: classNames("st-tabs", props.class),
        },
        [
          h(
            "div",
            { class: "st-tabs__list", role: "tablist", "aria-label": props.label },
            props.items.map((item, index) => {
              const itemId = ids[index];
              const tabId = `${uid}-tab-${itemId}`;
              const panelId = `${uid}-panel-${itemId}`;
              return h(
                "button",
                {
                  key: itemId,
                  ref: (el: unknown) => {
                    tabRefs.value[index] = el as HTMLElement | null;
                  },
                  id: tabId,
                  type: "button",
                  role: "tab",
                  class: classNames(
                    "st-tabs__tab",
                    itemId === cur && "st-tabs__tab--active",
                  ),
                  "aria-selected": itemId === cur,
                  "aria-controls": panelId,
                  tabindex: itemId === cur ? 0 : -1,
                  disabled: item.disabled,
                  onClick: () => activateIndex(index),
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      moveTab(index, 1);
                    } else if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveTab(index, -1);
                    } else if (event.key === "Home") {
                      event.preventDefault();
                      const firstEnabled = props.items.findIndex((c) => !c.disabled);
                      activateIndex(firstEnabled >= 0 ? firstEnabled : 0);
                    } else if (event.key === "End") {
                      event.preventDefault();
                      const lastEnabled =
                        props.items
                          .map((c, ci) => ({ c, ci }))
                          .filter(({ c }) => !c.disabled)
                          .at(-1)?.ci ?? props.items.length - 1;
                      activateIndex(lastEnabled);
                    }
                  },
                },
                item.label as string,
              );
            }),
          ),
          h(
            "div",
            {
              id: `${uid}-panel-${ids[activeIndex]}`,
              class: "st-tabs__panel",
              role: "tabpanel",
              "aria-labelledby": `${uid}-tab-${ids[activeIndex]}`,
            },
            active?.content as string,
          ),
        ],
      );
    };
  },
});
