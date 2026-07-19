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

import { supabase } from "../../../lib/supabase";

async function fetchUserInfo(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("name, role")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { name: data.name, role: data.role };
  } catch {
    return { name: "Unknown User" };
  }
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (userId) {
        setProfile(readPublicProfile(userId));
        const info = await fetchUserInfo(userId);
        setUserName(info.name);
        setUserRole(info.role);
        setLoaded(true);
      }
    }
    loadData();
  }, [userId]);

  const isOwnProfile = currentUser?.id === userId;
  const isClientProfile = (isOwnProfile && currentUser?.role?.toLowerCase() === "client") || 
                          profile?.companyName || 
                          profile?.industry || 
                          userRole?.toLowerCase() === "client";

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
              {!isClientProfile && (
                profile?.hourlyRate ? (
                  <span className="rate-badge">${profile.hourlyRate} / hr</span>
                ) : (
                  <span className="rate-badge rate-badge--empty">Project-based pricing</span>
                )
              )}
            </div>
          </div>

          {/* Client specifics */}
          {isClientProfile && (profile?.companyName || profile?.industry) && (
            <section className="public-profile__section">
              <h2 className="public-profile__section-title">Company Info</h2>
              {profile?.companyName && <p style={{ marginBottom: "0.5rem" }}><strong>Company:</strong> {profile.companyName}</p>}
              {profile?.industry && <p><strong>Industry:</strong> {profile.industry}</p>}
            </section>
          )}

          {/* Bio */}
          {profile?.bio ? (
            <section className="public-profile__section" aria-labelledby="bio-heading">
              <h2 id="bio-heading" className="public-profile__section-title">
                {isClientProfile ? "About Company" : "About"}
              </h2>
              <p className="public-profile__bio">{profile.bio}</p>
            </section>
          ) : (
            <div className="public-profile__empty-section">
              <p>No description added yet.</p>
            </div>
          )}

          {/* Skills (Only for Talent) */}
          {!isClientProfile && (
            profile?.skills && profile.skills.length > 0 ? (
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
            )
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
