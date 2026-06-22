import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FieldCardVariant = "plain" | "bordered" | "accent";

export type FieldCardTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FieldCardProps = {
  label: string;
  variant?: FieldCardVariant;
  tone?: FieldCardTone;
  commentCount?: number;
  onOpenComments?: () => void;
  class?: string;
};

@Component({
  selector: "st-field-card",
  standalone: true,
  template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <header class="st-fieldCard__header">
        <h3 class="st-fieldCard__label">{{ label }}</h3>
        @if (showBadge) {
          @if (onOpenComments) {
            <button
              type="button"
              class="st-fieldCard__comments"
              [attr.aria-label]="'Commentaires (' + count + ')'"
              (click)="onOpenComments!()"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              @if (count > 0) {
                <span class="st-fieldCard__commentCount">{{ count }}</span>
              }
            </button>
          } @else {
            <span class="st-fieldCard__comments st-fieldCard__comments--static">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="st-fieldCard__commentCount">{{ count }}</span>
            </span>
          }
        }
      </header>
      <div class="st-fieldCard__body">
        <ng-content></ng-content>
      </div>
    </section>
  `,
})
export class FieldCard {
  static readonly stComponentName = "FieldCard";
  readonly componentName = "FieldCard";
  @NgInput() label!: string;
  @NgInput() variant: FieldCardVariant = "bordered";
  @NgInput() tone?: FieldCardTone;
  @NgInput() commentCount?: number;
  @NgInput() onOpenComments?: () => void;
  @NgInput("class") classInput?: string;

  get count(): number {
    return this.commentCount ?? 0;
  }

  get showBadge(): boolean {
    return this.count > 0 || !!this.onOpenComments;
  }

  get hostClass(): string {
    return classNames(
      "st-fieldCard",
      `st-fieldCard--${this.variant}`,
      this.variant === "accent" && this.tone && `st-fieldCard--${this.tone}`,
      this.classInput,
    );
  }
}
