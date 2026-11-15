// The neutral default theme (sent-tech) as CSS custom properties, compiled from
// the published tokens. Shared by the build and by the contrast test.
import { compileTheme, sentTechTheme } from "@sentropic/design-system-themes";

const declarations = (tokens: unknown): Map<string, string> => {
  const block = compileTheme({ ...sentTechTheme, tokens }, { selector: ":root" });
  return new Map([...block.matchAll(/^\s*(--[\w-]+):\s*(.+);\s*$/gm)].map((match) => [match[1]!, match[2]!]));
};

export function themeDeclarations(): { light: Map<string, string>; dark: Map<string, string> } {
  if (sentTechTheme.tokensDark === undefined) throw new Error("The neutral theme has no dark tokens");
  const light = declarations(sentTechTheme.tokens);
  const dark = declarations(sentTechTheme.tokensDark);
  if (light.size === 0 || dark.size === 0) throw new Error("The neutral theme compiled to no variable");
  return { light, dark };
}
