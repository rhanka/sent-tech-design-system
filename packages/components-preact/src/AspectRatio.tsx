import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";

export type AspectRatioProps = HTMLAttributes<HTMLDivElement> & { ratio?: number | string };
export function AspectRatio({ ratio = "16 / 9", className, style, children, ...rest }: AspectRatioProps) {
  const aspectRatio = typeof ratio === "number" ? String(ratio) : ratio;
  return (
    <div {...rest} className={classNames("st-aspectRatio", className)} style={mergeStyle({ aspectRatio } as CSSProperties, style) as CSSProperties | undefined}>
      {children}
    </div>
  );
}
