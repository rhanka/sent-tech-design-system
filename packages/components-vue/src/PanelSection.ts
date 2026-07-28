import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type VNodeChild,
} from "vue";
import { ChevronDown } from "lucide-vue-next";
import { classNames } from "./classNames.js";
import { PANEL_STACK_KEY } from "./PanelStack.js";

export type PanelSectionProps = {
  id: string;
  label: string;
  class?: string;
};

/**
 * One collapsible region inside a {@link PanelStack}. Registers itself with
 * the parent stack (via provide/inject) on mount, in DOM order, so the stack
 * can resolve its scroll-owner fallbacks. A PanelSection outside a PanelStack
 * (no injected context) falls back to a fully expanded, scroll-owning,
 * non-primary section so it still renders sanely in isolation — but the
 * component is designed to always live inside a stack.
 *
 * Content (default slot) is mounted once and only ever hidden/resized via
 * CSS classes on collapse — never removed from the DOM — so a chat session,
 * map or other stateful widget survives collapse/expand without remounting.
 * Slots: default (content), actions (header-trailing controls).
 */
export const PanelSection = defineComponent({
  name: "PanelSection",
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const stack = inject(PANEL_STACK_KEY, undefined);
    const rootEl = ref<HTMLElement | null>(null);
    const headerEl = ref<HTMLElement | null>(null);

    // Register with the parent stack (mount order) so it can fall back to
    // "the first section" whenever nothing else designates a scroll owner
    // (unset or stale `expanded`/`primary`) — see PanelStack.ts's `register`.
    // Same register-in-onMounted / return-the-unregister-callback idiom as
    // SelectableRow.
    let unregister: (() => void) | null = null;
    function doRegister() {
      unregister?.();
      unregister = null;
      if (stack && rootEl.value && headerEl.value) {
        unregister = stack.register(props.id, rootEl.value, headerEl.value);
      }
    }
    onMounted(() => doRegister());
    // Re-register under the new id if it ever changes while mounted.
    watch(() => props.id, () => doRegister());
    onBeforeUnmount(() => {
      unregister?.();
      unregister = null;
    });

    function onTriggerClick() {
      stack?.toggle(props.id);
    }

    return () => {
      const triggerId = `st-panelSection-trigger-${props.id}`;
      const regionId = `st-panelSection-region-${props.id}`;

      const isPrimary = stack?.isPrimary(props.id) ?? false;
      const expanded = stack?.isExpanded(props.id) ?? true;
      const scrollOwner = stack?.isScrollOwner(props.id) ?? true;

      const rootClasses = classNames(
        "st-panelSection",
        scrollOwner && "st-panelSection--scrollOwner",
        props.class,
      );
      const bodyClasses = classNames(
        "st-panelSection__body",
        scrollOwner
          ? "st-panelSection__body--scrollOwner"
          : !expanded
            ? "st-panelSection__body--collapsed"
            : null,
      );

      const headingChild: VNodeChild = isPrimary
        ? h(
            "span",
            { class: "st-panelSection__title st-panelSection__title--primary", id: triggerId },
            props.label,
          )
        : h(
            "button",
            {
              type: "button",
              class: "st-panelSection__trigger",
              "aria-expanded": expanded ? "true" : "false",
              "aria-controls": regionId,
              id: triggerId,
              onClick: onTriggerClick,
            },
            [
              h("span", { class: "st-panelSection__title" }, props.label),
              h(
                "span",
                {
                  class: classNames("st-panelSection__icon", expanded && "st-panelSection__icon--expanded"),
                  "aria-hidden": "true",
                },
                [h(ChevronDown, { size: 18, strokeWidth: 2.25, "aria-hidden": "true" })],
              ),
            ],
          );

      return h(
        "div",
        {
          ...attrs,
          class: rootClasses,
          "data-panel-section-id": props.id,
          ref: rootEl,
        },
        [
          h("div", { class: "st-panelSection__header", ref: headerEl }, [
            h("h3", { class: "st-panelSection__heading" }, [headingChild]),
            slots.actions ? h("div", { class: "st-panelSection__actions" }, slots.actions()) : null,
          ]),
          // Mounted once, always — collapsing is purely a class/CSS concern
          // (sizing + hiding this region), never a conditional block.
          h(
            "div",
            {
              class: bodyClasses,
              role: "region",
              id: regionId,
              "aria-labelledby": triggerId,
            },
            slots.default?.(),
          ),
        ],
      );
    };
  },
});
