"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import ProjectFeed from "../../components/ProjectFeed";
import { useAuth } from "../../context/AuthContext";

export default function ProjectsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [authLoading, currentUser, router]);

  if (authLoading) {
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
      <main className="projects-page">
        {/* Page header */}
        <section className="projects-page__header">
          <div className="projects-page__header-text">
            <p className="eyebrow">Browse Opportunities</p>
            <h1>
              Active Project{" "}
              <span className="gradient-text">Listings</span>
            </h1>
            <p className="projects-page__sub">
              Discover freelance projects that match your skills and budget expectations. Filters update results instantly.
            </p>
          </div>
        </section>

        {/* Feed */}
        <ProjectFeed />
      </main>
    </>
  );
}
