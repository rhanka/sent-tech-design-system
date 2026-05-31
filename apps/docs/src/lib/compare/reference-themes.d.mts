export interface ReferenceTheme {
  label: string;
  cssUrl: string;
  fontLinks: string;
  brandFont: string;
  lang: "fr" | "en";
}
export declare const REFERENCE_THEMES: Record<string, ReferenceTheme>;

export interface GetReferenceThemesOptions {
  includeLocal?: boolean;
}
export declare function getReferenceThemes(opts?: GetReferenceThemesOptions): Record<string, ReferenceTheme>;
