import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";

export type TimelineOrientation = "vertical" | "horizontal";

export type TimelineItem = {
  /** Titre de l'événement. */
  title: string;
  /** Métadonnée optionnelle (date, heure, libellé court). */
  meta?: string;
  /** Description optionnelle de l'événement. */
  description?: string;
  /** Ton de la pastille (mappé sur les tokens de statut DS, défaut "neutral"). */
  tone?: TimelineTone;
};

export type TimelineProps = {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  class?: string;
};

@Component({
  selector: "st-timeline",
  standalone: true,
  template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of safeItems; track $index) {
        <li [class]="'st-timeline__item st-timeline__item--' + (item.tone ?? 'neutral')">
          <span class="st-timeline__rail" aria-hidden="true">
            <span class="st-timeline__dot"></span>
            <span class="st-timeline__line"></span>
          </span>
          <div class="st-timeline__content">
            @if (item.meta) {
              <span class="st-timeline__meta">{{ item.meta }}</span>
            }
            <span class="st-timeline__title">{{ item.title }}</span>
            @if (item.description) {
              <span class="st-timeline__description">{{ item.description }}</span>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class Timeline {
  static readonly stComponentName = "Timeline";
  readonly componentName = "Timeline";
  @NgInput() items!: TimelineItem[];
  @NgInput() orientation?: TimelineOrientation;
  @NgInput("class") classInput?: string;

  get safeItems(): TimelineItem[] {
    return Array.isArray(this.items) ? this.items : [];
  }

  get hostClass(): string {
    return classNames(
      "st-timeline",
      `st-timeline--${this.orientation ?? "vertical"}`,
      this.classInput,
    );
  }
}
