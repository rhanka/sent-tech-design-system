<script setup lang="ts">
import { ref, watch } from 'vue';
import { classNames } from './classNames.js';

export type DisplayFontScale = 'normal' | 'large' | 'extra-large';
export type DisplayContrast = 'default' | 'high';
export type DisplayLineSpacing = 'normal' | 'comfortable';

export interface DisplaySettingsState {
  fontScale: DisplayFontScale;
  contrast: DisplayContrast;
  lineSpacing: DisplayLineSpacing;
  reducedMotion: boolean;
}

export type DisplaySettingsProps = {
  title?: string;
  values?: Partial<DisplaySettingsState>;
  showFontScale?: boolean;
  showContrast?: boolean;
  showLineSpacing?: boolean;
  showReducedMotion?: boolean;
  class?: string;
};

const DEFAULT_SETTINGS: DisplaySettingsState = {
  fontScale: 'normal',
  contrast: 'default',
  lineSpacing: 'normal',
  reducedMotion: false,
};

defineOptions({ name: 'DisplaySettings', inheritAttrs: false });
const props = withDefaults(defineProps<DisplaySettingsProps>(), {
  title: 'Paramètres d’affichage',
  values: undefined,
  showFontScale: true,
  showContrast: true,
  showLineSpacing: true,
  showReducedMotion: true,
  class: undefined,
});
const emit = defineEmits<{ change: [value: DisplaySettingsState] }>();

const resolve = (): DisplaySettingsState => ({
  fontScale: props.values?.fontScale ?? DEFAULT_SETTINGS.fontScale,
  contrast: props.values?.contrast ?? DEFAULT_SETTINGS.contrast,
  lineSpacing: props.values?.lineSpacing ?? DEFAULT_SETTINGS.lineSpacing,
  reducedMotion: props.values?.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion,
});

const state = ref<DisplaySettingsState>(resolve());

watch(
  () => props.values,
  () => {
    state.value = { ...state.value, ...resolve() };
  },
  { deep: true },
);

const update = (next: Partial<DisplaySettingsState>) => {
  state.value = { ...state.value, ...next };
  emit('change', { ...state.value });
};

const onFontScaleChange = (event: Event) =>
  update({ fontScale: (event.target as HTMLSelectElement).value as DisplayFontScale });
const onContrastChange = (event: Event) =>
  update({ contrast: (event.target as HTMLSelectElement).value as DisplayContrast });
const onLineSpacingChange = (event: Event) =>
  update({ lineSpacing: (event.target as HTMLSelectElement).value as DisplayLineSpacing });
const onReducedMotionChange = (event: Event) =>
  update({ reducedMotion: (event.target as HTMLInputElement).checked });
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-displaySettings', props.class)">
    <p class="st-displaySettings__title">{{ props.title }}</p>
    <div class="st-displaySettings__grid">
      <label v-if="props.showFontScale" class="st-displaySettings__field">
        <span class="st-displaySettings__label">Taille de texte</span>
        <select :value="state.fontScale" @change="onFontScaleChange">
          <option value="normal">Normale</option>
          <option value="large">Grande</option>
          <option value="extra-large">Très grande</option>
        </select>
      </label>
      <label v-if="props.showContrast" class="st-displaySettings__field">
        <span class="st-displaySettings__label">Contraste</span>
        <select :value="state.contrast" @change="onContrastChange">
          <option value="default">Standard</option>
          <option value="high">Élevé</option>
        </select>
      </label>
      <label v-if="props.showLineSpacing" class="st-displaySettings__field">
        <span class="st-displaySettings__label">Interligne</span>
        <select :value="state.lineSpacing" @change="onLineSpacingChange">
          <option value="normal">Normal</option>
          <option value="comfortable">Confortable</option>
        </select>
      </label>
      <label v-if="props.showReducedMotion" class="st-displaySettings__field st-displaySettings__field--switch">
        <span class="st-displaySettings__label">Animations (réduction)</span>
        <input type="checkbox" role="switch" :checked="state.reducedMotion" @change="onReducedMotionChange" />
      </label>
    </div>
  </div>
</template>
