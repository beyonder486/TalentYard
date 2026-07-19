"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../../lib/supabase";

export default function NewProjectPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(1000);
  const [skills, setSkills] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      
      const { error: submitError } = await supabase.from("projects").insert({
        title,
        description,
        budget_min: budgetMin,
        budget_max: budgetMax,
        skills: skillsArray,
        client_name: currentUser.name,
        status: "active",
        created_at: new Date().toISOString()
      });

      if (submitError) throw submitError;
      
      router.push("/dashboard/projects");
    } catch (err: any) {
      setError(err.message || "Failed to post project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <Link href="/dashboard" style={{ color: "var(--brand-primary)", textDecoration: "none", marginBottom: "2rem", display: "inline-block" }}>
          ← Back to Dashboard
        </Link>
        
        <section className="glass-card" style={{ padding: "3rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ marginBottom: "0.5rem" }}>Post a New Project</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Fill out the details below to attract top talent.
          </p>

          {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form" style={{ padding: 0 }}>
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input 
                type="text" 
                required 
                className="form-input" 
                placeholder="e.g. E-commerce Website Design"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                required 
                className="form-textarea" 
                placeholder="Describe the scope of work..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Min Budget ($)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  className="form-input" 
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Budget ($)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  className="form-input" 
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="React, UI Design, Next.js (comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn--primary btn--full" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Project"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
