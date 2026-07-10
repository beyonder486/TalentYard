"use client";

import Link from "next/link";
import { FreelancerProfile } from "../context/ProfileContext";

interface ProfileCardProps {
  name: string;
  profile: FreelancerProfile | null;
  userId: string;
  compact?: boolean;
}

export default function ProfileCard({ name, profile, userId, compact = false }: ProfileCardProps) {
  function getInitials(n: string) {
    return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }

  const hasProfile = profile && (profile.bio || profile.hourlyRate > 0 || profile.skills.length > 0);

  return (
    <div className={`profile-card ${compact ? "profile-card--compact" : ""}`}>
      <div className="profile-card__header">
        <div className="profile-card__avatar">{getInitials(name)}</div>
        <div className="profile-card__meta">
          <h2 className="profile-card__name">{name}</h2>
          {profile?.hourlyRate ? (
            <span className="profile-card__rate">${profile.hourlyRate}/hr</span>
          ) : (
            <span className="profile-card__rate profile-card__rate--empty">Rate not set</span>
          )}
        </div>
      </div>

      {hasProfile ? (
        <>
          {profile.bio && (
            <p className="profile-card__bio">
              {compact && profile.bio.length > 120
                ? profile.bio.slice(0, 120) + "…"
                : profile.bio}
            </p>
          )}

          {profile.skills.length > 0 && (
            <div className="profile-card__skills" aria-label="Skills">
              {profile.skills.slice(0, compact ? 6 : undefined).map((skill) => (
                <span key={skill} className="skill-chip skill-chip--sm">
                  {skill}
                </span>
              ))}
              {compact && profile.skills.length > 6 && (
                <span className="skill-chip skill-chip--sm skill-chip--more">
                  +{profile.skills.length - 6}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="profile-card__empty">
          Your profile is empty — add your bio, rate and skills to attract clients!
        </p>
      )}

      <div className="profile-card__actions">
        <Link href="/profile/edit" className="btn btn--primary btn--sm" id="card-edit-profile">
          Edit Profile
        </Link>
        <Link href={`/profile/${userId}`} className="btn btn--ghost btn--sm" id="card-view-profile">
          View Public →
        </Link>
      </div>
    </div>
  );
}
