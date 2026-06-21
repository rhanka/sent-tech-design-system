import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
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
    get starsArray() {
        return Array.from({ length: this.max ?? 5 }, (_, i) => i);
    }
    get hostClass() {
        return classNames("st-scoreCard", this.size && `st-scoreCard--${this.size}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ScoreCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ScoreCard, isStandalone: true, selector: "st-score-card", inputs: { title: "title", score: "score", stars: "stars", max: "max", typeInput: ["type", "typeInput"], unit: "unit", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-scoreCard__header">
        <span class="st-scoreCard__title">{{ title }}</span>
      </div>
      <div class="st-scoreCard__score">
        <span class="st-scoreCard__value">{{ score }}</span>
        @if (unit) { <span class="st-scoreCard__unit">{{ unit }}</span> }
      </div>
      <div class="st-scoreCard__stars" [attr.aria-label]="stars + ' étoiles sur ' + (max ?? 5)">
        @for (i of starsArray; track $index) {
          <span class="st-scoreCard__star" [class.st-scoreCard__star--filled]="$index < stars">★</span>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ScoreCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-score-card",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-scoreCard__header">
        <span class="st-scoreCard__title">{{ title }}</span>
      </div>
      <div class="st-scoreCard__score">
        <span class="st-scoreCard__value">{{ score }}</span>
        @if (unit) { <span class="st-scoreCard__unit">{{ unit }}</span> }
      </div>
      <div class="st-scoreCard__stars" [attr.aria-label]="stars + ' étoiles sur ' + (max ?? 5)">
        @for (i of starsArray; track $index) {
          <span class="st-scoreCard__star" [class.st-scoreCard__star--filled]="$index < stars">★</span>
        }
      </div>
      <ng-content></ng-content>
    </div>
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