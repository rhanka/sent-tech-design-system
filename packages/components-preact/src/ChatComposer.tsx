import { Send } from "lucide-preact";
import type { FormHTMLAttributes } from "preact";
import { useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { textInput } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { unwrap } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ChatComposerProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  /** Seeds the draft. Plain value, or a signal in the Preact build (read once, untracked). */
  value?: MaybeSignal<string>;
  placeholder?: string;
  submitLabel?: ComponentChildren;
  onSubmit?: (payload: { value: string }) => void;
};

export function ChatComposer({
  value = "",
  placeholder = "Message",
  submitLabel = "Send",
  onSubmit,
  className,
  children,
  ...rest
}: ChatComposerProps) {
  const [draft, setDraft] = useState(() => unwrap(value));
  return (
    <form
      {...rest}
      className={classNames("st-chatComposer", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.({ value: draft });
      }}
    >
      <div className="st-chatComposer__body">
        <div className="st-chatComposer__inputShell">
          <textarea
            className="st-chatComposer__textarea st-chatComposer__input"
            placeholder={placeholder}
            value={draft}
            {...textInput<HTMLTextAreaElement>(setDraft)}
          />
        </div>
      </div>
      <div className="st-chatComposer__toolbar">
        <div className="st-chatComposer__actions st-chatComposer__actions--left">{children}</div>
        <div className="st-chatComposer__actions st-chatComposer__actions--right">
          <button type="submit" className="st-button st-button--primary st-button--md" disabled={draft.trim().length === 0}>
            <Send size={16} strokeWidth={2} aria-hidden="true" />
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
