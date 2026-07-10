"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import ProjectFeed from "./ProjectFeed";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

const placeholderCards = [
  { id: "jobs", icon: "📋", title: "Job Board", desc: "Browse student-friendly gigs and open projects.", link: "/dashboard/projects" },
  { id: "bids", icon: "🏷️", title: "My Bids", desc: "Track your active proposals and negotiation status.", link: "#" },
  { id: "reviews", icon: "⭐", title: "Reviews", desc: "Your reputation score and client feedback.", link: "#" },
];

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

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        {/* Header */}
        <section className="dashboard-header">
          <div className="dashboard-header__text">
            <p className="eyebrow">Dashboard</p>
            <h1>
              Hey, <span className="gradient-text">{currentUser.name.split(" ")[0]}</span> 👋
            </h1>
            <p className="dashboard-header__sub">
              Linked account:{" "}
              <code className="user-id-badge">{currentUser.id}</code>
            </p>
          </div>
          <Link href="/profile/edit" className="btn btn--primary" id="dash-edit-profile">
            ✏️ Edit Profile
          </Link>
        </section>

        {/* Profile Card */}
        <section className="dashboard-section">
          <h2 className="section-title">Your Freelancer Profile</h2>
          <ProfileCard
            name={currentUser.name}
            profile={profile}
            userId={currentUser.id}
            compact
          />
        </section>

        {/* Project Feed */}
        <ProjectFeed />

        {/* Feature Cards */}
        <section className="dashboard-section">
          <h2 className="section-title">Platform Features</h2>
          <div className="dash-grid">
            {placeholderCards.map((card) => (
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
      </main>
    </>
  );
}
