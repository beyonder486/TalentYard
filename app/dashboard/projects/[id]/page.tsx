"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { supabase, ProjectListing } from "../../../lib/supabaseClient";
import Toast from "../../../components/Toast";

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string };
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<ProjectListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [hasBid, setHasBid] = useState(false);
  const [checkingBid, setCheckingBid] = useState(true);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) {
        setError("Project not found.");
      } else {
        setProject(data as ProjectListing);
      }
      setLoading(false);
    }
    
    fetchProject();
  }, [id]);

  useEffect(() => {
    async function checkExistingBid() {
      if (!currentUser || !id) {
        setCheckingBid(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("proposals")
        .select("id")
        .eq("project_id", id)
        .eq("student_id", currentUser.id)
        .maybeSingle();
        
      if (data) {
        setHasBid(true);
      }
      setCheckingBid(false);
    }
    
    checkExistingBid();
  }, [currentUser, id]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleProposalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !project) return;
    
    if (coverLetter.length < 100) {
      showToast("Cover letter must be at least 100 characters.", "error");
      return;
    }
    
    const amount = typeof bidAmount === "number" ? bidAmount : 0;
    if (amount <= 0) {
      showToast("Bid amount must be greater than $0.", "error");
      return;
    }
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from("proposals")
      .insert({
        project_id: project.id,
        student_id: currentUser.id,
        cover_letter: coverLetter,
        bid_amount: amount,
        status: "Pending Review"
      });
      
    setSubmitting(false);
    
    if (error) {
      showToast("Failed to submit proposal. Please try again.", "error");
      console.error(error);
    } else {
      setSubmitted(true);
      setHasBid(true);
      setShowProposalForm(false);
      showToast("Proposal submitted successfully!", "success");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="page-loading" aria-label="Loading…">
        <span className="spinner" />
      </div>
    );
  }

  if (!currentUser) return null;

  if (error || !project) {
    return (
      <>
        <Navbar />
        <main className="dashboard-page" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          <h2>{error || "Project not found"}</h2>
          <Link href="/dashboard/projects" className="btn btn--ghost" style={{ marginTop: "1rem" }}>
            ← Back to Projects
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="dashboard-page" style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        <Link href="/dashboard/projects" className="btn btn--ghost btn--sm" style={{ marginBottom: "2rem" }}>
          ← Back to Feed
        </Link>
        
        <article className="project-card glass-card" style={{ padding: "2.5rem", marginBottom: "2rem" }}>
          <div className="project-card__header" style={{ marginBottom: "1.5rem" }}>
            <div>
              <p className="project-card__client" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{project.client_name}</p>
              <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{project.title}</h1>
            </div>
            {project.remote !== undefined && (
              <span className="project-card__badge" style={{ alignSelf: "flex-start" }}>
                {project.remote ? "Remote" : "On-site"}
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: "2rem", lineHeight: "1.8", color: "var(--text-secondary)" }}>
            {project.description}
          </div>
          
          <div className="project-card__meta" style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>
            <span className="project-card__budget">Budget: ${project.budget?.toLocaleString() || "Negotiable"}</span>
            <span className="project-card__date">Posted: {new Date(project.posted_at || project.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
          
          {project.skills && project.skills.length > 0 && (
            <div className="project-card__skills" aria-label="Required skills" style={{ marginBottom: "2.5rem" }}>
              {project.skills.map((skill) => (
                <span key={skill} className="skill-chip">
                  {skill}
                </span>
              ))}
            </div>
          )}
          
          <div style={{ paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
            {checkingBid ? (
              <span className="spinner spinner--xs" />
            ) : hasBid ? (
              <button className="btn" disabled style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>
                Proposal Submitted
              </button>
            ) : !showProposalForm ? (
              <button 
                className="btn btn--primary" 
                onClick={() => setShowProposalForm(true)}
              >
                Submit Proposal
              </button>
            ) : null}
          </div>
        </article>

        {showProposalForm && !hasBid && (
          <section className="glass-card" style={{ padding: "2.5rem", animation: "fade-in 0.3s ease-out" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Submit your Proposal</h2>
            
            <form onSubmit={handleProposalSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="cover-letter" className="form-label">
                  Cover Letter
                  <span className="form-label__hint">Minimum 100 characters. Explain why you're a great fit.</span>
                </label>
                <textarea
                  id="cover-letter"
                  className="form-textarea"
                  rows={6}
                  style={{ width: "100%", padding: "1rem", borderRadius: "var(--radius-md)", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-input)", color: "var(--text-primary)" }}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Hi, I'm really interested in this project because..."
                />
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: coverLetter.length >= 100 ? "var(--success)" : "var(--text-muted)" }}>
                  {coverLetter.length} / 100 minimum characters
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label htmlFor="bid-amount" className="form-label">
                  Bid Amount (USD)
                  <span className="form-label__hint">Must be greater than $0</span>
                </label>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>$</span>
                  <input
                    id="bid-amount"
                    type="number"
                    style={{ padding: "0.75rem 1rem 0.75rem 2rem", borderRadius: "var(--radius-md)", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-input)", color: "var(--text-primary)" }}
                    min={1}
                    step={1}
                    value={bidAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setBidAmount(isNaN(val) ? "" : val);
                    }}
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="form-actions" style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting || coverLetter.length < 100 || (typeof bidAmount === 'number' && bidAmount <= 0)}
                >
                  {submitting ? <span className="btn__spinner" /> : "Submit Application"}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowProposalForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
        
        {submitted && (
          <section className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center", animation: "fade-in 0.3s ease-out", border: "1px solid var(--success)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ marginBottom: "1rem", color: "var(--success)" }}>Proposal Submitted Successfully!</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
              Your proposal has been sent to the client. You can track its status in your dashboard.
            </p>
            <Link href="/dashboard" className="btn btn--primary">
              Return to Dashboard
            </Link>
          </section>
        )}
        
      </main>
      
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}
