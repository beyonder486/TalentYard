"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function FindTalentPage() {
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
      <main className="dashboard-page">
        <section className="dashboard-header">
          <div className="dashboard-header__text">
            <p className="eyebrow">Find Talent</p>
            <h1>
              Browse <span className="gradient-text">Freelancers & Students</span>
            </h1>
            <p className="dashboard-header__sub">
              This feature is coming soon! You will be able to search for talent by skills and availability here.
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🚧</span>
            <h2>Talent Directory Under Construction</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              We're working hard to bring you the best talent matching experience. Check back soon.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
