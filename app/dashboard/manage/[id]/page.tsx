"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { supabase, ProjectListing } from "../../../lib/supabaseClient";
import Toast from "../../../components/Toast";

interface Proposal {
  id: string;
  project_id: string;
  student_id: string;
  cover_letter: string;
  bid_amount: number;
  status: string;
  created_at: string;
  student_name?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_id: string;
  reviewee_id: string;
  created_at: string;
}

export default function ManageProposalsPage() {
  const { id } = useParams() as { id: string };
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<ProjectListing | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const [review, setReview] = useState<Review | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [completing, setCompleting] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    async function fetchData() {
      if (!id || !currentUser) return;
      setLoading(true);
      
      // 1. Fetch project
      const { data: projData, error: projError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
        
      if (projError || !projData) {
        setError("Project not found.");
        setLoading(false);
        return;
      }
      setProject(projData as ProjectListing);

      // 2. Fetch proposals
      const { data: propData, error: propError } = await supabase
        .from("proposals")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (!propError && propData) {
        // Fetch student names (mocking the join since student_id is text without FK)
        const studentIds = Array.from(new Set(propData.map(p => p.student_id)));
        if (studentIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, name")
            .in("id", studentIds);
            
          const userMap = new Map((usersData || []).map(u => [u.id, u.name]));
          const proposalsWithNames = propData.map((p) => ({
            ...p,
            student_name: userMap.get(p.student_id) || "Anonymous Student"
          }));
          setProposals(proposalsWithNames);
        } else {
          setProposals(propData);
        }
      }

      // 3. Fetch review if completed
      if (projData.status === "completed") {
        const { data: revData } = await supabase
          .from("reviews")
          .select("*")
          .eq("project_id", id)
          .single();
        if (revData) setReview(revData as Review);
      }

      setLoading(false);
    }
    
    fetchData();
  }, [id, currentUser]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const confirmAccept = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleAcceptProposal = async () => {
    if (!selectedProposal || !project) return;
    
    setAccepting(true);
    
    // Call the RPC to do a secure transaction
    const { error } = await supabase.rpc("accept_proposal", {
      p_proposal_id: selectedProposal.id,
      p_project_id: project.id
    });
    
    setAccepting(false);
    setIsModalOpen(false);
    
    if (error) {
      console.error(error);
      showToast("Failed to accept proposal. Check if RPC is created.", "error");
    } else {
      showToast("Proposal accepted! Project is now in progress.", "success");
      
      // Update local state to reflect the transaction
      setProject({ ...project, status: "in_progress" } as any);
      setProposals(proposals.map(p => {
        if (p.id === selectedProposal.id) return { ...p, status: "accepted" };
        return { ...p, status: "declined" };
      }));
    }
  };

  const handleCompleteProject = async () => {
    if (!project || !currentUser) return;
    const acceptedProposal = proposals.find(p => p.status === "accepted");
    if (!acceptedProposal) return;

    if (reviewComment.length > 1000) {
      showToast("Review must not exceed 1000 characters.", "error");
      return;
    }

    setCompleting(true);

    const { error } = await supabase.rpc("complete_project", {
      p_project_id: project.id,
      p_reviewer_id: currentUser.id,
      p_reviewee_id: acceptedProposal.student_id,
      p_rating: rating,
      p_comment: reviewComment
    });

    setCompleting(false);

    if (error) {
      console.error(error);
      showToast("Failed to complete project. Check if RPC is created.", "error");
    } else {
      setIsReviewModalOpen(false);
      showToast("Project completed successfully!", "success");
      
      setProject({ ...project, status: "completed" } as any);
      setReview({
        id: "temp",
        project_id: project.id,
        reviewer_id: currentUser.id,
        reviewee_id: acceptedProposal.student_id,
        rating,
        comment: reviewComment,
        created_at: new Date().toISOString()
      });
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
          <Link href="/dashboard" className="btn btn--ghost" style={{ marginTop: "1rem" }}>
            ← Back to Dashboard
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="dashboard-page" style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <Link href="/dashboard" className="btn btn--ghost btn--sm" style={{ marginBottom: "1rem" }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ fontSize: "2rem" }}>Manage Proposals</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              For project: <strong>{project.title}</strong>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="project-card__badge" style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
              Status: {(project as any).status || "active"}
            </span>
            {(project as any).status === "in_progress" && (
              <button 
                className="btn btn--primary"
                onClick={() => setIsReviewModalOpen(true)}
              >
                Mark as Completed
              </button>
            )}
          </div>
        </div>

        {/* Read-only Archive View for Completed Projects */}
        {(project as any).status === "completed" && review && (
          <section className="glass-card" style={{ padding: "2rem", marginBottom: "2rem", border: "1px solid var(--success)" }}>
            <h2 style={{ color: "var(--success)", marginBottom: "1rem" }}>✅ Project Completed</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Rating:</span>
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} style={{ fontSize: "1.2rem", color: star <= review.rating ? "#f1c40f" : "var(--border-subtle)" }}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.15)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Client Feedback</h3>
              <p style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {review.comment}
              </p>
            </div>
          </section>
        )}
        
        <div className="proposals-grid" style={{ display: "grid", gap: "1.5rem" }}>
          {proposals.length === 0 ? (
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>No proposals received yet.</p>
            </div>
          ) : (
            proposals.map((proposal) => (
              <article key={proposal.id} className="project-card glass-card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                      {proposal.student_name}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      Submitted {new Date(proposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--brand-primary)", marginBottom: "0.25rem" }}>
                      ${proposal.bid_amount.toLocaleString()}
                    </div>
                    <span className="project-card__badge" style={{ 
                      background: proposal.status === "accepted" ? "rgba(46, 204, 113, 0.2)" : 
                                  proposal.status === "declined" ? "rgba(231, 76, 60, 0.2)" : "rgba(255,255,255,0.1)",
                      color: proposal.status === "accepted" ? "var(--success)" : 
                             proposal.status === "declined" ? "var(--error)" : "var(--text-secondary)"
                    }}>
                      {proposal.status}
                    </span>
                  </div>
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  <p style={{ whiteSpace: "pre-wrap" }}>{proposal.cover_letter}</p>
                </div>
                
                {(project as any).status === "active" && proposal.status === "Pending Review" && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button 
                      className="btn btn--primary" 
                      onClick={() => confirmAccept(proposal)}
                    >
                      Accept Proposal
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {isModalOpen && selectedProposal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)"
        }}>
          <div className="glass-card" style={{
            width: "100%", maxWidth: "500px", padding: "2.5rem",
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-lg)"
          }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>Confirm Acceptance</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.6" }}>
              Are you sure you want to accept <strong>{selectedProposal.student_name}'s</strong> proposal for <strong>${selectedProposal.bid_amount}</strong>? 
              <br /><br />
              This will officially change the project status to "In Progress" and immediately decline all other pending applications.
            </p>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button 
                className="btn btn--ghost" 
                onClick={() => setIsModalOpen(false)}
                disabled={accepting}
              >
                Cancel
              </button>
              <button 
                className="btn btn--primary" 
                onClick={handleAcceptProposal}
                disabled={accepting}
                style={{ minWidth: "140px" }}
              >
                {accepting ? <span className="btn__spinner" /> : "Yes, Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Complete Modal */}
      {isReviewModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)"
        }}>
          <div className="glass-card" style={{
            width: "100%", maxWidth: "600px", padding: "2.5rem",
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-lg)"
          }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Mark Project as Completed</h2>
            
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">
                Rating
                <span className="form-label__hint">Rate the student's work from 1 to 5</span>
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: "none", border: "none",
                      fontSize: "2rem", cursor: "pointer",
                      color: star <= rating ? "#f1c40f" : "var(--border-subtle)",
                      transition: "color 0.2s"
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label htmlFor="review-comment" className="form-label">
                Written Feedback
                <span className="form-label__hint">Share your experience (max 1000 characters)</span>
              </label>
              <textarea
                id="review-comment"
                className="form-textarea"
                rows={5}
                style={{ width: "100%", padding: "1rem", borderRadius: "var(--radius-md)", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-input)", color: "var(--text-primary)" }}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={1000}
                placeholder="The deliverables were great because..."
              />
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: reviewComment.length > 1000 ? "var(--error)" : "var(--text-muted)" }}>
                {reviewComment.length} / 1000 characters
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button 
                className="btn btn--ghost" 
                onClick={() => setIsReviewModalOpen(false)}
                disabled={completing}
              >
                Cancel
              </button>
              <button 
                className="btn btn--primary" 
                onClick={handleCompleteProject}
                disabled={completing || reviewComment.length > 1000 || rating < 1 || rating > 5}
                style={{ minWidth: "160px" }}
              >
                {completing ? <span className="btn__spinner" /> : "Submit & Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}
