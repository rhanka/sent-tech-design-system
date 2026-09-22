import React, { useState, useEffect, useCallback } from 'react';
import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { distinctSorted, buildBubbleFrame } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AnimatedBubbleChartProps = {
  /** Dashboard store (provides rows + model). */
  store: DashboardStore;
  /** View id for the cross-filter graph. */
  viewId: string;
  /** Measure id mapped to x-axis. */
  x: string;
  /** Measure id mapped to y-axis. */
  y: string;
  /** Measure id whose value scales the bubble radius. */
  size: string;
  /** Dimension (or measure) whose distinct values define the time steps. */
  time: string;
  /** Optional dimension whose values drive categorical tones + labels. */
  series?: string;
  /** Accessible label for the chart. */
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

export function AnimatedBubbleChart({
  store,
  viewId,
  x,
  y,
  size,
  time,
  series,
  label,
  width,
  height,
  className,
}: AnimatedBubbleChartProps) {
  // Trigger re-render on store changes.
  const state = useDashboard(store);
  void state;

  // ── Sorted time steps ───────────────────────────────────────────────────────
  const rows = store.applyCrossfilter(viewId);
  const steps = distinctSorted(rows, time);

  // ── Animation state ─────────────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Clamp index when steps shrink.
  const safeIndex = steps.length > 0 ? Math.min(stepIndex, steps.length - 1) : 0;

  useEffect(() => {
    if (!playing || steps.length === 0) return;
    const id = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1000);
    return () => clearInterval(id);
  }, [playing, steps.length]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStepIndex(Number(e.target.value));
    setPlaying(false);
  }, []);

  // ── Current frame ───────────────────────────────────────────────────────────
  const currentStep = steps[safeIndex] ?? '';
  const frameRows = rows.filter((row) => String(row[time]) === currentStep);
  const frame = buildBubbleFrame(store.model, frameRows, { x, y, size, series });

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--st-spacing-3, 12px)',
  };

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--st-spacing-2, 8px)',
    padding: '0 var(--st-spacing-2, 8px)',
  };

  const buttonStyle: React.CSSProperties = {
    minWidth: '2rem',
    aspectRatio: '1',
    border: '1px solid var(--st-color-border, #ccc)',
    borderRadius: 'var(--st-radius-sm, 4px)',
    background: 'var(--st-color-surface, #fff)',
    color: 'var(--st-color-text, inherit)',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle: React.CSSProperties = {
    minWidth: '4ch',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--st-color-text-muted, inherit)',
    fontSize: 'var(--st-font-size-sm, 0.875rem)',
  };

  return (
    <div
      className={['dataviz-animated-bubble', className].filter(Boolean).join(' ') || undefined}
      style={containerStyle}
    >
      <DsScatterPlot
        data={frame.data as ScatterPlotDatum[]}
        xLabel={frame.xLabel}
        yLabel={frame.yLabel}
        width={width}
        height={height}
        label={label}
      />

      <div role="group" aria-label="Contrôle temporel" style={controlsStyle}>
        <button
          type="button"
          aria-label={playing ? 'Pause' : 'Lecture'}
          onClick={togglePlay}
          style={buttonStyle}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={safeIndex}
          aria-label="Pas de temps"
          aria-valuetext={currentStep}
          onChange={handleSlider}
          style={{ flex: 1, accentColor: 'var(--st-color-accent, currentColor)' }}
        />

        <span
          aria-live="polite"
          aria-atomic="true"
          style={labelStyle}
        >
          {currentStep}
        </span>
      </div>
    </div>
  );
}
