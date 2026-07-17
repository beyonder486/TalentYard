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
          <div>
            <span className="project-card__badge" style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
              Status: {(project as any).status || "active"}
            </span>
          </div>
        </div>
        
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
                
                {(project as any).status !== "in_progress" && proposal.status === "Pending Review" && (
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
      
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}
