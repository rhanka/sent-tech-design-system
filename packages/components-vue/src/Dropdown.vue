<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, computed } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';
import Icon from './Icon.vue';


export type DropdownOption = {
  value: string;

  /** @slot option-label */
  label?: unknown;
  disabled?: boolean;
};


// In addition to the Vue-native `@select` emit, an `onSelect` callback prop
// (React/Svelte parity) is accepted; both fire on selection.
export type DropdownProps = {
  label?: string;
  options: DropdownOption[];
  value?: string;
  open?: boolean;
  locale?: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
  class?: string;
};
defineOptions({ name: 'Dropdown', inheritAttrs: false });
const props = withDefaults(defineProps<DropdownProps>(), { label: undefined, value: undefined, open: undefined, locale: "fr-FR", placeholder: undefined, onSelect: undefined, class: undefined });
defineSlots<{ 'option-label'?: (scope: { option: DropdownOption; index: number }) => unknown }>();
const emit = defineEmits<{ select: [value: string]; 'update:open': [open: boolean] }>();

    const localOpen = ref(false);

    const localValue = ref(props.value ?? "");

    const hostRef = ref<HTMLElement | null>(null);

    const buttonRef = ref<HTMLButtonElement | null>(null);

    const listRef = ref<HTMLElement | null>(null);

    const listPos = ref({ top: 0, left: 0, width: 0 });


    const isOpen = () => props.open !== undefined ? props.open : localOpen.value;

    const selected = () => props.options.find((opt) => opt.value === (props.value ?? localValue.value));


    const updateListPos = () => {
      const rect = buttonRef.value?.getBoundingClientRect();
      if (!rect) return;
      listPos.value = { top: rect.bottom + 4, left: rect.left, width: rect.width };
    };


    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
      if (val) nextTick(updateListPos);
    };


    const selectOption = (option: DropdownOption) => {
      if (option.disabled) return;
      localValue.value = option.value;
      setOpen(false);
      // `emit("select")` already routes to an `onSelect` handler prop (Vue maps
      // emitted events to their `onX` listeners), so calling `props.onSelect`
      // here as well would fire the callback twice. Emit only.
      emit("select", option.value);
    };


    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && !hostRef.value?.contains(target) && !listRef.value?.contains(target)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (hostRef.value && !hostRef.value.isConnected) return;
      if (event.key === "Escape" && isOpen()) {
        event.preventDefault();
        setOpen(false);
      }
    };

    const onScroll = () => { if (isOpen()) updateListPos(); };


    watch(
      () => isOpen(),
      (open) => {
        if (open) {
          nextTick(updateListPos);
          document.addEventListener("mousedown", onMouseDown);
          window.addEventListener("keydown", onKeyDown);
          window.addEventListener("scroll", onScroll, true);
          window.addEventListener("resize", onScroll);
        } else {
          document.removeEventListener("mousedown", onMouseDown);
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("scroll", onScroll, true);
          window.removeEventListener("resize", onScroll);
        }
      },
      { immediate: true },
    );


    onUnmounted(() => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    });
const isFr = computed(() => (props.locale ?? 'fr-FR').toLowerCase().startsWith('fr'));
const resolvedLabel = computed(() => props.label ?? (isFr.value ? 'Sélectionner' : 'Select'));
const resolvedPlaceholder = computed(() => props.placeholder ?? (isFr.value ? 'Sélectionner' : 'Select'));
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-dropdown', props.class)) }" ref="hostRef" >
    <button ref="buttonRef" type="button" class="st-dropdown__button" aria-haspopup="listbox" :aria-expanded="isOpen()" @click="setOpen(!isOpen())"><span class="st-dropdown__label">{{ resolvedLabel }}</span>{{ ': ' }}<span class="st-dropdown__value"><template v-if="selected()"><slot v-if="$slots['option-label']" name="option-label" :option="selected()!" :index="props.options.indexOf(selected()!)" /><template v-else>{{ scalarContent(selected()!.label) }}</template></template><template v-else>{{ resolvedPlaceholder }}</template></span><Icon name="chevron-down" bare :size="18" :stroke-width="2.25" :class="classNames('st-dropdown__icon', isOpen() && 'st-dropdown__icon--open')" aria-hidden="true" /></button>
    <Teleport v-if="isOpen()" to="body"><div ref="listRef" class="st-dropdown__list" role="listbox" :aria-label="resolvedLabel" :style="{ top: `${listPos.top}px`, left: `${listPos.left}px`, minWidth: `${listPos.width}px` }">
      <button v-for="(option, index) in props.options" :key="option.value" type="button" role="option" class="st-dropdown__option" :disabled="option.disabled" :aria-disabled="option.disabled ? 'true' : undefined" :aria-selected="option.value === (props.value ?? localValue)" @click="selectOption(option)"><slot v-if="$slots['option-label']" name="option-label" :option="option" :index="index" /><template v-else>{{ scalarContent(option.label) }}</template></button>
    </div></Teleport>
  </div>
</template>
