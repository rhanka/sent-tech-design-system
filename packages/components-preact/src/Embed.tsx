import type { HTMLAttributes } from "preact";
import { AspectRatio } from "./AspectRatio.js";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type EmbedProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "title"> & {
  /** URL of the embedded document (required). */
  src: string;
  /**
   * Accessible name of the frame (required for a11y — every iframe must carry a
   * meaningful `title`).
   */
  title: string;
  /**
   * `sandbox` token list. Defaults to `""` for the strictest sandbox. Pass your
   * own token list to relax it deliberately.
   */
  sandbox?: string;
  /** Aspect ratio of the frame container (CSS `aspect-ratio`). Default `16/9`. */
  aspectRatio?: string;
  /** `allow` permissions policy (e.g. `"fullscreen; picture-in-picture"`). */
  allow?: string;
  /** Iframe loading strategy. Default `lazy`; use `eager` for above-the-fold embeds. */
  loading?: "eager" | "lazy";
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export const Embed = forwardRef<HTMLDivElement, EmbedProps>(
  ({ src, title, sandbox = "", aspectRatio = "16/9", allow, loading = "lazy", className, ...rest }, ref) => {
    return (
      <div {...rest} ref={ref} className={classNames("st-embed", className)}>
        <AspectRatio ratio={aspectRatio}>
          <iframe
            className="st-embed__frame"
            src={src}
            title={title}
            sandbox={sandbox}
            allow={allow}
            loading={loading}
          />
        </AspectRatio>
      </div>
    );
  },
);

Embed.displayName = "Embed";
