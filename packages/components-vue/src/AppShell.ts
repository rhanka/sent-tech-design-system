import { defineComponent, h, ref, type PropType, type Ref, type VNode } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellPanelCollapse = "stack" | "accordion";
export type AppShellPanelKey = "navigationPanel" | "contextPanel" | "utilityPanel";

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
  /** Enables drag-to-resize handles on side panels above 48rem. Default false — zero regression. */
  panelResize?: boolean;
  /** Controlled panel widths in px. When provided the component never mutates width itself. */
  panelWidths?: Partial<Record<AppShellPanelKey, number>>;
  /** Seeds uncontrolled widths in px. */
  defaultPanelWidths?: Partial<Record<AppShellPanelKey, number>>;
  /** Fired on every committed resize. Persistence is the CONSUMER's job — the DS stays presentational. */
  onPanelResize?: (key: AppShellPanelKey, width: number) => void;
  /** Lower clamp in px. Default 180. */
  panelMinWidth?: number;
  /** Upper clamp in px. Default 640. */
  panelMaxWidth?: number;
  class?: string;
};

// CSS custom property each resizable panel is sized by (see the
// `.st-appShell__navigationPanel` / `__contextPanel` / `__utilityPanel` rules
// in styles.css) — setting it inline on the shell root is the intended resize
// mechanism, it simply out-specificities the token-driven default declared
// there.
const PANEL_VAR: Record<AppShellPanelKey, string> = {
  navigationPanel: "--st-appShell-navigation-width",
  contextPanel: "--st-appShell-context-width",
  utilityPanel: "--st-appShell-utility-width",
};

// Nominal px equivalent of each panel's own CSS-token default — used ONLY as
// a display/ARIA fallback (aria-valuenow, drag-start anchor) before any width
// has ever been supplied or committed. Never written back as an inline
// style, so a themed override of the underlying token is never fought until
// the consumer/user actually establishes a concrete width.
// NOTE: `primaryRail` is intentionally NOT a resizable panel — it is a
// fixed-width icon rail (à la VS Code's activity bar), not a splittable
// pane; see `AppShellPanelKey` above.
const PANEL_NOMINAL_PX: Record<AppShellPanelKey, number> = {
  navigationPanel: 320,
  contextPanel: 352,
  utilityPanel: 384,
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
    panelResize: { type: Boolean, default: false },
    panelWidths: { type: Object as () => Partial<Record<AppShellPanelKey, number>>, default: undefined },
    defaultPanelWidths: { type: Object as () => Partial<Record<AppShellPanelKey, number>>, default: undefined },
    onPanelResize: {
      type: Function as unknown as () => (key: AppShellPanelKey, width: number) => void,
      default: undefined,
    },
    panelMinWidth: { type: Number, default: 180 },
    panelMaxWidth: { type: Number, default: 640 },
    class: { type: String, default: undefined },
  },
  emits: ["panelResize"],
  setup(props, { slots, attrs, emit }) {
    // Uncontrolled per-panel disclosure state (v1) — each accordion panel
    // starts collapsed. Desktop rendering never reads these (CSS scopes the
    // collapse to `@media (max-width: 48rem)`), so they have zero effect
    // above the breakpoint.
    const primaryRailPanelOpen = ref(false);
    const navigationPanelOpen = ref(false);
    const contextPanelOpen = ref(false);
    const utilityPanelOpen = ref(false);

    // ── Resizable panels (panelResize) ──────────────────────────────────────
    // Controlled/uncontrolled mirrors RangeSlider.ts: `panelWidths` present
    // (even as `{}`) means controlled — the component reads it but never
    // writes it; otherwise widths live in `internalWidths`, seeded ONCE (at
    // setup time) from `defaultPanelWidths`.
    const internalWidths = ref<Partial<Record<AppShellPanelKey, number>>>({ ...props.defaultPanelWidths });

    const navigationPanelEl: Ref<HTMLElement | null> = ref(null);
    const contextPanelEl: Ref<HTMLElement | null> = ref(null);
    const utilityPanelEl: Ref<HTMLElement | null> = ref(null);

    function isWidthControlled(): boolean {
      return props.panelWidths !== undefined;
    }

    function widthFor(key: AppShellPanelKey): number | undefined {
      const source = isWidthControlled() ? props.panelWidths : internalWidths.value;
      return source?.[key];
    }

    function clampWidth(n: number): number {
      return Math.min(Math.max(n, props.panelMinWidth), props.panelMaxWidth);
    }

    // Current width for rendering/ARIA — always a concrete, clamped number so
    // aria-valuenow is never NaN and is always within [aria-valuemin, aria-valuemax].
    function displayWidth(key: AppShellPanelKey): number {
      return clampWidth(widthFor(key) ?? PANEL_NOMINAL_PX[key]);
    }

    function panelElFor(key: AppShellPanelKey): HTMLElement | null {
      if (key === "navigationPanel") return navigationPanelEl.value;
      if (key === "contextPanel") return contextPanelEl.value;
      return utilityPanelEl.value;
    }

    function commitWidth(key: AppShellPanelKey, next: number) {
      const clamped = clampWidth(next);
      if (!isWidthControlled()) internalWidths.value = { ...internalWidths.value, [key]: clamped };
      // `emit("panelResize")` already routes to an `onPanelResize` handler prop
      // (Vue maps emitted events to their `onX` listeners), so calling
      // `props.onPanelResize` here as well would fire the callback twice.
      // Emit only.
      emit("panelResize", key, clamped);
    }

    // Pointer-drag bookkeeping — plain (non-reactive) fields, never read from
    // the render function, only from the pointer handlers below.
    let dragKey: AppShellPanelKey | null = null;
    let dragPositive = true;
    let dragStartX = 0;
    let dragStartWidth = 0;

    function onHandlePointerDown(event: PointerEvent, key: AppShellPanelKey, positive: boolean) {
      const handle = event.currentTarget as HTMLElement;
      handle.setPointerCapture?.(event.pointerId);
      dragKey = key;
      dragPositive = positive;
      dragStartX = event.clientX;
      const measured = panelElFor(key)?.getBoundingClientRect().width ?? 0;
      dragStartWidth = measured > 0 ? measured : displayWidth(key);
      event.preventDefault();
    }

    function onHandlePointerMove(event: PointerEvent) {
      if (dragKey === null) return;
      const dx = event.clientX - dragStartX;
      const delta = dragPositive ? dx : -dx;
      commitWidth(dragKey, dragStartWidth + delta);
    }

    function onHandlePointerUp(event: PointerEvent) {
      if (dragKey === null) return;
      const handle = event.currentTarget as HTMLElement;
      if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture?.(event.pointerId);
      dragKey = null;
    }

    // Arrow keys move the splitter itself (WAI-ARIA window-splitter pattern):
    // for a "positive" (left-edge) panel, moving the splitter right grows it;
    // for a "negative" (right-edge) panel, moving the splitter right shrinks
    // it. Home/End always jump to the absolute clamp bounds.
    function onHandleKeydown(event: KeyboardEvent, key: AppShellPanelKey, positive: boolean) {
      const current = displayWidth(key);
      let next: number;
      switch (event.key) {
        case "ArrowLeft":
          next = current + (positive ? -16 : 16);
          break;
        case "ArrowRight":
          next = current + (positive ? 16 : -16);
          break;
        case "Home":
          next = props.panelMinWidth;
          break;
        case "End":
          next = props.panelMaxWidth;
          break;
        default:
          return;
      }
      event.preventDefault();
      commitWidth(key, next);
    }

    function renderResizeHandle(key: AppShellPanelKey, positive: boolean, ariaLabel: string): VNode {
      return h("div", {
        class: "st-appShell__resizeHandle",
        role: "separator",
        "aria-orientation": "vertical",
        tabindex: 0,
        "aria-valuenow": displayWidth(key),
        "aria-valuemin": props.panelMinWidth,
        "aria-valuemax": props.panelMaxWidth,
        "aria-label": `Resize ${ariaLabel}`,
        onPointerdown: (event: PointerEvent) => onHandlePointerDown(event, key, positive),
        onPointermove: onHandlePointerMove,
        onPointerup: onHandlePointerUp,
        onPointercancel: onHandlePointerUp,
        onKeydown: (event: KeyboardEvent) => onHandleKeydown(event, key, positive),
      });
    }

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
      elRef?: Ref<HTMLElement | null>;
      resizeHandle?: VNode | null;
    }) {
      const { asideClass, ariaLabel, key, label, isOpen, toggle, content, elRef, resizeHandle } = opts;
      const triggerId = `st-appShell-${key}-trigger`;
      const regionId = `st-appShell-${key}-region`;
      const asideProps: Record<string, unknown> = { class: asideClass, "aria-label": ariaLabel };
      if (elRef) asideProps.ref = elRef;

      if (props.panelCollapse !== "accordion") {
        const children = resizeHandle ? [...content, resizeHandle] : content;
        return h("aside", asideProps, children);
      }

      const open = isOpen();
      const children: (VNode | null)[] = [
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
      ];
      if (resizeHandle) children.push(resizeHandle);
      return h("aside", asideProps, children);
    }

    return () => {
      if (props.variant === "site") {
        return h("div", { ...attrs, class: classNames("st-appShell st-appShell--site", props.class), "data-st-app-shell-variant": "site" }, slots.default?.());
      }

      const navigationPanelLabelResolved = props.navigationPanelLabel ?? props.navigationLabel;
      const contextPanelLabelResolved = props.contextPanelLabel ?? props.contextLabel;
      const utilityPanelLabelResolved = props.utilityPanelLabel ?? props.utilityLabel;

      // Only the CSS vars for panels with an explicit (controlled or
      // committed) width are emitted — an untouched panel keeps deferring to
      // its token default (styles.css), so a theme's own width override is
      // never silently overridden just because `panelResize` is on.
      let panelStyle: Record<string, string> | undefined;
      if (props.panelResize) {
        const style: Record<string, string> = {};
        for (const key of Object.keys(PANEL_VAR) as AppShellPanelKey[]) {
          const width = widthFor(key);
          if (width !== undefined) style[PANEL_VAR[key]] = `${clampWidth(width)}px`;
        }
        panelStyle = Object.keys(style).length ? style : undefined;
      }

      // `utilityPanel` mirrors a left panel (grow-on-drag-right) unless it
      // sits on the right edge; the "bottom" side never renders a handle at
      // all, so its `positive` value is never read.
      const utilityPositive = props.utilitySide !== "right";

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-appShell st-appShell--workspace", props.class),
          "data-st-app-shell-variant": "workspace",
          "data-utility-mode": props.utilityMode,
          "data-utility-side": props.utilitySide,
          "data-panel-collapse": props.panelCollapse,
          style: panelStyle,
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
                  // No resize handle here: `primaryRail` is a fixed-width icon
                  // rail (à la VS Code's activity bar), not a resizable panel —
                  // see `AppShellPanelKey`.
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
                  elRef: navigationPanelEl,
                  resizeHandle: props.panelResize ? renderResizeHandle("navigationPanel", true, props.navigationLabel) : null,
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
                  elRef: contextPanelEl,
                  resizeHandle: props.panelResize ? renderResizeHandle("contextPanel", false, props.contextLabel) : null,
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
                  elRef: utilityPanelEl,
                  resizeHandle:
                    props.panelResize && props.utilitySide !== "bottom"
                      ? renderResizeHandle("utilityPanel", utilityPositive, props.utilityLabel)
                      : null,
                })
              : null,
          ]),
          slots.bottomPanel ? h("section", { class: "st-appShell__bottomPanel", "aria-label": "Workspace tools" }, slots.bottomPanel()) : null,
        ],
      );
    };
  },
});
