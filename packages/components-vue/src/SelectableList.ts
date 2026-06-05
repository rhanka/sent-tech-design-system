import {
  computed,
  defineComponent,
  h,
  provide,
  ref,
  type PropType,
} from "vue";
import { classNames } from "./classNames.js";
import {
  SELECTABLE_LIST_KEY,
  type SelectableListContext,
} from "./SelectableRow.js";

export type SelectableListProps = {
  /** Accessible name for the listbox (required for SR users). */
  label?: string;
  /** References the id of an external visible label (alternative to `label`). */
  labelledby?: string;
  /**
   * Allow more than one selected row. Adds aria-multiselectable and toggles
   * each row independently. Defaults to false (single-select).
   */
  multiple?: boolean;
  /**
   * Selected value(s). Controlled when provided. For single-select pass a
   * string (or null); for multiple pass a string[]. When omitted the list is
   * uncontrolled and keeps its own internal selection.
   */
  value?: string | string[] | null;
  /**
   * Fired with the new selection on every change. Receives a string|null for
   * single-select and a string[] for multiple. Required for the controlled
   * pattern; also fires for uncontrolled lists.
   */
  onChange?: (value: string | string[] | null) => void;
  class?: string;
};

type Entry = { el: HTMLElement; value: string | undefined };

function toSet(v: string | string[] | null | undefined): Set<string> {
  if (v == null) return new Set();
  return new Set(Array.isArray(v) ? v : [v]);
}

function sortByDom(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    const pos = a.el.compareDocumentPosition(b.el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

/**
 * Accessible listbox that owns selection + a roving tabindex for its
 * {@link SelectableRow} children. Arrow / Home / End move focus (roving),
 * Space / Enter / click toggle the focused row. Single-select by default;
 * `multiple` toggles rows independently. Controlled via `value`/`onChange`,
 * otherwise it keeps its own internal selection. Pilots each child row through
 * provide/inject (role="option" + the computed tabindex / aria-selected).
 */
export const SelectableList = defineComponent({
  name: "SelectableList",
  props: {
    label: { type: String, default: undefined },
    labelledby: { type: String, default: undefined },
    multiple: { type: Boolean, default: false },
    value: {
      // Vue skips type validation for null/undefined values, so [String, Array]
      // accepts a string, a string[], or null/undefined (uncontrolled).
      type: [String, Array] as PropType<string | string[] | null>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<(value: string | string[] | null) => void>,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  emits: {
    change: (_value: string | string[] | null) => true,
  },
  setup(props, { slots, attrs, emit }) {
    // Controlled when the consumer passes `value` (including null).
    const controlled = computed(() => props.value !== undefined);

    // Internal selection for the uncontrolled case.
    const internal = ref<Set<string>>(new Set());
    const selectedValues = computed(() =>
      controlled.value ? toSet(props.value) : internal.value,
    );

    // Row registry, ordered by DOM position so arrow nav matches the visual
    // order regardless of registration timing.
    const entries = ref<Entry[]>([]);
    // The element holding the roving tab stop (tabindex 0). Null until a row is
    // focused; until then the FIRST registered row is the default stop.
    const tabStopEl = ref<HTMLElement | null>(null);

    // Bumped on every selection / focus / registry change so child rows (which
    // read `version`) re-render and recompute role / tabindex / aria-selected.
    const version = ref(0);
    function bump() {
      version.value++;
    }

    function register(el: HTMLElement, rowValue: string | undefined): () => void {
      entries.value = sortByDom([
        ...entries.value.filter((e) => e.el !== el),
        { el, value: rowValue },
      ]);
      bump();
      return () => {
        entries.value = entries.value.filter((e) => e.el !== el);
        if (tabStopEl.value === el) tabStopEl.value = null;
        bump();
      };
    }

    // Default roving stop = first registered (DOM-ordered) row when none focused.
    const effectiveTabStop = computed(
      () => tabStopEl.value ?? entries.value[0]?.el ?? null,
    );

    function valueOf(el: HTMLElement): string | undefined {
      return entries.value.find((e) => e.el === el)?.value;
    }

    function isSelected(el: HTMLElement): boolean {
      const v = valueOf(el);
      return v !== undefined && selectedValues.value.has(v);
    }

    function isTabStop(el: HTMLElement): boolean {
      return el === effectiveTabStop.value;
    }

    function fireChange(value: string | string[] | null) {
      // `emit("change")` invokes the `onChange` prop/listener exactly once.
      emit("change", value);
    }

    function emitNext(next: Set<string>) {
      if (!controlled.value) internal.value = next;
      if (props.multiple) fireChange([...next]);
      else fireChange(next.size ? [...next][0] : null);
      bump();
    }

    function activate(el: HTMLElement) {
      const v = valueOf(el);
      if (v === undefined) return;
      const current = selectedValues.value;
      let next: Set<string>;
      if (props.multiple) {
        next = new Set(current);
        if (next.has(v)) next.delete(v);
        else next.add(v);
      } else {
        // Single-select toggles off when re-activating the selected row.
        next = current.has(v) && current.size === 1 ? new Set() : new Set([v]);
      }
      emitNext(next);
    }

    function focusRow(el: HTMLElement) {
      tabStopEl.value = el;
      bump();
    }

    function navigate(el: HTMLElement, key: string) {
      const list = entries.value;
      if (list.length === 0) return;
      const idx = list.findIndex((e) => e.el === el);
      if (idx === -1) return;
      let targetIdx = idx;
      if (key === "ArrowDown" || key === "ArrowRight") targetIdx = idx + 1;
      else if (key === "ArrowUp" || key === "ArrowLeft") targetIdx = idx - 1;
      else if (key === "Home") targetIdx = 0;
      else if (key === "End") targetIdx = list.length - 1;
      // Clamp (no wrap) so Home/End and arrows stay within bounds.
      targetIdx = Math.max(0, Math.min(list.length - 1, targetIdx));
      const target = list[targetIdx]?.el;
      if (target) {
        tabStopEl.value = target;
        target.focus();
        bump();
      }
    }

    const context: SelectableListContext = {
      version,
      managed: true,
      itemRole: "option",
      register,
      isSelected,
      isTabStop,
      activate,
      focusRow,
      navigate,
    };
    provide(SELECTABLE_LIST_KEY, context);

    return () =>
      h(
        "div",
        {
          ...attrs,
          class: classNames("st-selectableList", props.class),
          role: "listbox",
          "aria-label": props.labelledby ? undefined : props.label,
          "aria-labelledby": props.labelledby,
          "aria-multiselectable": props.multiple ? "true" : undefined,
        },
        slots.default?.(),
      );
  },
});
