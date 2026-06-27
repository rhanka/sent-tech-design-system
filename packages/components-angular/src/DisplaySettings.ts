import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

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
      <p class="st-displaySettings__title">{{ resolvedTitle }}</p>

      <div class="st-displaySettings__grid">
        @if (showFontScale) {
          <label class="st-displaySettings__field">
            <span class="st-displaySettings__label">Taille de texte</span>
            <select
              [value]="state.fontScale"
              (change)="update({ fontScale: $any($event.target).value })"
            >
              <option value="normal">Normale</option>
              <option value="large">Grande</option>
              <option value="extra-large">Très grande</option>
            </select>
          </label>
        }

        @if (showContrast) {
          <label class="st-displaySettings__field">
            <span class="st-displaySettings__label">Contraste</span>
            <select
              [value]="state.contrast"
              (change)="update({ contrast: $any($event.target).value })"
            >
              <option value="default">Standard</option>
              <option value="high">Élevé</option>
            </select>
          </label>
        }

        @if (showLineSpacing) {
          <label class="st-displaySettings__field">
            <span class="st-displaySettings__label">Interligne</span>
            <select
              [value]="state.lineSpacing"
              (change)="update({ lineSpacing: $any($event.target).value })"
            >
              <option value="normal">Normal</option>
              <option value="comfortable">Confortable</option>
            </select>
          </label>
        }

        @if (showReducedMotion) {
          <label class="st-displaySettings__field st-displaySettings__field--switch">
            <span class="st-displaySettings__label">Animations (réduction)</span>
            <input
              type="checkbox"
              role="switch"
              [checked]="state.reducedMotion"
              (change)="update({ reducedMotion: $any($event.target).checked })"
            />
          </label>
        }
      </div>
    </div>
  `,
})
export class DisplaySettings {
  static readonly stComponentName = "DisplaySettings";
  readonly componentName = "DisplaySettings";
  @NgInput() title?: string;
  @NgInput() values?: Partial<DisplaySettingsState>;
  @NgInput() showFontScale = true;
  @NgInput() showContrast = true;
  @NgInput() showLineSpacing = true;
  @NgInput() showReducedMotion = true;
  @NgInput("class") classInput?: string;

  @Output() readonly change = new EventEmitter<DisplaySettingsState>();

  private overrides: Partial<DisplaySettingsState> = {};

  get resolvedTitle(): string {
    return this.title ?? "Paramètres d’affichage";
  }

  get state(): DisplaySettingsState {
    return {
      fontScale: this.overrides.fontScale ?? this.values?.fontScale ?? "normal",
      contrast: this.overrides.contrast ?? this.values?.contrast ?? "default",
      lineSpacing: this.overrides.lineSpacing ?? this.values?.lineSpacing ?? "normal",
      reducedMotion: this.overrides.reducedMotion ?? this.values?.reducedMotion ?? false,
    };
  }

  update(next: Partial<DisplaySettingsState>): void {
    this.overrides = { ...this.overrides, ...next };
    this.change.emit(this.state);
  }

  get hostClass(): string {
    return classNames("st-displaySettings", this.classInput);
  }
}
