import { Component, Input as NgInput } from "@angular/core";

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

@Component({
  selector: "st-display-settings",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class DisplaySettings {
  static readonly stComponentName = "DisplaySettings";
  readonly componentName = "DisplaySettings";
  @NgInput() title?: string;
  @NgInput() values?: Partial<DisplaySettingsState>;
  @NgInput() showFontScale?: boolean;
  @NgInput() showContrast?: boolean;
  @NgInput() showLineSpacing?: boolean;
  @NgInput() showReducedMotion?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-displaySettings", this.classInput].filter(Boolean).join(" ");
  }
}
