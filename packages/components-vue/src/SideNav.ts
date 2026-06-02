import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SideNavItem = {
  label: unknown;
  href: string;
  active?: boolean;
  children?: SideNavItem[];
};

export type SideNavProps = {
  items: SideNavItem[];
  label?: string;
  class?: string;
};

export const SideNav = defineComponent({
  name: "SideNav",
  props: {
    items: { type: Array as () => SideNavItem[], required: true },
    label: { type: String, default: "Navigation" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "nav",
        {
          ...attrs,
          class: classNames("st-sidenav st-sideNav", props.class),
          "aria-label": props.label,
        },
        props.items.map((item) =>
          h(
            "a",
            {
              key: item.href,
              href: item.href,
              class: classNames(
                "st-sidenav__link st-sideNav__link",
                item.active && "st-sidenav__link--active st-sideNav__link--active",
              ),
            },
            item.label as string,
          ),
        ),
      );
  },
});
