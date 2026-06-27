import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class DisplaySettings {
    static stComponentName = "DisplaySettings";
    componentName = "DisplaySettings";
    title;
    values;
    showFontScale = true;
    showContrast = true;
    showLineSpacing = true;
    showReducedMotion = true;
    classInput;
    change = new EventEmitter();
    overrides = {};
    get resolvedTitle() {
        return this.title ?? "Paramètres d’affichage";
    }
    get state() {
        return {
            fontScale: this.overrides.fontScale ?? this.values?.fontScale ?? "normal",
            contrast: this.overrides.contrast ?? this.values?.contrast ?? "default",
            lineSpacing: this.overrides.lineSpacing ?? this.values?.lineSpacing ?? "normal",
            reducedMotion: this.overrides.reducedMotion ?? this.values?.reducedMotion ?? false,
        };
    }
    update(next) {
        this.overrides = { ...this.overrides, ...next };
        this.change.emit(this.state);
    }
    get hostClass() {
        return classNames("st-displaySettings", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DisplaySettings, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DisplaySettings, isStandalone: true, selector: "st-display-settings", inputs: { title: "title", values: "values", showFontScale: "showFontScale", showContrast: "showContrast", showLineSpacing: "showLineSpacing", showReducedMotion: "showReducedMotion", classInput: ["class", "classInput"] }, outputs: { change: "change" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DisplaySettings, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], values: [{
                type: NgInput
            }], showFontScale: [{
                type: NgInput
            }], showContrast: [{
                type: NgInput
            }], showLineSpacing: [{
                type: NgInput
            }], showReducedMotion: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=DisplaySettings.js.map