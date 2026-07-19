"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../../lib/supabase";
import type { Project } from "../../../../types/project";

interface Proposal {
  id: string;
  project_id: string;
  student_id: string;
  student_name?: string;
  bid_amount: number;
  cover_letter: string;
  status: string;
  created_at: string;
}

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Proposal form fields
  const [proposedRate, setProposedRate] = useState<number | "">("");
  const [coverLetter, setCoverLetter] = useState("");

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        // Fetch project
        const { data: projData, error: projError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (projError) throw projError;
        setProject(projData as Project);

        // Fetch proposals if user is the client who owns it
        if (currentUser && currentUser.role?.toLowerCase() === "client" && projData.client_name === currentUser.name) {
          const { data: propData, error: propError } = await supabase
            .from("proposals")
            .select("*")
            .eq("project_id", id)
            .order("created_at", { ascending: false });

          if (!propError && propData) {
            const studentIds = propData.map((p: any) => p.student_id);
            const { data: usersData } = await supabase
              .from("users")
              .select("id, name")
              .in("id", studentIds);
            
            const userMap = new Map(usersData?.map((u: any) => [u.id, u.name]) || []);
            
            const formattedProposals = propData.map((p: any) => ({
              ...p,
              student_name: userMap.get(p.student_id) || "Student Freelancer"
            }));
            setProposals(formattedProposals);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project details");
      } finally {
        setLoading(false);
      }
    }
    
    if (currentUser) {
      fetchData();
    }
  }, [id, currentUser]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id || typeof proposedRate !== "number") return;
    
    setSubmitting(true);
    if (coverLetter.length < 100) {
      alert("Cover letter must be at least 100 characters.");
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from("proposals").insert({
        project_id: id,
        student_id: currentUser.id,
        bid_amount: proposedRate,
        cover_letter: coverLetter,
        status: 'Pending Review'
      });

      if (error) throw error;
      setIsSubmitted(true);
    } catch (err: any) {
      alert("Failed to submit proposal: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const { error } = await supabase
        .from("proposals")
        .update({ status: 'Accepted' })
        .eq("id", proposalId);

      if (error) throw error;
      
      // Update local state so UI reflects it immediately
      setProposals(prev => prev.map(p => 
        p.id === proposalId ? { ...p, status: 'Accepted' } : p
      ));
      
      alert("Proposal accepted successfully!");
    } catch (err: any) {
      alert("Failed to accept proposal: " + (err.message || "Unknown error"));
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
        <main className="projects-page" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <h2>Oops!</h2>
          <p>{error || "Project not found."}</p>
          <Link href="/dashboard/projects" className="btn btn--primary" style={{ marginTop: "1rem" }}>
            ← Back to Projects
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="projects-page" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <Link href="/dashboard/projects" style={{ color: "var(--color-primary)", textDecoration: "none", marginBottom: "2rem", display: "inline-block" }}>
          ← Back to Projects
        </Link>
        
        <article className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ margin: "0 0 0.5rem 0" }}>{project.title}</h1>
              <div style={{ color: "var(--color-text-muted)" }}>
                Posted by <strong>{project.client_name || "Anonymous Client"}</strong> • {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="project-card__active-badge" style={{ marginTop: 0 }}>
              ● {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </div>
          </div>

          <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Budget Range</span>
            <strong style={{ fontSize: "1.5rem", color: "var(--color-primary)" }}>
              ${project.budget_min.toLocaleString()} - ${project.budget_max.toLocaleString()}
            </strong>
          </div>

          <div>
            <h3 style={{ marginBottom: "1rem" }}>Description</h3>
            <p style={{ lineHeight: "1.6", color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>
              {project.description || "No description provided."}
            </p>
          </div>

          {project.skills && project.skills.length > 0 && (
            <div>
              <h3 style={{ marginBottom: "1rem" }}>Required Skills</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {project.skills.map((skill) => (
                  <span key={skill} className="skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentUser?.role?.toLowerCase() === "client" ? (
            project.client_name === currentUser.name ? (
              <div style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 style={{ marginBottom: "1rem" }}>Proposals Received ({proposals.length})</h3>
                {proposals.length === 0 ? (
                  <p style={{ color: "var(--color-text-muted)" }}>No proposals received yet.</p>
                ) : (
                  proposals.map((p) => (
                    <div key={p.id} className="glass-card" style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{p.student_name}</strong>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                            Proposed ${Number(p.bid_amount).toLocaleString()} • {new Date(p.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button className="btn btn--primary btn--sm" onClick={() => setSelectedProposal(selectedProposal?.id === p.id ? null : p)}>
                          {selectedProposal?.id === p.id ? "Close" : "Review"}
                        </button>
                      </div>
                      {selectedProposal?.id === p.id && (
                        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                          <h4 style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Cover Letter:</h4>
                          <p style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-wrap", margin: 0 }}>
                            {p.cover_letter}
                          </p>
                          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                            <Link href={`/profile/${p.student_id}`} className="btn btn--secondary btn--sm">View Profile</Link>
                            {p.status === 'Accepted' ? (
                              <span className="btn btn--ghost btn--sm" style={{ color: "var(--color-success)", borderColor: "var(--color-success)" }}>✓ Accepted</span>
                            ) : (
                              <button 
                                className="btn btn--primary btn--sm" 
                                onClick={() => handleAcceptProposal(p.id)}
                              >
                                Accept Proposal
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>
                  You are viewing another client's project.
                </p>
              </div>
            )
          ) : (
            <div style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "1rem" }}>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => setIsModalOpen(true)}>Submit Proposal</button>
              <button className="btn btn--secondary" style={{ flex: 1 }}>Save Project</button>
            </div>
          )}
        </article>
      </main>

      {/* Proposal Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-card" style={{ padding: "2rem", width: "100%", maxWidth: "500px" }}>
            <h2 style={{ marginTop: 0 }}>Submit Proposal</h2>
            {isSubmitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Proposal Sent!</h3>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>The client will review your application soon.</p>
                <button className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>Close Window</button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProposal} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>Proposed Rate ($)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 1000" 
                    value={proposedRate}
                    onChange={(e) => setProposedRate(Number(e.target.value))}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white", fontSize: "1rem" }} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>Cover Letter</label>
                  <textarea 
                    required 
                    rows={5} 
                    placeholder="Why are you a good fit?" 
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white", fontSize: "1rem", resize: "vertical" }} 
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="button" className="btn btn--secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn--primary" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? "Sending..." : "Send Proposal"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
