import type { BlockquoteHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";

export type QuoteProps = BlockquoteHTMLAttributes<HTMLQuoteElement> & {
  author?: ComponentChildren;
  source?: ComponentChildren;
};
export function Quote({ author, source, children, className, ...rest }: QuoteProps) {
  return (
    <blockquote {...rest} className={classNames("st-quote", className)}>
      <p className="st-quote__text">{children}</p>
      {author || source ? (
        <footer className="st-quote__attribution">
          {author ? <span className="st-quote__author">{author}</span> : null}
          {source ? <span className="st-quote__source">{source}</span> : null}
        </footer>
      ) : null}
    </blockquote>
  );
}
