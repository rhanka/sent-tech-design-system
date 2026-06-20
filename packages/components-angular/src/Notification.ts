import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type NotificationTone = "info" | "success" | "warning" | "error";

export type NotificationProps = {
  tone?: NotificationTone;
  title: string;
  message?: string;
  dismissible?: boolean;
  dismissLabel?: string;
  class?: string;
};

@Component({
  selector: "st-notification",
  standalone: true,
  template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.role]="tone === 'error' ? 'alert' : 'status'"
    >
      <div class="st-notification__content">
        <h2 class="st-notification__title">{{ title }}</h2>
        @if (message) {
          <p class="st-notification__message">{{ message }}</p>
        }
        <ng-content></ng-content>
      </div>
      <div class="st-notification__meta">
        <div class="st-notification__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
        @if (dismissible) {
          <button
            type="button"
            class="st-notification__close"
            [attr.aria-label]="dismissLabel || 'Dismiss'"
            [attr.title]="dismissLabel || 'Dismiss'"
            (click)="dismiss.emit()"
          >&#xD7;</button>
        }
      </div>
    </section>
  `,
})
export class Notification {
  static readonly stComponentName = "Notification";
  readonly componentName = "Notification";

  @NgInput() tone?: NotificationTone;
  @NgInput() title!: string;
  @NgInput() message?: string;
  @NgInput() dismissible?: boolean;
  @NgInput() dismissLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly dismiss = new EventEmitter<void>();

  get hostClass(): string {
    return classNames(
      "st-notification",
      this.tone && `st-notification--${this.tone}`,
      this.classInput,
    );
  }
}
