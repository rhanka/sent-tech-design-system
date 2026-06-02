import { computed, defineComponent, h, onBeforeUnmount, watchEffect } from "vue";
import { compileTheme, sentTechTheme, type TenantTheme } from "@sentropic/design-system-themes";

export type ThemeProviderProps = {
  theme?: TenantTheme;
  namespace?: string;
};

export const ThemeProvider = defineComponent({
  name: "ThemeProvider",
  props: {
    theme: {
      type: Object as () => TenantTheme,
      default: () => sentTechTheme,
    },
    namespace: {
      type: String,
      default: "st",
    },
  },
  setup(props, { slots }) {
    const css = computed(() =>
      compileTheme(props.theme, {
        selector: `[data-st-theme="${props.theme.id}"]`,
        namespace: props.namespace,
      }),
    );

    let styleEl: HTMLStyleElement | null = null;

    watchEffect(() => {
      const theme = props.theme;
      const selector = `style[data-st-theme-provider="${theme.id}"]`;
      const existing = document.head.querySelector<HTMLStyleElement>(selector);
      if (!existing) {
        styleEl = document.createElement("style");
        styleEl.dataset.stThemeProvider = theme.id;
        document.head.appendChild(styleEl);
      } else {
        styleEl = existing;
      }
      styleEl.textContent = css.value;
    });

    onBeforeUnmount(() => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    });

    return () =>
      h("div", { "data-st-theme": props.theme.id }, slots.default?.());
  },
});
