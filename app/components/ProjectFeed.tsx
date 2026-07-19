"use client";

import { useState, useCallback, useMemo } from "react";
import ProjectCard from "./ProjectCard";
import ProjectFeedSidebar from "./ProjectFeedSidebar";
import ProjectEmptyState from "./ProjectEmptyState";
import { useProjects } from "../hooks/useProjects";

const DEFAULT_BUDGET: [number, number] = [0, 10000];

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="project-card skeleton-card"
      style={{ animationDelay: `${index * 120}ms` }}
      aria-hidden="true"
    >
      <div className="skeleton-card__row">
        <div className="skeleton skeleton--avatar" />
        <div className="skeleton-card__meta">
          <div className="skeleton skeleton--line skeleton--line-sm" />
          <div className="skeleton skeleton--line skeleton--line-xs" />
        </div>
        <div className="skeleton skeleton--badge" />
      </div>
      <div className="skeleton skeleton--line skeleton--line-title" />
      <div className="skeleton skeleton--line skeleton--line-md" />
      <div className="skeleton skeleton--line skeleton--line-sm" />
      <div className="skeleton-card__chips">
        <div className="skeleton skeleton--chip" />
        <div className="skeleton skeleton--chip" />
        <div className="skeleton skeleton--chip" />
      </div>
    </div>
  );
}

export default function ProjectFeed({ clientName }: { clientName?: string } = {}) {
  const [skillQuery, setSkillQuery] = useState("");
  const [budgetRange, setBudgetRange] = useState<[number, number]>(DEFAULT_BUDGET);

  const filters = useMemo(
    () => ({ skillQuery, budgetRange, clientName }),
    [skillQuery, budgetRange, clientName]
  );

  const { projects, loading, error } = useProjects(filters);

  const isFiltering =
    skillQuery.trim() !== "" ||
    budgetRange[0] !== DEFAULT_BUDGET[0] ||
    budgetRange[1] !== DEFAULT_BUDGET[1];

  const handleClear = useCallback(() => {
    setSkillQuery("");
    setBudgetRange(DEFAULT_BUDGET);
  }, []);

  return (
    <div className="project-feed">
      {/* Sidebar */}
      <ProjectFeedSidebar
        skillQuery={skillQuery}
        budgetRange={budgetRange}
        onSkillChange={setSkillQuery}
        onBudgetChange={setBudgetRange}
        onClear={handleClear}
        isFiltering={isFiltering}
      />

      {/* Main feed area */}
      <div className="project-feed__main">
        {/* Result count / status bar */}
        <div className="project-feed__bar">
          {loading ? (
            <span className="project-feed__count project-feed__count--loading">
              <span className="spinner spinner--xs" aria-hidden="true" />
              Loading projects…
            </span>
          ) : error ? (
            <span className="project-feed__count project-feed__count--error">
              ⚠ {error}
            </span>
          ) : (
            <span className="project-feed__count" aria-live="polite">
              {projects.length === 0
                ? "No projects found"
                : `${projects.length} active project${projects.length !== 1 ? "s" : ""}`}
              {isFiltering && (
                <span className="project-feed__filter-badge">filtered</span>
              )}
            </span>
          )}
          <span className="project-feed__sort-label" aria-label="Sorted by newest first">
            ↓ Newest first
          </span>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="project-feed__grid" aria-label="Loading projects">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="project-feed__error" role="alert">
            <p>⚠️ Could not load projects. Please check your connection and try again.</p>
            <p className="project-feed__error-detail">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <ProjectEmptyState onClear={handleClear} />
        )}

        {/* Cards grid */}
        {!loading && !error && projects.length > 0 && (
          <div
            className="project-feed__grid"
            role="feed"
            aria-label={`${projects.length} active project listings`}
          >
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
