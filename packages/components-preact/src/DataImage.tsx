import type { CSSProperties, ImgHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";
import { forwardRef } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type DataImageFit = "cover" | "contain";

export type DataImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "className" | "src" | "alt" | "width" | "height"
> & {
  /** Image URL (required). */
  src: string;
  /** Alternative text (required for a11y; pass "" only for purely decorative images). */
  alt: string;
  /** Intrinsic / box width (number → px, or any CSS length). */
  width?: number | string;
  /** Intrinsic / box height (number → px, or any CSS length). */
  height?: number | string;
  /** `object-fit` behaviour inside its box. Default `cover`. */
  fit?: DataImageFit;
  /** Border radius (CSS length). */
  radius?: number | string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

const len = (v: number | string | undefined) =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

export const DataImage = forwardRef<HTMLImageElement, DataImageProps>(
  ({ src, alt, width, height, fit = "cover", radius, className, style, loading = "lazy", decoding = "async", ...rest }, ref) => {
    const composed = mergeStyle(
      {
        width: len(width),
        height: len(height),
        borderRadius: len(radius),
      } as CSSProperties,
      style,
    );
    return (
      <img
        {...rest}
        ref={ref}
        className={classNames("st-dataImage", `st-dataImage--${fit}`, className)}
        src={src}
        alt={alt}
        style={composed as CSSProperties | undefined}
        loading={loading}
        decoding={decoding}
      />
    );
  },
);

DataImage.displayName = "DataImage";
