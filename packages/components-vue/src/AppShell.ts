import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";

export type AppShellProps = {
  variant?: AppShellVariant;
  mainId?: string;
  navigationLabel?: string;
  contextLabel?: string;
  utilityLabel?: string;
  utilityMode?: AppShellUtilityMode;
  utilitySide?: AppShellUtilitySide;
  class?: string;
};

export const AppShell = defineComponent({
  name: "AppShell",
  props: {
    variant: { type: String as PropType<AppShellVariant>, default: "workspace" },
    mainId: { type: String, default: "main" },
    navigationLabel: { type: String, default: "Workspace navigation" },
    contextLabel: { type: String, default: "Context panel" },
    utilityLabel: { type: String, default: "Utility panel" },
    utilityMode: { type: String as PropType<AppShellUtilityMode>, default: "reserve" },
    utilitySide: { type: String as PropType<AppShellUtilitySide>, default: "right" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      if (props.variant === "site") {
        return h("div", { ...attrs, class: classNames("st-appShell st-appShell--site", props.class), "data-st-app-shell-variant": "site" }, slots.default?.());
      }
      return h("div", { ...attrs, class: classNames("st-appShell st-appShell--workspace", props.class), "data-st-app-shell-variant": "workspace", "data-utility-mode": props.utilityMode, "data-utility-side": props.utilitySide }, [
        slots.topChrome ? h("div", { class: "st-appShell__topChrome" }, slots.topChrome()) : null,
        h("div", { class: "st-appShell__body" }, [
          slots.primaryRail ? h("aside", { class: "st-appShell__primaryRail", "aria-label": "Primary rail" }, slots.primaryRail()) : null,
          slots.navigationPanel ? h("aside", { class: "st-appShell__navigationPanel", "aria-label": props.navigationLabel }, slots.navigationPanel()) : null,
          h("main", { class: "st-appShell__main", id: props.mainId }, slots.main?.() ?? slots.default?.()),
          slots.contextPanel ? h("aside", { class: "st-appShell__contextPanel", "aria-label": props.contextLabel }, slots.contextPanel()) : null,
          slots.utilityPanel ? h("aside", { class: "st-appShell__utilityPanel", "aria-label": props.utilityLabel }, slots.utilityPanel()) : null,
        ]),
        slots.bottomPanel ? h("section", { class: "st-appShell__bottomPanel", "aria-label": "Workspace tools" }, slots.bottomPanel()) : null,
      ]);
    };
  },
});
