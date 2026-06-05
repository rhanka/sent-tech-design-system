import React from "react";
import { classNames } from "./classNames.js";
import { Sparkline } from "./Sparkline.js";

export type KpiCardSize = "sm" | "md" | "lg";
export type KpiCardTrend = "up" | "down" | "flat";
export type KpiCardFormat = "number" | "currency" | "percent";
export type KpiCardDeltaFormat = "percent" | "absolute";
export type KpiCardTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type KpiCardProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  /**
   * Valeur principale affichée en grand. Le formatage `format` ne s'applique
   * qu'aux `number` (un `string` est rendu verbatim).
   *
   * Pour `format="percent"`, `Intl.NumberFormat` multiplie par 100 : passez une
   * **fraction** (0–1). Ex. `0.42` → « 42 % », et non `42` (qui donnerait « 4 200 % »).
   */
  value: number | string;
  /** Étiquette de l'indicateur (ex. « Revenu mensuel »). */
  label: string;
  /**
   * Variation par rapport à la période précédente.
   *
   * En `deltaFormat="percent"` (défaut), la valeur est multipliée par 100 :
   * passez une **fraction** (ex. `0.12` → « +12 % »).
   */
  delta?: number;
  /** Comment exprimer le delta : en pourcentage ou en valeur absolue. */
  deltaFormat?: KpiCardDeltaFormat;
  /** Tendance ; déduite du signe du delta si absente. */
  trend?: KpiCardTrend;
  /** Formatage de la valeur principale via Intl.NumberFormat. */
  format?: KpiCardFormat;
  /** Unité suffixée à la valeur (ex. « ms », « €/mois »). */
  unit?: string;
  /** Code devise ISO 4217 pour format="currency" (défaut EUR). */
  currency?: string;
  /** Locale BCP 47 pour le formatage des nombres (défaut undefined = locale du runtime). */
  locale?: string;
  /** Mini-graphique de tendance optionnel. */
  sparkline?: number[];
  size?: KpiCardSize;
  /** Couleur catégorielle pour l'accent (pastille discrète près de l'étiquette). */
  tone?: KpiCardTone;
  className?: string;
};

export function KpiCard({
  value,
  label,
  delta,
  deltaFormat = "percent",
  trend,
  format = "number",
  unit,
  currency = "EUR",
  locale,
  sparkline,
  size = "md",
  tone,
  className,
  ...rest
}: KpiCardProps) {
  const resolvedTrend: KpiCardTrend | undefined =
    trend ?? (delta == null ? undefined : delta > 0 ? "up" : delta < 0 ? "down" : "flat");

  const formattedValue = (() => {
    if (typeof value === "string") {
      return value;
    }
    // Intl rend "NaN"/"∞" pour les valeurs non finies : préférer un tiret cadratin.
    if (!Number.isFinite(value)) {
      return "—";
    }
    if (format === "currency") {
      try {
        return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
      } catch {
        // Code devise invalide → repli sur un nombre brut plutôt qu'une exception.
        return new Intl.NumberFormat(locale).format(value);
      }
    }
    if (format === "percent") {
      return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(value);
    }
    return new Intl.NumberFormat(locale).format(value);
  })();

  const formattedDelta = (() => {
    if (delta == null || !Number.isFinite(delta)) {
      return undefined;
    }
    const sign = delta > 0 ? "+" : "";
    if (deltaFormat === "percent") {
      const pct = new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(delta);
      return `${sign}${pct}`;
    }
    return `${sign}${new Intl.NumberFormat(locale).format(delta)}`;
  })();

  /** Le sparkline emprunte la couleur sémantique de la tendance. */
  const sparklineTone =
    resolvedTrend === "up" ? "success" : resolvedTrend === "down" ? "error" : "neutral";

  const arrow =
    resolvedTrend === "up"
      ? "M3 8.5 7 4l4 4.5"
      : resolvedTrend === "down"
        ? "M3 5.5 7 10l4-4.5"
        : "M3 7h8";

  const trendLabel =
    resolvedTrend === "up"
      ? "en hausse"
      : resolvedTrend === "down"
        ? "en baisse"
        : resolvedTrend === "flat"
          ? "stable"
          : undefined;

  const ariaLabel = [
    label,
    formattedValue,
    unit,
    formattedDelta && `${formattedDelta} ${trendLabel ?? ""}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      {...rest}
      className={classNames(
        "st-kpiCard",
        `st-kpiCard--${size}`,
        tone && `st-kpiCard--${tone}`,
        tone && "st-kpiCard--toned",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <p className="st-kpiCard__label">
        {tone ? <span className="st-kpiCard__swatch" aria-hidden="true" /> : null}
        {label}
      </p>

      <p className="st-kpiCard__value">
        <span className="st-kpiCard__number">{formattedValue}</span>
        {unit ? <span className="st-kpiCard__unit">{unit}</span> : null}
      </p>

      {formattedDelta || sparkline ? (
        <div className="st-kpiCard__footer">
          {formattedDelta ? (
            <span
              className={`st-kpiCard__delta st-kpiCard__delta--${resolvedTrend ?? "flat"}`}
              aria-hidden="true"
            >
              <svg
                className="st-kpiCard__arrow"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d={arrow}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="st-kpiCard__deltaValue">{formattedDelta}</span>
            </span>
          ) : null}

          {sparkline && sparkline.length > 0 ? (
            <Sparkline className="st-kpiCard__sparkline" data={sparkline} tone={sparklineTone} area />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
