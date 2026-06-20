import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";

export type TimelineOrientation = "vertical" | "horizontal";

export type TimelineItem = {
  title: string;
  meta?: string;
  description?: string;
  tone?: TimelineTone;
  date?: string;
  label?: string;
  status?: string;
  icon?: string;
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
      @for(item of items; track item.title ?? item.label){
        <li class="st-timeline__item">
          <div class="st-timeline__connector"></div>
          <div class="st-timeline__content">
            <span class="st-timeline__date">{{item.date ?? item.meta}}</span>
            <span class="st-timeline__label">{{item.label ?? item.title}}</span>
            @if(item.description){
              <p class="st-timeline__desc">{{item.description}}</p>
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

  get hostClass(): string {
    return classNames(
      "st-timeline",
      `st-timeline--${this.orientation ?? "vertical"}`,
      this.classInput,
    );
  }
}
