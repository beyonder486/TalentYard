"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { FreelancerProfile, readPublicProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// We store the user name in localStorage too so the public view can display it
function readUserName(userId: string): string {
  try {
    const raw = localStorage.getItem("ty_user");
    if (!raw) return "Unknown Student";
    const user = JSON.parse(raw);
    return user.id === userId ? user.name : "Student Freelancer";
  } catch {
    return "Student Freelancer";
  }
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [userName, setUserName] = useState("Student Freelancer");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (userId) {
      setProfile(readPublicProfile(userId));
      setUserName(readUserName(userId));
      setLoaded(true);
    }
  }, [userId]);

  const isOwnProfile = currentUser?.id === userId;

  if (!loaded) {
    return <div className="page-loading"><span className="spinner" /></div>;
  }

  return (
    <>
      <Navbar />
      <main className="public-profile-page">
        {/* Hero banner */}
        <div className="public-profile__banner" aria-hidden="true" />

        <div className="public-profile__body">
          {/* Avatar + name */}
          <div className="public-profile__identity">
            <div className="public-profile__avatar">{getInitials(userName)}</div>
            <div>
              <h1 className="public-profile__name">{userName}</h1>
              <p className="public-profile__uid">
                ID: <code className="user-id-badge user-id-badge--sm">{userId}</code>
              </p>
              {profile?.hourlyRate ? (
                <span className="rate-badge">${profile.hourlyRate} / hr</span>
              ) : (
                <span className="rate-badge rate-badge--empty">Project-based pricing</span>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile?.bio ? (
            <section className="public-profile__section" aria-labelledby="bio-heading">
              <h2 id="bio-heading" className="public-profile__section-title">About</h2>
              <p className="public-profile__bio">{profile.bio}</p>
            </section>
          ) : (
            <div className="public-profile__empty-section">
              <p>No bio added yet.</p>
            </div>
          )}

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 ? (
            <section className="public-profile__section" aria-labelledby="skills-heading">
              <h2 id="skills-heading" className="public-profile__section-title">Skills</h2>
              <div className="public-profile__skills">
                {profile.skills.map((skill) => (
                  <span key={skill} className="skill-chip skill-chip--lg">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          ) : (
            <div className="public-profile__empty-section">
              <p>No skills listed yet.</p>
            </div>
          )}

          {/* Actions */}
          <div className="public-profile__actions">
            {isOwnProfile ? (
              <Link href="/profile/edit" className="btn btn--primary" id="pub-edit-own">
                ✏️ Edit My Profile
              </Link>
            ) : (
              <button className="btn btn--primary" id="pub-hire-me" disabled>
                Hire Me (Coming Soon)
              </button>
            )}
            <Link href="/dashboard" className="btn btn--ghost" id="pub-back-dash">
              ← Dashboard
            </Link>
          </div>

          {profile?.updatedAt && (
            <p className="public-profile__updated">
              Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
