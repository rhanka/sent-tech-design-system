import { NgFor, NgIf } from "@angular/common";
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
  imports: [NgFor, NgIf],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <p *ngIf="label" class="st-eventFeedPanel__label" id="st-eventFeedPanel-label">
        {{ label }}
      </p>
      <ul
        class="st-eventFeedPanel__list"
        role="feed"
        [attr.aria-label]="label"
        aria-busy="false"
        [style.max-height.px]="resolvedMaxHeight"
      >
        <li
          *ngFor="let item of items"
          [class]="'st-eventFeedPanel__item st-eventFeedPanel__item--' + item.tone"
          role="article"
          [attr.aria-label]="item.datum.type + ' - ' + item.datum.message"
        >
          <span [class]="'st-eventFeedPanel__badge st-eventFeedPanel__badge--' + item.tone" aria-hidden="true"></span>
          <div class="st-eventFeedPanel__body">
            <div class="st-eventFeedPanel__meta">
              <span class="st-eventFeedPanel__type">{{ item.datum.type }}</span>
              <time class="st-eventFeedPanel__time">{{ item.time }}</time>
            </div>
            <p class="st-eventFeedPanel__message">{{ item.datum.message }}</p>
          </div>
        </li>
      </ul>
    </div>
  `,
})
export class EventFeedPanel {
  static readonly stComponentName = "EventFeedPanel";
  readonly componentName = "EventFeedPanel";
  @NgInput() data: EventFeedPanelEvent[] = [];
  @NgInput() label?: string;
  @NgInput() maxHeight?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  private readonly knownSeverities = ["info", "success", "warning", "error"];

  get hostClass(): string {
    return ["st-eventFeedPanel", this.classInput].filter(Boolean).join(" ");
  }

  get resolvedMaxHeight(): number | undefined {
    const value = this.maxHeight ?? this.height;
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  }

  get items(): Array<{ index: number; datum: EventFeedPanelEvent; tone: string; time: string }> {
    return (this.data ?? [])
      .filter((datum) => Boolean(datum) && Number.isFinite(datum.at) && typeof datum.message === "string")
      .map((datum, index) => ({
        index,
        datum,
        tone: this.severityTone(String(datum.severity)),
        time: this.formatTime(datum.at),
      }))
      .sort((a, b) => b.datum.at - a.datum.at);
  }

  private severityTone(severity: string): string {
    return this.knownSeverities.includes(severity) ? severity : "neutral";
  }

  private formatTime(at: number): string {
    if (!Number.isFinite(at)) return "";
    const date = new Date(at);
    if (Number.isNaN(date.getTime())) return String(at);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}
