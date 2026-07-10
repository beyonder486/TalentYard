"use client";

import type { Project } from "../../types/project";

function formatBudget(min: number, max: number) {
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
  return `${fmt(min)} – ${fmt(max)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getClientInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Props {
  project: Project;
  index: number;
}

const MAX_VISIBLE_SKILLS = 4;

export default function ProjectCard({ project, index }: Props) {
  const visibleSkills = project.skills.slice(0, MAX_VISIBLE_SKILLS);
  const overflowCount = project.skills.length - MAX_VISIBLE_SKILLS;

  return (
    <article
      className="project-card glass-card"
      id={`project-card-${project.id}`}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`Project: ${project.title}`}
    >
      {/* Header row */}
      <div className="project-card__header">
        <div className="project-card__client-avatar" aria-hidden="true">
          {getClientInitials(project.client_name)}
        </div>
        <div className="project-card__meta">
          <span className="project-card__client">
            {project.client_name ?? "Anonymous Client"}
          </span>
          <span className="project-card__time" title={project.created_at}>
            {timeAgo(project.created_at)}
          </span>
        </div>
        <span className="project-card__budget" aria-label="Budget range">
          {formatBudget(project.budget_min, project.budget_max)}
        </span>
      </div>

      {/* Title */}
      <h3 className="project-card__title">{project.title}</h3>

      {/* Description */}
      {project.description && (
        <p className="project-card__desc">{project.description}</p>
      )}

      {/* Skills */}
      {project.skills.length > 0 && (
        <div className="project-card__skills" aria-label="Required skills">
          {visibleSkills.map((skill) => (
            <span key={skill} className="skill-chip skill-chip--sm">
              {skill}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="skill-chip skill-chip--sm skill-chip--more">
              +{overflowCount} more
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="project-card__footer">
        <button
          className="btn btn--primary btn--sm"
          id={`btn-view-project-${project.id}`}
          aria-label={`View details for ${project.title}`}
        >
          View Details →
        </button>
        <span className="project-card__active-badge">● Active</span>
      </div>
    </article>
  );
}
