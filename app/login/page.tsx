"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true);
    // Simulate brief async delay for UX feedback
    await new Promise((r) => setTimeout(r, 400));
    login(name, email);
    router.push("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-card__brand">
          <span className="auth-logo-icon">⚡</span>
          <span className="auth-logo-text">TalentYard</span>
        </div>
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">
          Sign in to manage your freelancer profile and find student gigs.
        </p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-name" className="form-label">Full Name</label>
            <input
              id="login-name"
              type="text"
              className="form-input"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Student Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <p className="form-error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            id="btn-login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn__spinner" aria-label="Signing in…" />
            ) : (
              "Sign In / Register"
            )}
          </button>
        </form>

        <p className="auth-card__note">
          New here? Just fill in your details — an account is created automatically.
        </p>

        <Link href="/" className="auth-card__back">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
