import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export interface NavRailItem {
  id: string;
  label: unknown;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: unknown;
  icon?: unknown;
}

export type NavRailProps = {
  items?: NavRailItem[];
  label?: string;
  activeItemId?: string;
  class?: string;
};

export const NavRail = defineComponent({
  name: "NavRail",
  props: {
    items: { type: Array as PropType<NavRailItem[]>, default: () => [] },
    label: { type: String, default: "Primary navigation" },
    activeItemId: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["itemSelect"],
  setup(props, { slots, emit, attrs }) {
    return () => h("nav", { ...attrs, class: classNames("st-navRail", props.class), "aria-label": props.label }, [
      h("div", { class: "st-navRail__items" }, [
        ...props.items.map((item) => {
          const active = item.active === true || item.id === props.activeItemId;
          const content = [item.icon ? h("span", { class: "st-navRail__icon" }, String(item.icon)) : null, h("span", { class: "st-navRail__label" }, item.label as string), item.badge != null ? h("span", { class: "st-navRail__badge" }, String(item.badge)) : null];
          const common = { key: item.id, class: classNames("st-navRail__item", active && "st-navRail__item--active"), "aria-current": active ? "page" : undefined, onClick: () => !item.disabled && emit("itemSelect", item.id) };
          return item.href && !item.disabled ? h("a", { ...common, href: item.href }, content) : h("button", { ...common, type: "button", disabled: item.disabled }, content);
        }),
        slots.default?.(),
      ]),
      slots.footer ? h("footer", { class: "st-navRail__footer" }, slots.footer()) : null,
    ]);
  },
});
