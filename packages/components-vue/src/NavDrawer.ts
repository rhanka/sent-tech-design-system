import { defineComponent, h } from "vue";
import NavShell from "./NavShell.vue";
import { type NavShellProps } from "./NavShell.vue";

export type NavDrawerProps = Omit<NavShellProps, "variant">;

export const NavDrawer = defineComponent({
  name: "NavDrawer",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h(NavShell as any, { ...attrs, variant: "drawer" }, slots);
  },
});
