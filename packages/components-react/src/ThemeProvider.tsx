import React from "react";
import { compileTheme, sentTechTheme, type TenantTheme } from "@sentropic/design-system-themes";

export type ThemeProviderProps = {
  theme?: TenantTheme;
  namespace?: string;
  children?: React.ReactNode;
};

export function ThemeProvider({ theme = sentTechTheme, namespace = "st", children }: ThemeProviderProps) {
  const css = React.useMemo(
    () => compileTheme(theme, { selector: `[data-st-theme="${theme.id}"]`, namespace }),
    [namespace, theme],
  );

  React.useInsertionEffect(() => {
    const selector = `style[data-st-theme-provider="${theme.id}"]`;
    const existing = document.head.querySelector<HTMLStyleElement>(selector);
    const style = existing ?? document.createElement("style");
    style.dataset.stThemeProvider = theme.id;
    style.textContent = css;

    if (!existing) {
      document.head.appendChild(style);
    }

    return () => {
      if (!existing && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [css, theme.id]);

  return <div data-st-theme={theme.id}>{children}</div>;
}
