import { defineComponent, h, ref, type PropType, type VNode } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellPanelCollapse = "stack" | "accordion";

export type AppShellProps = {
  variant?: AppShellVariant;
  mainId?: string;
  navigationLabel?: string;
  contextLabel?: string;
  utilityLabel?: string;
  utilityMode?: AppShellUtilityMode;
  utilitySide?: AppShellUtilitySide;
  /**
   * Below the 48rem breakpoint, `"stack"` (default) keeps today's behaviour —
   * panels stack full-width in document order, always expanded. `"accordion"`
   * degrades each present panel to a keyboard-accessible disclosure (collapsed
   * by default) instead of squeezing the main content. Desktop (>48rem)
   * rendering is IDENTICAL in both modes — side panels stay side-by-side
   * columns. Panel content is mounted once regardless of mode/breakpoint;
   * collapsing hides/sizes the region rather than destroying it, so stateful
   * widgets (maps, live panels…) mounted in a panel never remount.
   */
  panelCollapse?: AppShellPanelCollapse;
  /** Disclosure label for `primaryRail` when `panelCollapse="accordion"`. */
  primaryRailLabel?: string;
  /** Disclosure label for `navigationPanel` when `panelCollapse="accordion"`. Defaults to `navigationLabel`. */
  navigationPanelLabel?: string;
  /** Disclosure label for `contextPanel` when `panelCollapse="accordion"`. Defaults to `contextLabel`. */
  contextPanelLabel?: string;
  /** Disclosure label for `utilityPanel` when `panelCollapse="accordion"`. Defaults to `utilityLabel`. */
  utilityPanelLabel?: string;
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
    panelCollapse: { type: String as PropType<AppShellPanelCollapse>, default: "stack" },
    primaryRailLabel: { type: String, default: "Primary rail" },
    navigationPanelLabel: { type: String, default: undefined },
    contextPanelLabel: { type: String, default: undefined },
    utilityPanelLabel: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Uncontrolled per-panel disclosure state (v1) — each accordion panel
    // starts collapsed. Desktop rendering never reads these (CSS scopes the
    // collapse to `@media (max-width: 48rem)`), so they have zero effect
    // above the breakpoint.
    const primaryRailPanelOpen = ref(false);
    const navigationPanelOpen = ref(false);
    const contextPanelOpen = ref(false);
    const utilityPanelOpen = ref(false);

    // Renders a panel's `<aside>`. In `"accordion"` mode it wraps the slot
    // content in a disclosure `<button>` + a SINGLE always-mounted
    // `st-appShell__panelRegion` — the region is never conditionally
    // unmounted, only resized/hidden via CSS, so panel content never
    // remounts when it collapses/expands.
    function renderPanel(opts: {
      asideClass: string;
      ariaLabel: string;
      key: string;
      label: string;
      isOpen: () => boolean;
      toggle: () => void;
      content: VNode[];
    }) {
      const { asideClass, ariaLabel, key, label, isOpen, toggle, content } = opts;
      const triggerId = `st-appShell-${key}-trigger`;
      const regionId = `st-appShell-${key}-region`;

      if (props.panelCollapse !== "accordion") {
        return h("aside", { class: asideClass, "aria-label": ariaLabel }, content);
      }

      const open = isOpen();
      return h("aside", { class: asideClass, "aria-label": ariaLabel }, [
        h(
          "button",
          {
            type: "button",
            class: "st-appShell__panelDisclosure",
            "aria-expanded": open ? "true" : "false",
            "aria-controls": regionId,
            id: triggerId,
            onClick: toggle,
          },
          [
            h("span", { class: "st-appShell__panelDisclosureLabel" }, label),
            h(
              "span",
              {
                class: classNames("st-appShell__panelDisclosureIcon", open && "st-appShell__panelDisclosureIcon--expanded"),
              },
              [h(ChevronDown, { size: 16, "aria-hidden": "true" })],
            ),
          ],
        ),
        h(
          "div",
          {
            class: classNames("st-appShell__panelRegion", !open && "st-appShell__panelRegion--collapsed"),
            id: regionId,
            role: "region",
            "aria-labelledby": triggerId,
          },
          content,
        ),
      ]);
    }

    return () => {
      if (props.variant === "site") {
        return h("div", { ...attrs, class: classNames("st-appShell st-appShell--site", props.class), "data-st-app-shell-variant": "site" }, slots.default?.());
      }

      const navigationPanelLabelResolved = props.navigationPanelLabel ?? props.navigationLabel;
      const contextPanelLabelResolved = props.contextPanelLabel ?? props.contextLabel;
      const utilityPanelLabelResolved = props.utilityPanelLabel ?? props.utilityLabel;

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-appShell st-appShell--workspace", props.class),
          "data-st-app-shell-variant": "workspace",
          "data-utility-mode": props.utilityMode,
          "data-utility-side": props.utilitySide,
          "data-panel-collapse": props.panelCollapse,
        },
        [
          slots.topChrome ? h("div", { class: "st-appShell__topChrome" }, slots.topChrome()) : null,
          h("div", { class: "st-appShell__body" }, [
            slots.primaryRail
              ? renderPanel({
                  asideClass: "st-appShell__primaryRail",
                  ariaLabel: "Primary rail",
                  key: "primaryRail",
                  label: props.primaryRailLabel,
                  isOpen: () => primaryRailPanelOpen.value,
                  toggle: () => (primaryRailPanelOpen.value = !primaryRailPanelOpen.value),
                  content: slots.primaryRail(),
                })
              : null,
            slots.navigationPanel
              ? renderPanel({
                  asideClass: "st-appShell__navigationPanel",
                  ariaLabel: props.navigationLabel,
                  key: "navigationPanel",
                  label: navigationPanelLabelResolved,
                  isOpen: () => navigationPanelOpen.value,
                  toggle: () => (navigationPanelOpen.value = !navigationPanelOpen.value),
                  content: slots.navigationPanel(),
                })
              : null,
            h("main", { class: "st-appShell__main", id: props.mainId }, slots.main?.() ?? slots.default?.()),
            slots.contextPanel
              ? renderPanel({
                  asideClass: "st-appShell__contextPanel",
                  ariaLabel: props.contextLabel,
                  key: "contextPanel",
                  label: contextPanelLabelResolved,
                  isOpen: () => contextPanelOpen.value,
                  toggle: () => (contextPanelOpen.value = !contextPanelOpen.value),
                  content: slots.contextPanel(),
                })
              : null,
            slots.utilityPanel
              ? renderPanel({
                  asideClass: "st-appShell__utilityPanel",
                  ariaLabel: props.utilityLabel,
                  key: "utilityPanel",
                  label: utilityPanelLabelResolved,
                  isOpen: () => utilityPanelOpen.value,
                  toggle: () => (utilityPanelOpen.value = !utilityPanelOpen.value),
                  content: slots.utilityPanel(),
                })
              : null,
          ]),
          slots.bottomPanel ? h("section", { class: "st-appShell__bottomPanel", "aria-label": "Workspace tools" }, slots.bottomPanel()) : null,
        ],
      );
    };
  },
});
