export type CompareState = "rest" | "focus" | "disabled" | "error" | "selected";
export interface CompareEntry {
  component: string;
  scenario: string;
  state: CompareState;
  ourSelector: string;
  refSelector: string;
  refMarkup: string;
  lang: "fr" | "en";
  note?: string;
}
export declare const COMPARE_MANIFEST: Record<string, Record<string, CompareEntry>>;
