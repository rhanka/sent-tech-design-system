import React from "react";
import { classNames } from "./classNames.js";

export type MediaKind = "image" | "video";

export type MediaContentProps = Omit<React.HTMLAttributes<HTMLElement>, "className" | "children"> & {
  title?: string;
  caption?: string;
  byline?: string;
  media?: string;
  mediaAlt?: string;
  mediaKind?: MediaKind;
  mediaControls?: boolean;
  aspectRatio?: string;
  mediaCaptions?: string;
  mediaCaptionsLabel?: string;
  mediaCaptionsLang?: string;
  className?: string;
  children?: React.ReactNode;
};

const DEFAULT_CAPTIONS = "data:text/vtt,WEBVTT";

export const MediaContent = React.forwardRef<HTMLElement, MediaContentProps>(
  (
    {
      title,
      caption,
      byline,
      media,
      mediaAlt = "",
      mediaKind = "image",
      mediaControls = true,
      aspectRatio = "16/9",
      mediaCaptions,
      mediaCaptionsLabel = "Français",
      mediaCaptionsLang = "fr",
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const hasMedia = Boolean(media?.trim());

    return (
      <figure {...rest} ref={ref} className={classNames("st-mediaContent", className)}>
        <div
          className="st-mediaContent__media"
          style={{ "--st-mediaContent-ratio": aspectRatio } as React.CSSProperties}
        >
          {hasMedia ? (
            mediaKind === "video" ? (
              <video
                controls={mediaControls}
                src={media}
                aria-label={title || "Contenu média"}
                preload="metadata"
              >
                <track
                  kind="captions"
                  src={mediaCaptions ?? DEFAULT_CAPTIONS}
                  srcLang={mediaCaptionsLang}
                  label={mediaCaptionsLabel}
                  default
                />
              </video>
            ) : (
              <img src={media} alt={mediaAlt} loading="lazy" decoding="async" />
            )
          ) : (
            children
          )}
        </div>

        {title || caption || byline ? (
          <figcaption className="st-mediaContent__caption">
            {title ? <p className="st-mediaContent__title">{title}</p> : null}
            {caption ? <p>{caption}</p> : null}
            {byline ? <p className="st-mediaContent__byline">{byline}</p> : null}
          </figcaption>
        ) : null}
      </figure>
    );
  },
);

MediaContent.displayName = "MediaContent";
