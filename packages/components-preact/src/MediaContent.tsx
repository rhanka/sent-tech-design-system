import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type MediaKind = "image" | "video";

export type MediaContentProps = Omit<HTMLAttributes<HTMLElement>, "className" | "children"> & {
  title?: string;
  caption?: string;
  byline?: string;
  media?: string;
  mediaAlt?: string;
  mediaKind?: MediaKind;
  mediaControls?: MaybeSignal<boolean>;
  aspectRatio?: string;
  mediaCaptions?: string;
  mediaCaptionsLabel?: string;
  mediaCaptionsLang?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
  children?: ComponentChildren;
};

const DEFAULT_CAPTIONS = "data:text/vtt,WEBVTT";

export const MediaContent = forwardRef<HTMLElement, MediaContentProps>(
  (
    {
      title,
      caption,
      byline,
      media,
      mediaAlt = "",
      mediaKind = "image",
      mediaControls: mediaControlsInput = true,
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
    const mediaControls = useValue(mediaControlsInput);
    const hasMedia = Boolean(media?.trim());

    return (
      <figure {...rest} ref={ref} className={classNames("st-mediaContent", className)}>
        <div
          className="st-mediaContent__media"
          style={{ "--st-mediaContent-ratio": aspectRatio } as CSSProperties}
        >
          {hasMedia ? (
            mediaKind === "video" ? (
              <video controls={mediaControls} src={media} aria-label={title || "Contenu média"} preload="metadata">
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
