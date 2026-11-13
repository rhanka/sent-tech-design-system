<script setup lang="ts">
import { ref, computed, type Ref, type ComponentPublicInstance } from 'vue';
import { classNames } from './classNames.js';
import Icon from './Icon.vue';


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
defineOptions({ name: 'AppShell', inheritAttrs: false });
const props = withDefaults(defineProps<AppShellProps>(), { variant: "workspace", mainId: "main", navigationLabel: "Workspace navigation", contextLabel: "Context panel", utilityLabel: "Utility panel", utilityMode: "reserve", utilitySide: "right", panelCollapse: "stack", primaryRailLabel: "Primary rail", navigationPanelLabel: undefined, contextPanelLabel: undefined, utilityPanelLabel: undefined, panelResize: false, panelWidths: undefined, defaultPanelWidths: undefined, onPanelResize: undefined, panelMinWidth: 180, panelMaxWidth: 640, class: undefined });
defineSlots<{ default?: () => unknown; main?: () => unknown; topChrome?: () => unknown; primaryRail?: () => unknown; navigationPanel?: () => unknown; contextPanel?: () => unknown; utilityPanel?: () => unknown; bottomPanel?: () => unknown }>();
const emit = defineEmits<{ panelResize: [key: AppShellPanelKey, width: number] }>();


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
type PanelKey = 'primaryRail' | AppShellPanelKey;
function togglePanel(key: PanelKey) { const state = { primaryRail: primaryRailPanelOpen, navigationPanel: navigationPanelOpen, contextPanel: contextPanelOpen, utilityPanel: utilityPanelOpen }; state[key].value = !state[key].value; }
function setPanelEl(key: PanelKey, el: Element | ComponentPublicInstance | null) { const node = el as HTMLElement | null; if (key === 'navigationPanel') navigationPanelEl.value = node; else if (key === 'contextPanel') contextPanelEl.value = node; else if (key === 'utilityPanel') utilityPanelEl.value = node; }
const panels = computed(() => [
  { key: 'primaryRail' as const, asideClass: 'st-appShell__primaryRail', ariaLabel: 'Primary rail', label: props.primaryRailLabel, open: primaryRailPanelOpen.value, resizeKey: undefined, positive: true },
  { key: 'navigationPanel' as const, asideClass: 'st-appShell__navigationPanel', ariaLabel: props.navigationLabel, label: props.navigationPanelLabel ?? props.navigationLabel, open: navigationPanelOpen.value, resizeKey: 'navigationPanel' as const, positive: true },
  { key: 'contextPanel' as const, asideClass: 'st-appShell__contextPanel', ariaLabel: props.contextLabel, label: props.contextPanelLabel ?? props.contextLabel, open: contextPanelOpen.value, resizeKey: 'contextPanel' as const, positive: false },
  { key: 'utilityPanel' as const, asideClass: 'st-appShell__utilityPanel', ariaLabel: props.utilityLabel, label: props.utilityPanelLabel ?? props.utilityLabel, open: utilityPanelOpen.value, resizeKey: 'utilityPanel' as const, positive: props.utilitySide !== 'right' },
]);
const panelStyle = computed(() => { if (!props.panelResize) return undefined; const style: Record<string, string> = {}; for (const key of Object.keys(PANEL_VAR) as AppShellPanelKey[]) { const width = widthFor(key); if (width !== undefined) style[PANEL_VAR[key]] = `${clampWidth(width)}px`; } return Object.keys(style).length ? style : undefined; });
</script>

<template>
  <div v-if="props.variant === 'site'" v-bind="$attrs" :class="classNames('st-appShell st-appShell--site', props.class)" data-st-app-shell-variant="site"><slot /></div>
  <div v-else v-bind="$attrs" :class="classNames('st-appShell st-appShell--workspace', props.class)" data-st-app-shell-variant="workspace" :data-utility-mode="props.utilityMode" :data-utility-side="props.utilitySide" :data-panel-collapse="props.panelCollapse" :style="panelStyle">
    <div v-if="$slots.topChrome" class="st-appShell__topChrome"><slot name="topChrome" /></div><div class="st-appShell__body">
      <template v-for="panel in panels.slice(0, 2)" :key="panel.key"><aside v-if="$slots[panel.key]" :ref="(el) => setPanelEl(panel.key, el)" :class="panel.asideClass" :aria-label="panel.ariaLabel">
  <template v-if="props.panelCollapse === 'accordion'"><button type="button" class="st-appShell__panelDisclosure" :aria-expanded="panel.open ? 'true' : 'false'" :aria-controls="`st-appShell-${panel.key}-region`" :id="`st-appShell-${panel.key}-trigger`" @click="togglePanel(panel.key)"><span class="st-appShell__panelDisclosureLabel">{{ panel.label }}</span><span :class="classNames('st-appShell__panelDisclosureIcon', panel.open && 'st-appShell__panelDisclosureIcon--expanded')"><Icon name="chevron-down" bare :size="16" :stroke-width="2" aria-hidden="true" /></span></button><div :class="classNames('st-appShell__panelRegion', !panel.open && 'st-appShell__panelRegion--collapsed')" :id="`st-appShell-${panel.key}-region`" role="region" :aria-labelledby="`st-appShell-${panel.key}-trigger`"><slot :name="panel.key" /></div></template><slot v-else :name="panel.key" />
  <div v-if="panel.resizeKey && props.panelResize && (panel.key !== 'utilityPanel' || props.utilitySide !== 'bottom')" class="st-appShell__resizeHandle" role="separator" aria-orientation="vertical" :tabindex="0" :aria-valuenow="displayWidth(panel.resizeKey)" :aria-valuemin="props.panelMinWidth" :aria-valuemax="props.panelMaxWidth" :aria-label="`Resize ${panel.ariaLabel}`" @pointerdown="onHandlePointerDown($event, panel.resizeKey, panel.positive)" @pointermove="onHandlePointerMove" @pointerup="onHandlePointerUp" @pointercancel="onHandlePointerUp" @keydown="onHandleKeydown($event, panel.resizeKey, panel.positive)" />
</aside></template>
      <main class="st-appShell__main" :id="props.mainId"><slot v-if="$slots.main" name="main" /><slot v-else /></main>
      <template v-for="panel in panels.slice(2)" :key="panel.key"><aside v-if="$slots[panel.key]" :ref="(el) => setPanelEl(panel.key, el)" :class="panel.asideClass" :aria-label="panel.ariaLabel">
  <template v-if="props.panelCollapse === 'accordion'"><button type="button" class="st-appShell__panelDisclosure" :aria-expanded="panel.open ? 'true' : 'false'" :aria-controls="`st-appShell-${panel.key}-region`" :id="`st-appShell-${panel.key}-trigger`" @click="togglePanel(panel.key)"><span class="st-appShell__panelDisclosureLabel">{{ panel.label }}</span><span :class="classNames('st-appShell__panelDisclosureIcon', panel.open && 'st-appShell__panelDisclosureIcon--expanded')"><Icon name="chevron-down" bare :size="16" :stroke-width="2" aria-hidden="true" /></span></button><div :class="classNames('st-appShell__panelRegion', !panel.open && 'st-appShell__panelRegion--collapsed')" :id="`st-appShell-${panel.key}-region`" role="region" :aria-labelledby="`st-appShell-${panel.key}-trigger`"><slot :name="panel.key" /></div></template><slot v-else :name="panel.key" />
  <div v-if="panel.resizeKey && props.panelResize && (panel.key !== 'utilityPanel' || props.utilitySide !== 'bottom')" class="st-appShell__resizeHandle" role="separator" aria-orientation="vertical" :tabindex="0" :aria-valuenow="displayWidth(panel.resizeKey)" :aria-valuemin="props.panelMinWidth" :aria-valuemax="props.panelMaxWidth" :aria-label="`Resize ${panel.ariaLabel}`" @pointerdown="onHandlePointerDown($event, panel.resizeKey, panel.positive)" @pointermove="onHandlePointerMove" @pointerup="onHandlePointerUp" @pointercancel="onHandlePointerUp" @keydown="onHandleKeydown($event, panel.resizeKey, panel.positive)" />
</aside></template>
    </div><section v-if="$slots.bottomPanel" class="st-appShell__bottomPanel" aria-label="Workspace tools"><slot name="bottomPanel" /></section>
  </div>
</template>
