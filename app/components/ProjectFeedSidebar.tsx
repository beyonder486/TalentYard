"use client";

import { useRef, useCallback, useId } from "react";

const BUDGET_MIN = 0;
const BUDGET_MAX = 10000;

interface Props {
  skillQuery: string;
  budgetRange: [number, number];
  onSkillChange: (q: string) => void;
  onBudgetChange: (range: [number, number]) => void;
  onClear: () => void;
  isFiltering: boolean;
}

export default function ProjectFeedSidebar({
  skillQuery,
  budgetRange,
  onSkillChange,
  onBudgetChange,
  onClear,
  isFiltering,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const skillInputId = useId();

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;

  /* ── Dual-handle range slider logic ─────────────────────────── */
  const getPercent = useCallback(
    (val: number) => ((val - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100,
    []
  );

  const lowPct = getPercent(budgetRange[0]);
  const highPct = getPercent(budgetRange[1]);

  function handleLowChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.min(Number(e.target.value), budgetRange[1] - 100);
    onBudgetChange([val, budgetRange[1]]);
  }

  function handleHighChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(Number(e.target.value), budgetRange[0] + 100);
    onBudgetChange([budgetRange[0], val]);
  }

  return (
    <aside className="project-feed__sidebar glass-card" aria-label="Project filters">
      {/* Header */}
      <div className="sidebar__header">
        <h2 className="sidebar__title">
          <span className="sidebar__title-icon">⚙️</span>
          Filters
        </h2>
        {isFiltering && (
          <button
            className="sidebar__clear-btn"
            onClick={onClear}
            id="btn-clear-filters"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Skill Search ──────────────────────────────────────── */}
      <div className="sidebar__section">
        <label htmlFor={skillInputId} className="sidebar__section-label">
          🔍 Skill search
        </label>
        <div className="sidebar__skill-wrapper">
          <input
            id={skillInputId}
            type="text"
            className="form-input sidebar__skill-input"
            placeholder="e.g. React, UI Design…"
            value={skillQuery}
            onChange={(e) => onSkillChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="Filter projects by skill keyword"
          />
          {skillQuery && (
            <button
              className="sidebar__skill-clear"
              onClick={() => onSkillChange("")}
              aria-label="Clear skill search"
              tabIndex={0}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Budget Range ──────────────────────────────────────── */}
      <div className="sidebar__section">
        <span className="sidebar__section-label">💰 Budget range</span>
        <div className="sidebar__budget-display" aria-live="polite">
          <span className="sidebar__budget-val">{fmt(budgetRange[0])}</span>
          <span className="sidebar__budget-sep">–</span>
          <span className="sidebar__budget-val">{fmt(budgetRange[1])}</span>
        </div>

        {/* Dual-handle range slider */}
        <div className="budget-slider" ref={trackRef} role="group" aria-label="Budget range slider">
          {/* Filled track between thumbs */}
          <div
            className="budget-slider__fill"
            style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
            aria-hidden="true"
          />

          {/* Low thumb */}
          <input
            type="range"
            className="budget-slider__thumb budget-slider__thumb--low"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={100}
            value={budgetRange[0]}
            onChange={handleLowChange}
            aria-label="Minimum budget"
            aria-valuemin={BUDGET_MIN}
            aria-valuemax={BUDGET_MAX}
            aria-valuenow={budgetRange[0]}
            aria-valuetext={fmt(budgetRange[0])}
            id="slider-budget-low"
          />

          {/* High thumb */}
          <input
            type="range"
            className="budget-slider__thumb budget-slider__thumb--high"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={100}
            value={budgetRange[1]}
            onChange={handleHighChange}
            aria-label="Maximum budget"
            aria-valuemin={BUDGET_MIN}
            aria-valuemax={BUDGET_MAX}
            aria-valuenow={budgetRange[1]}
            aria-valuetext={fmt(budgetRange[1])}
            id="slider-budget-high"
          />
        </div>

        {/* Tick labels */}
        <div className="budget-slider__labels" aria-hidden="true">
          <span>$0</span>
          <span>$2.5k</span>
          <span>$5k</span>
          <span>$10k</span>
        </div>
      </div>

      {/* Active filter summary */}
      {isFiltering && (
        <div className="sidebar__active-summary" aria-live="polite">
          <span className="sidebar__active-dot" aria-hidden="true" />
          Filters active
        </div>
      )}
    </aside>
  );
}
