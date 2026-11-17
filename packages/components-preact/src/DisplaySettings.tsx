import type { HTMLAttributes } from "preact";
import { useEffect, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import type { TargetedEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type DisplayFontScale = "normal" | "large" | "extra-large";
export type DisplayContrast = "default" | "high";
export type DisplayLineSpacing = "normal" | "comfortable";

export interface DisplaySettingsState {
  fontScale: DisplayFontScale;
  contrast: DisplayContrast;
  lineSpacing: DisplayLineSpacing;
  reducedMotion: boolean;
}

export type DisplaySettingsProps = Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "onChange"> & {
  title?: string;
  values?: MaybeSignal<Partial<DisplaySettingsState>>;
  showFontScale?: MaybeSignal<boolean>;
  showContrast?: MaybeSignal<boolean>;
  showLineSpacing?: MaybeSignal<boolean>;
  showReducedMotion?: MaybeSignal<boolean>;
  onChange?: (settings: DisplaySettingsState) => void;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

const DEFAULT_SETTINGS: DisplaySettingsState = {
  fontScale: "normal",
  contrast: "default",
  lineSpacing: "normal",
  reducedMotion: false,
};

export const DisplaySettings = forwardRef<HTMLDivElement, DisplaySettingsProps>(
  (
    {
      title = "Paramètres d’affichage",
      values: valuesInput,
      showFontScale: showFontScaleInput = true,
      showContrast: showContrastInput = true,
      showLineSpacing: showLineSpacingInput = true,
      showReducedMotion: showReducedMotionInput = true,
      onChange,
      className,
      ...rest
    },
    ref,
  ) => {
    const values = useValue(valuesInput ?? {});
    const showFontScale = useValue(showFontScaleInput);
    const showContrast = useValue(showContrastInput);
    const showLineSpacing = useValue(showLineSpacingInput);
    const showReducedMotion = useValue(showReducedMotionInput);
    const resolved: DisplaySettingsState = {
      fontScale: values?.fontScale ?? DEFAULT_SETTINGS.fontScale,
      contrast: values?.contrast ?? DEFAULT_SETTINGS.contrast,
      lineSpacing: values?.lineSpacing ?? DEFAULT_SETTINGS.lineSpacing,
      reducedMotion: values?.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion,
    };

    const [state, setState] = useState<DisplaySettingsState>(resolved);

    useEffect(() => {
      setState((prev) =>
        prev.fontScale === resolved.fontScale &&
        prev.contrast === resolved.contrast &&
        prev.lineSpacing === resolved.lineSpacing &&
        prev.reducedMotion === resolved.reducedMotion
          ? prev
          : { ...prev, ...resolved },
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolved.fontScale, resolved.contrast, resolved.lineSpacing, resolved.reducedMotion]);

    const update = (next: Partial<DisplaySettingsState>) => {
      const merged = { ...state, ...next };
      setState(merged);
      onChange?.(merged);
    };

    return (
      <div {...rest} ref={ref} className={classNames("st-displaySettings", className)}>
        <p className="st-displaySettings__title">{title}</p>

        <div className="st-displaySettings__grid">
          {showFontScale ? (
            <label className="st-displaySettings__field">
              <span className="st-displaySettings__label">Taille de texte</span>
              <select
                value={state.fontScale}
                onChange={(event: TargetedEvent<HTMLSelectElement>) =>
                  update({ fontScale: event.currentTarget.value as DisplayFontScale })
                }
              >
                <option value="normal">Normale</option>
                <option value="large">Grande</option>
                <option value="extra-large">Très grande</option>
              </select>
            </label>
          ) : null}

          {showContrast ? (
            <label className="st-displaySettings__field">
              <span className="st-displaySettings__label">Contraste</span>
              <select
                value={state.contrast}
                onChange={(event: TargetedEvent<HTMLSelectElement>) =>
                  update({ contrast: event.currentTarget.value as DisplayContrast })
                }
              >
                <option value="default">Standard</option>
                <option value="high">Élevé</option>
              </select>
            </label>
          ) : null}

          {showLineSpacing ? (
            <label className="st-displaySettings__field">
              <span className="st-displaySettings__label">Interligne</span>
              <select
                value={state.lineSpacing}
                onChange={(event: TargetedEvent<HTMLSelectElement>) =>
                  update({ lineSpacing: event.currentTarget.value as DisplayLineSpacing })
                }
              >
                <option value="normal">Normal</option>
                <option value="comfortable">Confortable</option>
              </select>
            </label>
          ) : null}

          {showReducedMotion ? (
            <label className="st-displaySettings__field st-displaySettings__field--switch">
              <span className="st-displaySettings__label">Animations (réduction)</span>
              <input
                type="checkbox"
                role="switch"
                checked={state.reducedMotion}
                onChange={(event: TargetedEvent<HTMLInputElement>) =>
                  update({ reducedMotion: event.currentTarget.checked })
                }
              />
            </label>
          ) : null}
        </div>
      </div>
    );
  },
);

DisplaySettings.displayName = "DisplaySettings";
