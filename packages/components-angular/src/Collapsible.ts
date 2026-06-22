import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type CollapsibleSize = "sm" | "md" | "lg";

export type CollapsibleProps = {
  /** État ouvert (contrôlable). */
  open?: boolean;
  title: string;
  size?: CollapsibleSize;
  disabled?: boolean;
  onToggle?: (open: boolean) => void;
  class?: string;
};

let _collapsibleCounter = 0;

@Component({
  selector: "st-collapsible",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button
        type="button"
        class="st-collapsible__trigger"
        [attr.aria-expanded]="currentOpen ? 'true' : 'false'"
        [attr.aria-controls]="uid + '-region'"
        [id]="uid + '-trigger'"
        [disabled]="disabled ?? false"
        (click)="toggle()"
      >
        <span class="st-collapsible__title">{{ title }}</span>
        <span class="st-collapsible__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      @if (currentOpen) {
        <div
          class="st-collapsible__region"
          role="region"
          [id]="uid + '-region'"
          [attr.aria-labelledby]="uid + '-trigger'"
        >
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
})
export class Collapsible {
  static readonly stComponentName = "Collapsible";
  readonly componentName = "Collapsible";

  readonly uid = `st-collapsible-${++_collapsibleCounter}`;
  private localOpen = false;

  @NgInput() open?: boolean;
  @NgInput() title!: string;
  @NgInput() size?: CollapsibleSize;
  @NgInput() disabled?: boolean;
  @NgInput() onToggle?: (open: boolean) => void;
  @NgInput("class") classInput?: string;

  @Output() readonly toggleChange = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.localOpen = this.open ?? false;
  }

  get currentOpen(): boolean {
    return this.open ?? this.localOpen;
  }

  get hostClass(): string {
    return classNames(
      "st-collapsible",
      `st-collapsible--${this.size ?? "md"}`,
      this.currentOpen && "st-collapsible--open",
      this.classInput,
    );
  }

  toggle(): void {
    if (this.disabled) return;
    const next = !this.currentOpen;
    if (this.open === undefined) {
      this.localOpen = next;
    }
    this.onToggle?.(next);
    this.toggleChange.emit(next);
  }
}
