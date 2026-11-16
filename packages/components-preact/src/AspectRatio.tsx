import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";

export type AspectRatioProps = HTMLAttributes<HTMLDivElement> & { ratio?: number | string };
export function AspectRatio({ ratio = "16 / 9", className, style, children, ...rest }: AspectRatioProps) {
  const aspectRatio = typeof ratio === "number" ? String(ratio) : ratio;
  return (
    <div {...rest} className={classNames("st-aspectRatio", className)} style={{ aspectRatio, ...(style as CSSProperties | undefined) } as CSSProperties}>
      {children}
    </div>
  );
}
