import { NgFor } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8",
];
const MARGIN = { top: 24, right: 8, bottom: 8, left: 24 };
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function normalizedScale(value) {
    return value === "categorical" ? "categorical" : "sequential";
}
function parseUTCDate(dateStr) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!match)
        return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31)
        return null;
    const ts = Date.UTC(year, month - 1, day);
    const check = new Date(ts).toISOString().slice(0, 10);
    if (check !== dateStr)
        return null;
    return { year, month, day, ts };
}
function daysDiff(tsA, tsB) {
    return Math.round((tsB - tsA) / 86400000);
}
function toneForValue(value, min, max) {
    if (!Number.isFinite(value) || max <= min)
        return "category1";
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
    return TONES[index];
}
export class CalendarHeatmapChart {
    static stComponentName = "CalendarHeatmapChart";
    componentName = "CalendarHeatmapChart";
    margin = MARGIN;
    visibleDayLabels = DAY_LABELS.map((label, index) => ({ label, index })).filter((day) => day.index % 2 === 1);
    data = [];
    label;
    scale;
    width;
    height;
    classInput;
    hoveredDate = null;
    get resolvedScale() {
        return normalizedScale(this.scale);
    }
    get resolvedWidth() {
        return this.width ?? 480;
    }
    get resolvedHeight() {
        return this.height ?? 140;
    }
    get viewBox() {
        return `0 0 ${this.resolvedWidth} ${this.resolvedHeight}`;
    }
    get hostClass() {
        return classNames("st-calendarHeatmapChart", `st-calendarHeatmapChart--${this.resolvedScale}`, this.classInput);
    }
    get plotWidth() {
        return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.resolvedHeight - MARGIN.top - MARGIN.bottom, 1);
    }
    get grid() {
        const data = this.data ?? [];
        if (data.length === 0)
            return { cells: [], weeks: 0, monthLabels: [] };
        const validData = data.filter((datum) => parseUTCDate(datum.date) !== null && Number.isFinite(datum.value));
        if (validData.length === 0)
            return { cells: [], weeks: 0, monthLabels: [] };
        const sorted = [...validData].sort((a, b) => a.date.localeCompare(b.date));
        const firstParsed = parseUTCDate(sorted[0].date);
        const lastParsed = parseUTCDate(sorted[sorted.length - 1].date);
        const values = sorted.map((datum) => datum.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueMap = new Map();
        for (const datum of sorted)
            valueMap.set(datum.date, datum.value);
        const firstDate = new Date(firstParsed.ts);
        const lastDate = new Date(lastParsed.ts);
        const gridStartTs = firstParsed.ts - firstDate.getUTCDay() * 86400000;
        const gridEndTs = lastParsed.ts + (6 - lastDate.getUTCDay()) * 86400000;
        const totalDays = daysDiff(gridStartTs, gridEndTs) + 1;
        const weeks = Math.ceil(totalDays / 7);
        const cellWidth = this.plotWidth / Math.max(weeks, 1);
        const cellHeight = this.plotHeight / 7;
        const cells = [];
        const monthLabelMap = new Map();
        for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
            const currentTs = gridStartTs + dayIndex * 86400000;
            const currentDate = new Date(currentTs);
            const dayOfWeek = currentDate.getUTCDay();
            const week = Math.floor(dayIndex / 7);
            const date = currentDate.toISOString().slice(0, 10);
            const value = valueMap.get(date) ?? null;
            const x = MARGIN.left + week * cellWidth;
            const y = MARGIN.top + dayOfWeek * cellHeight;
            const tone = value !== null && Number.isFinite(value) ? toneForValue(value, minValue, maxValue) : null;
            cells.push({
                date,
                value,
                tone,
                x,
                y,
                w: Math.max(cellWidth - 2, 1),
                h: Math.max(cellHeight - 2, 1),
            });
            const monthKey = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth()}`;
            if (!monthLabelMap.has(monthKey))
                monthLabelMap.set(monthKey, x);
        }
        const monthLabels = Array.from(monthLabelMap.entries()).map(([key, x]) => {
            const [, month] = key.split("-").map(Number);
            return { label: MONTH_ABBR[month], x };
        });
        return { cells, weeks, monthLabels };
    }
    get dataValueItems() {
        return (this.data ?? [])
            .filter((datum) => parseUTCDate(datum.date) !== null && Number.isFinite(datum.value))
            .map((datum) => `${datum.date}: ${datum.value}`);
    }
    get hoveredCell() {
        return this.hoveredDate !== null ? this.grid.cells.find((cell) => cell.date === this.hoveredDate) ?? null : null;
    }
    get tooltipLeft() {
        const cell = this.hoveredCell;
        return cell ? `${((cell.x + cell.w / 2) / this.resolvedWidth) * 100}%` : "0%";
    }
    get tooltipTop() {
        const cell = this.hoveredCell;
        return cell ? `${((cell.y + cell.h / 2) / this.resolvedHeight) * 100}%` : "0%";
    }
    get tooltipLabel() {
        return this.hoveredCell?.date ?? "";
    }
    get tooltipValue() {
        return this.hoveredCell?.value !== null && this.hoveredCell?.value !== undefined ? String(this.hoveredCell.value) : "";
    }
    cellClass(cell) {
        return classNames("st-calendarHeatmapChart__cell", cell.tone ? `st-calendarHeatmapChart__cell--${cell.tone}` : "st-calendarHeatmapChart__cell--empty", this.hoveredDate !== null && this.hoveredDate !== cell.date ? "st-calendarHeatmapChart__cell--dim" : undefined);
    }
    handlePointerMove(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            this.hoveredDate = null;
            return;
        }
        this.hoveredDate = target.getAttribute("data-chart-date") ?? null;
    }
    handleLeave() {
        this.hoveredDate = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CalendarHeatmapChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: CalendarHeatmapChart, isStandalone: true, selector: "st-calendar-heatmap-chart", inputs: { data: "data", label: "label", scale: "scale", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-calendarHeatmapChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <text
            *ngFor="let day of visibleDayLabels"
            class="st-calendarHeatmapChart__dayLabel"
            [attr.x]="margin.left - 4"
            [attr.y]="margin.top + day.index * (plotHeight / 7) + plotHeight / 14"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ day.label }}</text>

          <text
            *ngFor="let monthLabel of grid.monthLabels"
            class="st-calendarHeatmapChart__monthLabel"
            [attr.x]="monthLabel.x"
            [attr.y]="margin.top - 6"
            dominant-baseline="auto"
          >{{ monthLabel.label }}</text>

          <rect
            *ngFor="let cell of grid.cells"
            [attr.class]="cellClass(cell)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.w"
            [attr.height]="cell.h"
            rx="2"
            [attr.data-chart-date]="cell.date"
          ></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-calendarHeatmapChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell && hoveredCell.value !== null ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-calendarHeatmapChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-calendarHeatmapChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CalendarHeatmapChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-calendar-heatmap-chart",
                    standalone: true,
                    imports: [NgFor],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-calendarHeatmapChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <text
            *ngFor="let day of visibleDayLabels"
            class="st-calendarHeatmapChart__dayLabel"
            [attr.x]="margin.left - 4"
            [attr.y]="margin.top + day.index * (plotHeight / 7) + plotHeight / 14"
            text-anchor="end"
            dominant-baseline="middle"
          >{{ day.label }}</text>

          <text
            *ngFor="let monthLabel of grid.monthLabels"
            class="st-calendarHeatmapChart__monthLabel"
            [attr.x]="monthLabel.x"
            [attr.y]="margin.top - 6"
            dominant-baseline="auto"
          >{{ monthLabel.label }}</text>

          <rect
            *ngFor="let cell of grid.cells"
            [attr.class]="cellClass(cell)"
            [attr.x]="cell.x"
            [attr.y]="cell.y"
            [attr.width]="cell.w"
            [attr.height]="cell.h"
            rx="2"
            [attr.data-chart-date]="cell.date"
          ></rect>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        <li *ngFor="let item of dataValueItems">{{ item }}</li>
      </ul>

      <div
        class="st-calendarHeatmapChart__tooltip"
        role="presentation"
        [style.display]="hoveredCell && hoveredCell.value !== null ? 'inline-flex' : 'none'"
        [style.left]="tooltipLeft"
        [style.top]="tooltipTop"
      >
        <span class="st-calendarHeatmapChart__tooltipLabel">{{ tooltipLabel }}</span>
        <span class="st-calendarHeatmapChart__tooltipValue">{{ tooltipValue }}</span>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], scale: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=CalendarHeatmapChart.js.map