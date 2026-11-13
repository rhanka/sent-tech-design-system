<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import { classNames } from './classNames.js';
import { SELECTABLE_LIST_KEY } from './selectable-list-context.js';



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
  /** Native link target. When set on a standalone row, the row renders as an anchor. */
  href?: string;
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
export type { SelectableListContext } from './selectable-list-context.js';
defineOptions({ name: 'SelectableRow', inheritAttrs: false });
const props = withDefaults(defineProps<SelectableRowProps>(), { selected: false, onSelect: undefined, disabled: false, value: undefined, href: undefined, role: "option", accentBar: false, class: undefined });
defineSlots<{ default?: () => unknown; leading?: () => unknown; trailing?: () => unknown; caption?: () => unknown }>();
const emit = defineEmits<{ select: [selected: boolean] }>();

    // When rendered inside a SelectableList, the list (via inject) owns
    // selection and the roving tabindex. Standalone rows manage their own state.
    const list = inject(SELECTABLE_LIST_KEY, undefined);

    const el = ref<HTMLElement | null>(null);


    // Register with the parent list (if any) so it can order rows for arrow nav
    // and compute the roving tab stop. Disabled rows are registered too so the
    // list can skip them during navigation; the list owns the skip logic.
    let unregister: (() => void) | null = null;

    function doRegister() {
      unregister?.();
      unregister = null;
      if (list && el.value) {
        unregister = list.register(el.value, props.value, props.disabled);
      }
    }

    onMounted(() => doRegister());

    watch(
      () => [props.value, props.disabled] as const,
      ([, newDisabled], [, oldDisabled]) => {
        // A11y: quand cette row passe à disabled=true ET qu'elle détient le focus DOM,
        // transférer le focus vers la prochaine row enabled via navigate().
        if (newDisabled && !oldDisabled && list && el.value) {
          if (el.value.contains(document.activeElement ?? null)) {
            list.navigate(el.value, "ArrowDown");
          }
        }
        doRegister();
      },
    );

    onBeforeUnmount(() => {
      unregister?.();
      unregister = null;
    });


    function activate(e?: MouseEvent) {
      if (props.disabled) {
        e?.preventDefault();
        e?.stopPropagation();
        return;
      }
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
      if (props.href && !list) return;
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
const state = computed(() => {
  if (list) void list.version.value;
  const node = el.value;
  return { selected: list && node ? list.isSelected(node) : props.selected,
    role: list ? list.itemRole : props.href ? undefined : props.role,
    tabindex: props.disabled ? -1 : list && node ? list.isTabStop(node) ? 0 : -1 : 0 };
});
</script>

<template>
  <component :is="props.href ? 'a' : 'div'" v-bind="$attrs" ref="el" :href="props.href && !props.disabled ? props.href : undefined" :class="classNames('st-selectableRow', state.selected && 'st-selectableRow--selected', props.disabled && 'st-selectableRow--disabled', props.accentBar && 'st-selectableRow--accentBar', $slots.caption && 'st-selectableRow--hasCaption', props.class)" :role="state.role" :aria-selected="state.role === 'option' ? (state.selected ? 'true' : 'false') : undefined" :aria-pressed="state.role === 'button' ? (state.selected ? 'true' : 'false') : undefined" :aria-disabled="props.disabled ? 'true' : undefined" :data-value="props.value" :tabindex="state.tabindex" @click="activate" @keydown="handleKeydown" @focus="handleFocus">
    <span v-if="$slots.leading" class="st-selectableRow__leading"><slot name="leading" /></span>
    <span v-if="$slots.caption" class="st-selectableRow__content st-selectableRow__content--stacked"><span class="st-selectableRow__label"><slot /></span><span class="st-selectableRow__caption"><slot name="caption" /></span></span><span v-else class="st-selectableRow__content"><slot /></span>
    <span v-if="$slots.trailing" class="st-selectableRow__trailing"><slot name="trailing" /></span>
  </component>
</template>
