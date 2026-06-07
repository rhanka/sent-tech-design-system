import React from "react";
import { classNames } from "./classNames.js";

export type DataImageFit = "cover" | "contain";

export type DataImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
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
  className?: string;
};

const len = (v: number | string | undefined) =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

export const DataImage = React.forwardRef<HTMLImageElement, DataImageProps>(
  ({ src, alt, width, height, fit = "cover", radius, className, style, loading = "lazy", decoding = "async", ...rest }, ref) => {
    const composed: React.CSSProperties = {
      width: len(width),
      height: len(height),
      borderRadius: len(radius),
      ...style,
    };
    return (
      <img
        {...rest}
        ref={ref}
        className={classNames("st-dataImage", `st-dataImage--${fit}`, className)}
        src={src}
        alt={alt}
        style={composed}
        loading={loading}
        decoding={decoding}
      />
    );
  },
);

DataImage.displayName = "DataImage";
