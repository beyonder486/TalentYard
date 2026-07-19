"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import ProjectFeed from "./ProjectFeed";
import { useAuth } from "../context/AuthContext";
import { useProfile, FreelancerProfile } from "../context/ProfileContext";

const clientCards = [
  { id: "post-project", icon: "➕", title: "Post a Project", desc: "Create a new project and find the perfect talent.", link: "/dashboard/projects/new" },
  { id: "my-projects", icon: "📁", title: "My Projects", desc: "Manage your active and completed projects.", link: "/dashboard/projects" },
  { id: "find-talent", icon: "🔍", title: "Find Talent", desc: "Browse freelancer and student profiles.", link: "/dashboard/talents" },
];

const freelancerCards = [
  { id: "jobs", icon: "📋", title: "Job Board", desc: "Browse open projects and freelance opportunities.", link: "/dashboard/projects" },
  { id: "bids", icon: "🏷️", title: "My Bids", desc: "Track your active proposals and negotiation status.", link: "#" },
  { id: "reviews", icon: "⭐", title: "Reviews", desc: "Your reputation score and client feedback.", link: "#" },
];

const studentCards = [
  { id: "gigs", icon: "🎓", title: "Student Gigs", desc: "Browse entry-level and student-friendly projects.", link: "/dashboard/projects" },
  { id: "mentorship", icon: "🤝", title: "Mentorship", desc: "Find mentors to guide your career path.", link: "#" },
  { id: "applications", icon: "📝", title: "Applications", desc: "Track your active applications and interviews.", link: "#" },
];

const mentorCards = [
  { id: "mentees", icon: "👥", title: "My Mentees", desc: "View and manage your active mentorships.", link: "#" },
  { id: "requests", icon: "📩", title: "Requests", desc: "Review incoming mentorship requests.", link: "#" },
  { id: "resources", icon: "📚", title: "Resources", desc: "Share materials and guides with your mentees.", link: "#" },
];

function ClientDashboard({ currentUser }: { currentUser: any }) {
  return (
    <main className="dashboard-page dashboard-page--client">
      {/* Header */}
      <section className="dashboard-header">
        <div className="dashboard-header__text">
          <p className="eyebrow">Client Dashboard</p>
          <h1>
            Hey, <span className="gradient-text">{currentUser.name.split(" ")[0]}</span> 👋
          </h1>
          <p className="dashboard-header__sub">
            Ready to find top talent for your next project? Linked account:{" "}
            <code className="user-id-badge">{currentUser.id}</code>
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="btn btn--primary" id="dash-post-project">
          ➕ Post a Project
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="dashboard-section">
        <h2 className="section-title">Client Tools</h2>
        <div className="dash-grid">
          {clientCards.map((card) => (
            <article key={card.id} className="dash-card glass-card" id={`dash-card-${card.id}`}>
              <span className="dash-card__icon">{card.icon}</span>
              <h3 className="dash-card__title">{card.title}</h3>
              <p className="dash-card__desc">{card.desc}</p>
              <Link href={card.link} className="btn btn--ghost btn--sm dash-card__link">
                Explore →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Active Projects Placeholder */}
      <section className="dashboard-section">
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.2rem' }}>Your Active Projects</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't posted any projects yet.</p>
          <Link href="/dashboard/projects/new" className="btn btn--ghost btn--sm">
            Post your first project
          </Link>
        </div>
      </section>
    </main>
  );
}

function TalentDashboard({ 
  currentUser, 
  profile, 
  role 
}: { 
  currentUser: any; 
  profile: FreelancerProfile | null; 
  role: string 
}) {
  const currentCards = role === "student" ? studentCards : role === "mentor" ? mentorCards : freelancerCards;
  const profileTitle = role === "student" ? "Your Student Profile" : role === "mentor" ? "Your Mentor Profile" : "Your Freelancer Profile";

  return (
    <main className="dashboard-page dashboard-page--talent">
      {/* Header */}
      <section className="dashboard-header">
        <div className="dashboard-header__text">
          <p className="eyebrow">{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</p>
          <h1>
            Welcome back, <span className="gradient-text">{currentUser.name.split(" ")[0]}</span> 👋
          </h1>
          <p className="dashboard-header__sub">
            Let's find your next big opportunity. Linked account:{" "}
            <code className="user-id-badge">{currentUser.id}</code>
          </p>
        </div>
        <Link href="/profile/edit" className="btn btn--primary" id="dash-edit-profile">
          ✏️ Edit Profile
        </Link>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Project Feed (Prominent for talent) */}
        {role !== "mentor" && (
          <section className="dashboard-section" style={{ marginBottom: 0 }}>
            <ProjectFeed />
          </section>
        )}

        {/* Two Columns for Features and Profile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {/* Feature Cards */}
          <section className="dashboard-section" style={{ flex: '1 1 500px', marginBottom: 0 }}>
            <h2 className="section-title">Platform Features</h2>
            <div className="dash-grid">
              {currentCards.map((card) => (
                <article key={card.id} className="dash-card glass-card" id={`dash-card-${card.id}`}>
                  <span className="dash-card__icon">{card.icon}</span>
                  <h3 className="dash-card__title">{card.title}</h3>
                  <p className="dash-card__desc">{card.desc}</p>
                  <Link href={card.link} className="btn btn--ghost btn--sm dash-card__link">
                    Explore →
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* Profile Card */}
          <section className="dashboard-section" style={{ flex: '1 1 300px', marginBottom: 0 }}>
            <h2 className="section-title">{profileTitle}</h2>
            <ProfileCard
              name={currentUser.name}
              profile={profile}
              userId={currentUser.id}
              compact
            />
          </section>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [authLoading, currentUser, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="page-loading" aria-label="Loading…">
        <span className="spinner" />
      </div>
    );
  }

  if (!currentUser) return null;

  const role = currentUser.role?.toLowerCase() || "freelancer";

  return (
    <>
      <Navbar />
      {role === "client" ? (
        <ClientDashboard currentUser={currentUser} />
      ) : (
        <TalentDashboard currentUser={currentUser} profile={profile} role={role} />
      )}
    </>
  );
}
