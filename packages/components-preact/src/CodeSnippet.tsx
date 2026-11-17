import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { CopyButton } from "./CopyButton.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

type AnyRecord = Record<string, unknown>;

export type CodeSnippetProps = HTMLAttributes<HTMLPreElement> & {
  code: string;
  language?: string;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  inline?: MaybeSignal<boolean>;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  copyable?: MaybeSignal<boolean>;
  copyLabel?: string;
  copiedLabel?: string;
};

export function CodeSnippet({
  code,
  language,
  inline: inlineInput = false,
  copyable: copyableInput = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
  ...rest
}: CodeSnippetProps) {
  const inline = useValue(inlineInput);
  const copyable = useValue(copyableInput);
  if (inline) {
    return (
      <code {...(rest as AnyRecord)} className={classNames("st-codeSnippet--inline", className)} data-language={language}>
        {code}
      </code>
    );
  }
  return (
    <div className="st-codeSnippet__wrapper">
      <pre {...(rest as AnyRecord)} className={classNames("st-codeSnippet", className)} data-language={language}>
        <code className="st-codeSnippet__code">{code}</code>
      </pre>
      {copyable ? (
        <span className="st-codeSnippet__copy">
          <CopyButton value={code} size="sm" label={copyLabel} copiedLabel={copiedLabel} />
        </span>
      ) : null}
    </div>
  );
}
