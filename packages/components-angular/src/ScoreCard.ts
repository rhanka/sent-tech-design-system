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

const STAR_PATH =
  "m7 1.5 1.7 3.45 3.8.55-2.75 2.68.65 3.79L7 10.18 3.6 11.96l.65-3.79L1.5 5.5l3.8-.55L7 1.5Z";
const CROSS_PATH = "M3.5 3.5l7 7M10.5 3.5l-7 7";

@Component({
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

  readonly starPath = STAR_PATH;
  readonly crossPath = CROSS_PATH;

  get resolvedMax(): number {
    return this.max ?? 5;
  }

  get resolvedType(): ScoreCardType {
    return this.typeInput ?? "value";
  }

  get resolvedUnit(): string {
    return this.unit ?? "points";
  }

  get resolvedSize(): ScoreCardSize {
    return this.size ?? "md";
  }

  get filled(): number {
    return Math.max(0, Math.min(this.resolvedMax, Math.round(this.stars)));
  }

  get symbols(): boolean[] {
    return Array.from({ length: this.resolvedMax }, (_, i) => i < this.filled);
  }

  get scoreText(): string {
    return (this.score ?? 0).toFixed(1);
  }

  get ariaLabel(): string {
    return `${this.title}, ${this.scoreText} ${this.resolvedUnit}, ${this.filled} sur ${this.resolvedMax}`;
  }

  symbolClass(on: boolean): string {
    return classNames(
      "st-scoreCard__symbol",
      on ? "st-scoreCard__symbol--on" : "st-scoreCard__symbol--off",
    );
  }

  get hostClass(): string {
    return classNames(
      "st-scoreCard",
      `st-scoreCard--${this.resolvedSize}`,
      `st-scoreCard--${this.resolvedType}`,
      this.classInput,
    );
  }
}
