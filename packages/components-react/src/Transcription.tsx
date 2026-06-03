import React from "react";
import { classNames } from "./classNames.js";

export type TranscriptionSegment = {
  speaker?: string;
  startTime?: string;
  endTime?: string;
  text: string;
};

export type TranscriptionProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  title?: string;
  segments?: TranscriptionSegment[];
  text?: string;
  className?: string;
  open?: boolean;
  showTimestamps?: boolean;
};

export const Transcription = React.forwardRef<HTMLDetailsElement, TranscriptionProps>(
  (
    {
      title = "Transcription",
      segments,
      text,
      open = false,
      showTimestamps = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const resolvedSegments = (segments ?? []).filter((segment) => Boolean(segment.text?.trim()));
    const hasSegments = resolvedSegments.length > 0;
    const hasText = Boolean(text && text.trim().length);

    const formatInterval = (segment: TranscriptionSegment) => {
      if (!showTimestamps || (!segment.startTime && !segment.endTime)) return "";
      if (!segment.startTime) return segment.endTime ? `- ${segment.endTime}` : "";
      if (!segment.endTime) return `${segment.startTime} -`;
      return `${segment.startTime} - ${segment.endTime}`;
    };

    return (
      <details {...rest} ref={ref} open={open} className={classNames("st-transcription", className)}>
        <summary>{title}</summary>

        <div className="st-transcription__content">
          {hasSegments ? (
            <ol className="st-transcription__list">
              {resolvedSegments.map((segment, index) => {
                const interval = formatInterval(segment);
                return (
                  <li key={index} className="st-transcription__item">
                    <p className="st-transcription__meta">
                      {segment.speaker ? (
                        <span className="st-transcription__speaker">{segment.speaker}</span>
                      ) : null}
                      {segment.speaker && interval ? <span aria-hidden="true">&nbsp;•&nbsp;</span> : null}
                      {interval ? (
                        <time>
                          <span className="st-transcription__sr-only">Horodatage {interval}</span>
                          <span aria-hidden="true">{interval}</span>
                        </time>
                      ) : null}
                    </p>
                    <p className="st-transcription__text">{segment.text}</p>
                  </li>
                );
              })}
            </ol>
          ) : hasText ? (
            <p className="st-transcription__text">{text}</p>
          ) : (
            <p className="st-transcription__text">Aucun contenu de transcription fourni.</p>
          )}
        </div>
      </details>
    );
  },
);

Transcription.displayName = "Transcription";
