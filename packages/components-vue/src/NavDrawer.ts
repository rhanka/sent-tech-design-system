import { defineComponent, h } from "vue";
import { NavShell, type NavShellProps } from "./NavShell.js";

export type NavDrawerProps = Omit<NavShellProps, "variant">;

export const NavDrawer = defineComponent({
  name: "NavDrawer",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h(NavShell as any, { ...attrs, variant: "drawer" }, slots);
  },
});
