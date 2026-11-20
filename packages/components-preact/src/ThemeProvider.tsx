import { compileTheme, sentTechTheme, type TenantTheme } from "@sentropic/design-system-themes";
import { useMemo } from "preact/hooks";
import { useInsertionEffect } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ThemeProviderProps = {
  theme?: MaybeSignal<TenantTheme>;
  namespace?: MaybeSignal<string>;
  children?: ComponentChildren;
};

export function ThemeProvider({ theme = sentTechTheme, namespace = "st", children }: ThemeProviderProps) {
  const themeValue = useValue(theme);
  const namespaceValue = useValue(namespace);
  const css = useMemo(
    () => compileTheme(themeValue, { selector: `[data-st-theme="${themeValue.id}"]`, namespace: namespaceValue }),
    [namespaceValue, themeValue],
  );

  useInsertionEffect(() => {
    const selector = `style[data-st-theme-provider="${themeValue.id}"]`;
    const existing = document.head.querySelector<HTMLStyleElement>(selector);
    const style = existing ?? document.createElement("style");
    style.dataset.stThemeProvider = themeValue.id;
    style.textContent = css;

    if (!existing) {
      document.head.appendChild(style);
    }

    return () => {
      if (!existing && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [css, themeValue.id]);

  return <div data-st-theme={themeValue.id}>{children}</div>;
}
