"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, ProjectListing } from "../../lib/supabaseClient";
import SkillTagInput from "../components/SkillTagInput";
import Link from "next/link";

const skillOptions = [
  "Next.js",
  "React",
  "UI Design",
  "Figma",
  "TypeScript",
  "SQL",
  "Python",
  "Product Design",
];

const budgetMarks = [
  { label: "$0", value: 0 },
  { label: "$500", value: 500 },
  { label: "$1k", value: 1000 },
  { label: "$2k+", value: 2000 },
];

function formatBudget(value: number) {
  if (value >= 2000) return "$2,000+";
  return `$${value.toLocaleString()}`;
}

export default function ProjectFeed() {
  const [projects, setProjects] = useState<ProjectListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetMax, setBudgetMax] = useState(2000);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);

      const query = supabase
        .from("projects")
        .select("id,title,description,skills,budget,posted_at,client_name,remote")
        .order("posted_at", { ascending: false });

      const { data, error: supabaseError } = await query;
      if (supabaseError) {
        setError("Unable to load project listings at this time.");
        setProjects([]);
      } else {
        setProjects(data ?? []);
      }

      setLoading(false);
    }

    void loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesBudget = project.budget <= budgetMax;
      const matchesSkills = selectedSkills.every((skill) =>
        project.skills?.map((value) => value.toLowerCase()).includes(skill.toLowerCase())
      );
      return matchesBudget && matchesSkills;
    });
  }, [projects, selectedSkills, budgetMax]);

  return (
    <section className="dashboard-section project-feed-section">
      <div className="project-feed-header">
        <div>
          <p className="eyebrow">Live Project Feed</p>
          <h2 className="section-title">From clients hiring student talent right now</h2>
          <p className="project-feed-copy">
            Filter matching projects by skills and budget, then review the newest opportunities first.
          </p>
        </div>

        <div className="project-filters glass-card">
          <div className="project-filter-group">
            <label htmlFor="selected-skills" className="project-filter-label">
              Required skills
            </label>
            <SkillTagInput
              tags={selectedSkills}
              onChange={setSelectedSkills}
              placeholder="Add skills like Next.js or UI Design"
            />
          </div>

          <div className="project-filter-group">
            <div className="project-filter-label-row">
              <label htmlFor="budget-range" className="project-filter-label">
                Maximum budget
              </label>
              <span className="project-filter-value">{formatBudget(budgetMax)}</span>
            </div>
            <input
              id="budget-range"
              type="range"
              min={0}
              max={2000}
              step={100}
              value={budgetMax}
              onChange={(event) => setBudgetMax(Number(event.target.value))}
              className="budget-range"
              aria-valuemin={0}
              aria-valuemax={2000}
            />
            <div className="budget-markers">
              {budgetMarks.map((mark) => (
                <span key={mark.value} className="budget-marker">
                  {mark.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="project-feed-loading" aria-live="polite">
          Loading latest projects…
        </div>
      ) : error ? (
        <div className="project-feed-error">{error}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="project-feed-empty glass-card">
          <strong>No active projects match your filters—try broadening your search.</strong>
          <p>Adjust your skills list or increase the maximum budget to see more student-ready opportunities.</p>
        </div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <article key={project.id} className="project-card glass-card">
              <div className="project-card__header">
                <div>
                  <p className="project-card__client">{project.client_name}</p>
                  <h3>{project.title}</h3>
                </div>
                <span className="project-card__badge">
                  {project.remote ? "Remote" : "On-site"}
                </span>
              </div>
              <p className="project-card__desc">{project.description}</p>
              <div className="project-card__meta">
                <span className="project-card__budget">Budget ${project.budget.toLocaleString()}</span>
                <span className="project-card__date">{new Date(project.posted_at).toLocaleDateString()}</span>
              </div>
              <div className="project-card__skills" aria-label="Required skills">
                {project.skills?.map((skill) => (
                  <span key={skill} className="skill-chip skill-chip--sm">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="project-card__footer" style={{ marginTop: "1rem" }}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="btn btn--primary btn--sm"
                  id={`btn-view-project-${project.id}`}
                  aria-label={`View details for ${project.title}`}
                >
                  View Details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
