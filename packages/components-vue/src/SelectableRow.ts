import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type InjectionKey,
  type PropType,
  type VNode,
} from "vue";
import { classNames } from "./classNames.js";

/**
 * Shared context contract between {@link SelectableList} and its slotted
 * {@link SelectableRow} children. The list owns selection + the roving tabindex
 * and exposes the getters/callbacks the rows read to derive their own `role` /
 * `tabindex` / `aria-selected`. When a row is used STANDALONE (no provider)
 * `inject` returns undefined and the row falls back to its own state.
 */
export type SelectableListContext = {
  /** Reactive bump incremented on every selection / focus / registry change. */
  version: { value: number };
  /** True when the list manages selection/roving for its rows. */
  readonly managed: true;
  /** listbox role for the wrapper → rows are "option". */
  readonly itemRole: "option";
  /** Register a row element; returns an unregister callback. */
  register: (el: HTMLElement, value: string | undefined) => () => void;
  /** Is the row with this element currently selected? */
  isSelected: (el: HTMLElement) => boolean;
  /** Should the row with this element be the roving-tabindex stop (tabindex 0)? */
  isTabStop: (el: HTMLElement) => boolean;
  /** Row was activated (click / Space / Enter). The list toggles selection. */
  activate: (el: HTMLElement) => void;
  /** Row received focus → becomes the roving tab stop. */
  focusRow: (el: HTMLElement) => void;
  /** Arrow / Home / End navigation from a row. */
  navigate: (el: HTMLElement, key: string) => void;
};

export const SELECTABLE_LIST_KEY: InjectionKey<SelectableListContext> = Symbol(
  "st-selectable-list",
);

export type SelectableRowProps = {
  /**
   * Selected state. Honoured when the row is used STANDALONE; inside a
   * {@link SelectableList} the list is the source of truth, so this prop is
   * ignored for managed rows.
   */
  selected?: boolean;
  /** Notified on every toggle with the new selected state (standalone rows). */
  onSelect?: (selected: boolean) => void;
  /** Non-interactive when true. */
  disabled?: boolean;
  /** Stable value, surfaced as `data-value` and used by the list for `value`. */
  value?: string;
  /**
   * ARIA role for the standalone row. Defaults to "option" so a lone row still
   * reads as a selectable item. Inside a list the role is forced to "option".
   */
  role?: string;
  /**
   * Opt-in left accent bar on the selected state. Off by default so the
   * selected item is a calm tinted surface + accented text (two signals only).
   */
  accentBar?: boolean;
  class?: string;
};

/**
 * Compact, full-width selectable list/rail row. By DEFAULT the selected state
 * is two calm signals — a tinted surface + accented text — deliberately NOT the
 * off-theme "boudin box" it replaces, and NOT a reflow-causing font-weight
 * bump. The fine left accent bar is OPT-IN via the `accentBar` prop. Focus is an
 * EXTERNAL offset outline. role="option" + aria-selected, keyboard-activatable
 * (Enter / Space), inert when disabled. Inside a {@link SelectableList} the list
 * (via provide/inject) owns selection and the roving tabindex.
 * Slots: default (content), leading (icon / avatar), trailing (meta / icon).
 */
export const SelectableRow = defineComponent({
  name: "SelectableRow",
  props: {
    selected: { type: Boolean, default: false },
    onSelect: {
      type: Function as PropType<(selected: boolean) => void>,
      default: undefined,
    },
    disabled: { type: Boolean, default: false },
    value: { type: String, default: undefined },
    role: { type: String, default: "option" },
    accentBar: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: {
    select: (_selected: boolean) => true,
  },
  setup(props, { slots, attrs, emit }) {
    // When rendered inside a SelectableList, the list (via inject) owns
    // selection and the roving tabindex. Standalone rows manage their own state.
    const list = inject(SELECTABLE_LIST_KEY, undefined);
    const el = ref<HTMLElement | null>(null);

    // Register with the parent list (if any) so it can order rows for arrow nav
    // and compute the roving tab stop. Registered on mount (when `el` is set) and
    // re-registered when value / disabled change.
    let unregister: (() => void) | null = null;
    function doRegister() {
      unregister?.();
      unregister = null;
      if (list && el.value && !props.disabled) {
        unregister = list.register(el.value, props.value);
      }
    }
    onMounted(() => doRegister());
    watch(
      () => [props.value, props.disabled] as const,
      () => doRegister(),
    );
    onBeforeUnmount(() => {
      unregister?.();
      unregister = null;
    });

    function activate() {
      if (props.disabled) return;
      if (list && el.value) {
        list.activate(el.value);
        return;
      }
      const next = !props.selected;
      // `emit("select")` invokes the `onSelect` prop/listener exactly once.
      emit("select", next);
    }

    function handleKeydown(e: KeyboardEvent) {
      if (props.disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
        return;
      }
      // Roving navigation is owned by the list; forward the relevant keys.
      if (
        list &&
        el.value &&
        (e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "Home" ||
          e.key === "End")
      ) {
        e.preventDefault();
        list.navigate(el.value, e.key);
      }
    }

    function handleFocus() {
      if (props.disabled) return;
      if (list && el.value) list.focusRow(el.value);
    }

    return () => {
      // Read the list's reactive version so this row re-renders when the list's
      // selection / focus / registry changes (managed rows).
      if (list) void list.version.value;

      const node = el.value;
      const isSelected = list && node ? list.isSelected(node) : props.selected;
      const effectiveRole = list ? list.itemRole : props.role;
      const tabindex = props.disabled
        ? -1
        : list && node
          ? list.isTabStop(node)
            ? 0
            : -1
          : 0;

      const children: VNode[] = [];
      if (slots.leading) {
        children.push(h("span", { class: "st-selectableRow__leading" }, slots.leading()));
      }
      children.push(h("span", { class: "st-selectableRow__content" }, slots.default?.()));
      if (slots.trailing) {
        children.push(h("span", { class: "st-selectableRow__trailing" }, slots.trailing()));
      }

      return h(
        "div",
        {
          ...attrs,
          ref: el,
          class: classNames(
            "st-selectableRow",
            isSelected && "st-selectableRow--selected",
            props.disabled && "st-selectableRow--disabled",
            props.accentBar && "st-selectableRow--accentBar",
            props.class,
          ),
          role: effectiveRole,
          "aria-selected":
            effectiveRole === "option" ? (isSelected ? "true" : "false") : undefined,
          "aria-disabled": props.disabled ? "true" : undefined,
          "data-value": props.value,
          tabindex,
          onClick: activate,
          onKeydown: handleKeydown,
          onFocus: handleFocus,
        },
        children,
      );
    };
  },
});
