import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class EventFeedPanel {
    static stComponentName = "EventFeedPanel";
    componentName = "EventFeedPanel";
    data;
    label;
    maxHeight;
    height;
    classInput;
    get hostClass() {
        return ["st-eventFeedPanel", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: EventFeedPanel, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: EventFeedPanel, isStandalone: true, selector: "st-event-feed-panel", inputs: { data: "data", label: "label", maxHeight: "maxHeight", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: EventFeedPanel, decorators: [{
            type: Component,
            args: [{
                    selector: "st-event-feed-panel",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
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