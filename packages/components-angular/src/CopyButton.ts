import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CopyButtonSize = "sm" | "md" | "lg";

export type CopyButtonProps = {
  text?: string;
  value?: string;
  label?: string;
  copiedLabel?: string;
  size?: CopyButtonSize;
  class?: string;
};

@Component({
  selector: "st-copy-button",
  standalone: true,
  template: `
    <button type="button" [attr.data-st-component]="componentName" [class]="hostClass"
      aria-live="polite"
      (click)="copy()">
      <span class="st-copyButton__icon" aria-hidden="true">
        @if (copied) {
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        } @else {
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        }
      </span>
      <span class="st-copyButton__label">{{ copied ? (copiedLabel || 'Copié') : (label || 'Copier') }}</span>
    </button>
  `,
})
export class CopyButton {
  static readonly stComponentName = "CopyButton";
  readonly componentName = "CopyButton";
  @NgInput() text?: string;
  @NgInput() value?: string;
  @NgInput() label?: string;
  @NgInput() copiedLabel?: string;
  @NgInput() size?: CopyButtonSize;
  @NgInput("class") classInput?: string;

  copied = false;

  copy(): void {
    const content = this.value ?? this.text ?? "";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      });
    }
  }

  get hostClass(): string {
    return classNames(
      "st-copyButton",
      `st-copyButton--${this.size ?? "md"}`,
      this.copied && "st-copyButton--copied",
      this.classInput,
    );
  }
}
