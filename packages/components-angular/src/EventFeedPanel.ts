import { Component, Input as NgInput } from "@angular/core";

export type EventFeedPanelSeverity = "info" | "success" | "warning" | "error" | (string & {});

export type EventFeedPanelEvent = {
  at: number;
  type: string;
  severity: EventFeedPanelSeverity;
  message: string;
};

export type EventFeedPanelProps = {
  data: EventFeedPanelEvent[];
  label?: string;
  maxHeight?: number;
  height?: number;
  class?: string;
};

@Component({
  selector: "st-event-feed-panel",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class EventFeedPanel {
  static readonly stComponentName = "EventFeedPanel";
  readonly componentName = "EventFeedPanel";
  @NgInput() data!: EventFeedPanelEvent[];
  @NgInput() label?: string;
  @NgInput() maxHeight?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-eventFeedPanel", this.classInput].filter(Boolean).join(" ");
  }
}
