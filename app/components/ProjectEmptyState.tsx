"use client";

interface Props {
  onClear: () => void;
}

export default function ProjectEmptyState({ onClear }: Props) {
  return (
    <div className="project-empty-state" role="status" aria-live="polite">
      {/* SVG Illustration */}
      <div className="project-empty-state__illustration" aria-hidden="true">
        <svg
          width="180"
          height="160"
          viewBox="0 0 180 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glow backdrop */}
          <ellipse cx="90" cy="140" rx="70" ry="12" fill="rgba(99,102,241,0.08)" />

          {/* Telescope body */}
          <rect
            x="68" y="70" width="56" height="28"
            rx="8"
            fill="rgba(99,102,241,0.15)"
            stroke="rgba(99,102,241,0.4)"
            strokeWidth="1.5"
          />
          {/* Telescope lens cap */}
          <rect
            x="112" y="76" width="24" height="16"
            rx="4"
            fill="rgba(99,102,241,0.25)"
            stroke="rgba(99,102,241,0.5)"
            strokeWidth="1.5"
          />
          {/* Telescope eye-piece */}
          <rect
            x="44" y="78" width="28" height="12"
            rx="3"
            fill="rgba(139,92,246,0.2)"
            stroke="rgba(139,92,246,0.5)"
            strokeWidth="1.5"
          />
          {/* Stand */}
          <path
            d="M90 98 L80 128 M90 98 L100 128"
            stroke="rgba(99,102,241,0.35)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M72 128 L108 128"
            stroke="rgba(99,102,241,0.35)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Stars */}
          <circle cx="148" cy="32" r="2.5" fill="rgba(99,102,241,0.7)" />
          <circle cx="36" cy="48" r="1.8" fill="rgba(139,92,246,0.6)" />
          <circle cx="160" cy="65" r="1.5" fill="rgba(99,102,241,0.5)" />
          <circle cx="22" cy="82" r="2" fill="rgba(139,92,246,0.4)" />
          <circle cx="142" cy="88" r="1.2" fill="rgba(99,102,241,0.5)" />

          {/* Dashed search circle */}
          <circle
            cx="136"
            cy="50"
            r="22"
            stroke="rgba(99,102,241,0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* Question mark inside circle */}
          <text
            x="136" y="57"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="rgba(99,102,241,0.55)"
            fontFamily="system-ui"
          >
            ?
          </text>
        </svg>
      </div>

      <h3 className="project-empty-state__title">No matches found</h3>
      <p className="project-empty-state__message">
        No active projects match your filters—try broadening your search.
      </p>
      <button
        className="btn btn--ghost btn--sm"
        onClick={onClear}
        id="btn-clear-filters-empty"
        aria-label="Clear all filters and show all projects"
      >
        ✕ Clear Filters
      </button>
    </div>
  );
}
