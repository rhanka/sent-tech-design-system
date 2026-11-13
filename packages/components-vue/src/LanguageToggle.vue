<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { classNames } from './classNames.js';

export type LanguageToggleLocale = 'fr' | 'en';

export type LanguageToggleProps = {
  locale?: LanguageToggleLocale;
  frLabel?: string;
  enLabel?: string;
  /** Libellé du sélecteur (associé via <label for> + aria-label). */
  label?: string;
  /** Id du <select> ; auto-généré et stable si non fourni. */
  selectId?: string;
  variant?: 'select' | 'accordion';
  accordionLabel?: string;
  class?: string;
};

defineOptions({ name: 'LanguageToggle', inheritAttrs: false });
const props = withDefaults(defineProps<LanguageToggleProps>(), {
  locale: 'fr', frLabel: 'FR', enLabel: 'EN', label: 'Langue', selectId: undefined,
  variant: 'select', accordionLabel: 'Langue', class: undefined,
});
const emit = defineEmits<{ localeChange: [locale: LanguageToggleLocale] }>();

const open = ref(false);
const uid = useId();
const resolvedSelectId = computed(() => props.selectId ?? `st-languageToggle-${uid}`);
const choose = (next: LanguageToggleLocale) => emit('localeChange', next);
function onChange(event: Event) {
  choose((event.target as HTMLSelectElement).value as LanguageToggleLocale);
}
</script>

<template>
  <div v-if="props.variant === 'accordion'" v-bind="$attrs" :class="classNames('st-languageToggle', props.class)">
    <button type="button" class="st-languageToggle__accordionTrigger" :aria-expanded="open ? 'true' : 'false'" @click="open = !open">
      <span>{{ props.accordionLabel }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="`lucide ${classNames('st-languageToggle__chevron', open && 'st-languageToggle__chevron--open')} lucide-chevron-down-icon lucide-chevron-down`"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <div v-if="open" class="st-languageToggle__accordionPanel">
      <button type="button" :class="classNames('st-languageToggle__option', props.locale === 'fr' && 'st-languageToggle__option--active')" :aria-current="props.locale === 'fr' ? 'true' : 'false'" @click="choose('fr')">{{ props.frLabel }}</button>
      <button type="button" :class="classNames('st-languageToggle__option', props.locale === 'en' && 'st-languageToggle__option--active')" :aria-current="props.locale === 'en' ? 'true' : 'false'" @click="choose('en')">{{ props.enLabel }}</button>
    </div>
  </div>
  <template v-else>
    <label class="st-visually-hidden st-languageToggle__srLabel" :for="resolvedSelectId">{{ props.label }}</label>
    <select v-bind="$attrs" :id="resolvedSelectId" :class="classNames('st-languageToggle__select', props.class)" :value="props.locale" :aria-label="props.label" @change="onChange">
      <option value="fr">{{ props.frLabel }}</option>
      <option value="en">{{ props.enLabel }}</option>
    </select>
  </template>
</template>
