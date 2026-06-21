import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TranscriptionSegment = {
  speaker?: string;
  startTime?: string;
  endTime?: string;
  text: string;
};

/** Alias used by chat-oriented consumers. */
export type TranscriptionEntry = {
  role?: string;
  text: string;
  timestamp?: string;
};

export type TranscriptionProps = {
  title?: string;
  segments?: TranscriptionSegment[];
  entries?: TranscriptionEntry[];
  text?: string;
  class?: string;
  open?: boolean;
  showTimestamps?: boolean;
};

@Component({
  selector: "st-transcription",
  standalone: true,
  template: `
    <details [attr.data-st-component]="componentName" [class]="hostClass" [attr.open]="open ? '' : null">
      <summary>{{ title ?? 'Transcription' }}</summary>
      <div class="st-transcription__content">
        @if (resolvedSegments.length > 0) {
          <ol class="st-transcription__list">
            @for (seg of resolvedSegments; track $index) {
              <li class="st-transcription__item">
                <p class="st-transcription__meta">
                  @if (seg.speaker) {
                    <span class="st-transcription__speaker">{{ seg.speaker }}</span>
                  }
                  @if (showTimestamps && (seg.startTime || seg.endTime)) {
                    <time>{{ formatInterval(seg) }}</time>
                  }
                </p>
                <p class="st-transcription__text">{{ seg.text }}</p>
              </li>
            }
          </ol>
        } @else if (text) {
          <p class="st-transcription__text">{{ text }}</p>
        } @else {
          <p class="st-transcription__text">Aucun contenu de transcription fourni.</p>
        }
      </div>
    </details>
  `,
})
export class Transcription {
  static readonly stComponentName = "Transcription";
  readonly componentName = "Transcription";

  @NgInput() title?: string;
  @NgInput() segments?: TranscriptionSegment[];
  @NgInput() entries?: TranscriptionEntry[];
  @NgInput() text?: string;
  @NgInput("class") classInput?: string;
  @NgInput() open?: boolean;
  @NgInput() showTimestamps = true;

  get hostClass(): string {
    return classNames("st-transcription", this.classInput);
  }

  get resolvedSegments(): TranscriptionSegment[] {
    return (this.segments ?? []).filter((s) => Boolean(s.text?.trim()));
  }

  formatInterval(seg: TranscriptionSegment): string {
    if (!this.showTimestamps || (!seg.startTime && !seg.endTime)) return "";
    if (!seg.startTime) return seg.endTime ? `- ${seg.endTime}` : "";
    if (!seg.endTime) return `${seg.startTime} -`;
    return `${seg.startTime} - ${seg.endTime}`;
  }
}
