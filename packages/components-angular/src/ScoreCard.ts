import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ScoreCardType = "value" | "complexity";

export type ScoreCardSize = "sm" | "md" | "lg";

export type ScoreCardProps = {
  title: string;
  score: number;
  stars: number;
  max?: number;
  type?: ScoreCardType;
  unit?: string;
  size?: ScoreCardSize;
  class?: string;
};

@Component({
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
})
export class ScoreCard {
  static readonly stComponentName = "ScoreCard";
  readonly componentName = "ScoreCard";
  @NgInput() title!: string;
  @NgInput() score!: number;
  @NgInput() stars!: number;
  @NgInput() max?: number;
  @NgInput("type") typeInput?: ScoreCardType;
  @NgInput() unit?: string;
  @NgInput() size?: ScoreCardSize;
  @NgInput("class") classInput?: string;

  get starsArray(): number[] {
    return Array.from({ length: this.max ?? 5 }, (_, i) => i);
  }

  get hostClass(): string {
    return classNames("st-scoreCard", this.size && `st-scoreCard--${this.size}`, this.classInput);
  }
}
