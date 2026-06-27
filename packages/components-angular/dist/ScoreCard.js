import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const STAR_PATH = "m7 1.5 1.7 3.45 3.8.55-2.75 2.68.65 3.79L7 10.18 3.6 11.96l.65-3.79L1.5 5.5l3.8-.55L7 1.5Z";
const CROSS_PATH = "M3.5 3.5l7 7M10.5 3.5l-7 7";
export class ScoreCard {
    static stComponentName = "ScoreCard";
    componentName = "ScoreCard";
    title;
    score;
    stars;
    max;
    typeInput;
    unit;
    size;
    classInput;
    starPath = STAR_PATH;
    crossPath = CROSS_PATH;
    get resolvedMax() {
        return this.max ?? 5;
    }
    get resolvedType() {
        return this.typeInput ?? "value";
    }
    get resolvedUnit() {
        return this.unit ?? "points";
    }
    get resolvedSize() {
        return this.size ?? "md";
    }
    get filled() {
        return Math.max(0, Math.min(this.resolvedMax, Math.round(this.stars)));
    }
    get symbols() {
        return Array.from({ length: this.resolvedMax }, (_, i) => i < this.filled);
    }
    get scoreText() {
        return (this.score ?? 0).toFixed(1);
    }
    get ariaLabel() {
        return `${this.title}, ${this.scoreText} ${this.resolvedUnit}, ${this.filled} sur ${this.resolvedMax}`;
    }
    symbolClass(on) {
        return classNames("st-scoreCard__symbol", on ? "st-scoreCard__symbol--on" : "st-scoreCard__symbol--off");
    }
    get hostClass() {
        return classNames("st-scoreCard", `st-scoreCard--${this.resolvedSize}`, `st-scoreCard--${this.resolvedType}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ScoreCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ScoreCard, isStandalone: true, selector: "st-score-card", inputs: { title: "title", score: "score", stars: "stars", max: "max", typeInput: ["type", "typeInput"], unit: "unit", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <article
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="ariaLabel"
    >
      <h3 class="st-scoreCard__title">{{ title }}</h3>
      <div class="st-scoreCard__row">
        <div class="st-scoreCard__symbols" aria-hidden="true">
          @for (on of symbols; track $index) {
            <svg
              [class]="symbolClass(on)"
              width="20"
              height="20"
              viewBox="0 0 14 14"
              focusable="false"
            >
              @if (resolvedType === 'value') {
                <path
                  [attr.d]="starPath"
                  [attr.fill]="on ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-linejoin="round"
                />
              } @else {
                <path
                  [attr.d]="crossPath"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              }
            </svg>
          }
        </div>
        <span class="st-scoreCard__score">{{ scoreText }} {{ resolvedUnit }}</span>
      </div>
    </article>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ScoreCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-score-card",
                    standalone: true,
                    template: `
    <article
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="ariaLabel"
    >
      <h3 class="st-scoreCard__title">{{ title }}</h3>
      <div class="st-scoreCard__row">
        <div class="st-scoreCard__symbols" aria-hidden="true">
          @for (on of symbols; track $index) {
            <svg
              [class]="symbolClass(on)"
              width="20"
              height="20"
              viewBox="0 0 14 14"
              focusable="false"
            >
              @if (resolvedType === 'value') {
                <path
                  [attr.d]="starPath"
                  [attr.fill]="on ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-linejoin="round"
                />
              } @else {
                <path
                  [attr.d]="crossPath"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              }
            </svg>
          }
        </div>
        <span class="st-scoreCard__score">{{ scoreText }} {{ resolvedUnit }}</span>
      </div>
    </article>
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], score: [{
                type: NgInput
            }], stars: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], typeInput: [{
                type: NgInput,
                args: ["type"]
            }], unit: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ScoreCard.js.map