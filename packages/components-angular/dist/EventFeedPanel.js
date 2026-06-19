import { NgFor, NgIf } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class EventFeedPanel {
    static stComponentName = "EventFeedPanel";
    componentName = "EventFeedPanel";
    data = [];
    label;
    maxHeight;
    height;
    classInput;
    knownSeverities = ["info", "success", "warning", "error"];
    get hostClass() {
        return ["st-eventFeedPanel", this.classInput].filter(Boolean).join(" ");
    }
    get resolvedMaxHeight() {
        const value = this.maxHeight ?? this.height;
        return typeof value === "number" && Number.isFinite(value) ? value : undefined;
    }
    get items() {
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
    severityTone(severity) {
        return this.knownSeverities.includes(severity) ? severity : "neutral";
    }
    formatTime(at) {
        if (!Number.isFinite(at))
            return "";
        const date = new Date(at);
        if (Number.isNaN(date.getTime()))
            return String(at);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: EventFeedPanel, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: EventFeedPanel, isStandalone: true, selector: "st-event-feed-panel", inputs: { data: "data", label: "label", maxHeight: "maxHeight", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: EventFeedPanel, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], maxHeight: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=EventFeedPanel.js.map