import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

type Tone = "neutral" | "info" | "success" | "warning" | "error";
export type HighlightTone = Tone;

export type HighlightProps = HTMLAttributes<HTMLElement> & {
  tone?: HighlightTone;
  title?: ComponentChildren;
};

export function Highlight({ tone = "neutral", title, children, className, ...rest }: HighlightProps) {
  return (
    <aside {...rest} className={classNames("st-highlight", `st-highlight--${tone}`, className)}>
      {title ? <h3 className="st-highlight__title">{title}</h3> : null}
      <div className="st-highlight__body">{children}</div>
    </aside>
  );
}
