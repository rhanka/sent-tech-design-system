// @vitest-environment jsdom
import "@angular/compiler";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { describe, expect, it } from "vitest";

import { RadioGroup } from "../dist/RadioGroup.js";
import { TimeRangePicker } from "../dist/TimeRangePicker.js";

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

type Range = { mode: "relative" | "absolute"; relative?: string; from: number; to: number };

// Mounted consumer of the documented customExtra usage: a date-basis radio
// group projected in the Custom tab, staged behind Apply.
class DateBasisHost {
  range: Range = {
    mode: "absolute",
    from: new Date(2026, 7, 1, 8, 0).getTime(),
    to: new Date(2026, 7, 2, 18, 0).getTime(),
  };
  applied = "document";
  draft = "document";
  seen: unknown[] = [];
  opens: boolean[] = [];
  options = [
    { label: "Document", value: "document" },
    { label: "Acquisition", value: "acquisition" },
  ];
  setDraft = (v: string): void => {
    this.draft = v;
  };
  opened(open: boolean): void {
    this.opens.push(open);
    if (open) this.draft = this.applied;
  }
  changed(next: unknown): void {
    this.seen.push(next);
    const r = next as Range;
    this.range = r;
    this.applied = r.mode === "absolute" ? this.draft : "document";
  }
}
Component({
  standalone: true,
  imports: [TimeRangePicker, RadioGroup],
  template: `
    <st-time-range-picker [value]="range" locale="en-US" (openChange)="opened($event)" (change)="changed($event)">
      <div slot="customExtra">
        <st-radio-group legend="Date basis" name="basis" [options]="options" [value]="draft" [onChange]="setDraft"></st-radio-group>
      </div>
    </st-time-range-picker>
  `,
})(DateBasisHost);

function button(root: HTMLElement, text: string): HTMLElement {
  const found = Array.from(root.querySelectorAll<HTMLElement>("button, st-button")).find(
    (b) => b.textContent?.trim() === text,
  );
  if (!found) throw new Error(`button not found: ${text}`);
  return (found.tagName === "ST-BUTTON" ? found.querySelector("button") : found) as HTMLElement;
}

describe("TimeRangePicker — customExtra in a mounted Angular consumer", () => {
  it("projects the extra above the From/To fields and hides the empty host otherwise", () => {
    const fixture = TestBed.createComponent(DateBasisHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector(".st-timeRangePicker__trigger") as HTMLElement).click();
    fixture.detectChanges();
    const slot = root.querySelector(".st-timeRangePicker__customExtra") as HTMLElement;
    expect(slot.querySelector("st-radio-group")).toBeTruthy();
    const bounds = root.querySelector(".st-timeRangePicker__bounds") as HTMLElement;
    expect(slot.compareDocumentPosition(bounds) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("radio edits never reach (change); Cancel emits nothing; Apply emits one absolute range", () => {
    const fixture = TestBed.createComponent(DateBasisHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const open = () => {
      (root.querySelector(".st-timeRangePicker__trigger") as HTMLElement).click();
      fixture.detectChanges();
    };
    const pickAcquisition = () => {
      (root.querySelector('st-radio-group input[value="acquisition"]') as HTMLInputElement).click();
      fixture.detectChanges();
    };

    open();
    pickAcquisition();
    expect(host.draft).toBe("acquisition");
    expect(host.seen).toEqual([]);
    button(root, "Cancel").click();
    fixture.detectChanges();
    expect(host.seen).toEqual([]);
    expect(host.applied).toBe("document");

    open();
    expect(host.draft).toBe("document");
    pickAcquisition();
    expect(host.seen).toEqual([]);
    button(root, "Apply").click();
    fixture.detectChanges();
    expect(host.seen).toHaveLength(1);
    expect(host.seen[0]).toEqual({ mode: "absolute", from: host.range.from, to: host.range.to });
    expect(host.applied).toBe("acquisition");
    expect(host.opens).toEqual([true, false, true, false]);
  });
});
