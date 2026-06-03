import { defineComponent, h, ref, watch } from "vue";
import { classNames } from "./classNames.js";

export type DisplayFontScale = "normal" | "large" | "extra-large";
export type DisplayContrast = "default" | "high";
export type DisplayLineSpacing = "normal" | "comfortable";

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
  fontScale: "normal",
  contrast: "default",
  lineSpacing: "normal",
  reducedMotion: false,
};

export const DisplaySettings = defineComponent({
  name: "DisplaySettings",
  props: {
    title: { type: String, default: "Paramètres d’affichage" },
    values: { type: Object as () => Partial<DisplaySettingsState>, default: undefined },
    showFontScale: { type: Boolean, default: true },
    showContrast: { type: Boolean, default: true },
    showLineSpacing: { type: Boolean, default: true },
    showReducedMotion: { type: Boolean, default: true },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { emit, attrs }) {
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
      emit("change", { ...state.value });
    };

    return () =>
      h("div", { ...attrs, class: classNames("st-displaySettings", props.class) }, [
        h("p", { class: "st-displaySettings__title" }, props.title),
        h("div", { class: "st-displaySettings__grid" }, [
          props.showFontScale
            ? h("label", { class: "st-displaySettings__field" }, [
                h("span", { class: "st-displaySettings__label" }, "Taille de texte"),
                h(
                  "select",
                  {
                    value: state.value.fontScale,
                    onChange: (event: Event) =>
                      update({ fontScale: (event.target as HTMLSelectElement).value as DisplayFontScale }),
                  },
                  [
                    h("option", { value: "normal" }, "Normale"),
                    h("option", { value: "large" }, "Grande"),
                    h("option", { value: "extra-large" }, "Très grande"),
                  ],
                ),
              ])
            : null,
          props.showContrast
            ? h("label", { class: "st-displaySettings__field" }, [
                h("span", { class: "st-displaySettings__label" }, "Contraste"),
                h(
                  "select",
                  {
                    value: state.value.contrast,
                    onChange: (event: Event) =>
                      update({ contrast: (event.target as HTMLSelectElement).value as DisplayContrast }),
                  },
                  [
                    h("option", { value: "default" }, "Standard"),
                    h("option", { value: "high" }, "Élevé"),
                  ],
                ),
              ])
            : null,
          props.showLineSpacing
            ? h("label", { class: "st-displaySettings__field" }, [
                h("span", { class: "st-displaySettings__label" }, "Interligne"),
                h(
                  "select",
                  {
                    value: state.value.lineSpacing,
                    onChange: (event: Event) =>
                      update({ lineSpacing: (event.target as HTMLSelectElement).value as DisplayLineSpacing }),
                  },
                  [
                    h("option", { value: "normal" }, "Normal"),
                    h("option", { value: "comfortable" }, "Confortable"),
                  ],
                ),
              ])
            : null,
          props.showReducedMotion
            ? h("label", { class: "st-displaySettings__field st-displaySettings__field--switch" }, [
                h("span", { class: "st-displaySettings__label" }, "Animations (réduction)"),
                h("input", {
                  type: "checkbox",
                  role: "switch",
                  checked: state.value.reducedMotion,
                  onChange: (event: Event) =>
                    update({ reducedMotion: (event.target as HTMLInputElement).checked }),
                }),
              ])
            : null,
        ]),
      ]);
  },
});
