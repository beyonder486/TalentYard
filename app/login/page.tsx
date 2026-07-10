"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { setCurrentUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your university email."); return; }
    if (!password.trim() || password.length < 10) { setError("Password must be at least 10 characters."); return; }
    if (!role.trim()) { setError("Please select a role."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = (await response.json().catch(() => null)) as { user?: { id: string; name: string; email: string; role: string }; error?: string } | null;

      if (!response.ok || !data?.user) {
        setError(data?.error ?? "Registration failed.");
        return;
      }

      setCurrentUser(data.user);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your university email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json().catch(() => null)) as { user?: { id: string; name: string; email: string; role: string }; error?: string } | null;

      if (!response.ok || !data?.user) {
        setError(data?.error ?? "Login failed.");
        return;
      }

      setCurrentUser(data.user);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-card__brand">
          <span className="auth-logo-icon">⚡</span>
          <span className="auth-logo-text">TalentYard</span>
        </div>
        <h1 className="auth-card__title">Welcome to TalentYard</h1>
        <p className="auth-card__subtitle">
          Create your student account or sign in with your university email and secure password.
        </p>

        <form className="auth-form" noValidate onSubmit={handleLogin}>
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
            <label htmlFor="login-role" className="form-label">Role</label>
            <select
              id="login-role"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Student">Student</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Client">Client</option>
              <option value="Mentor">Mentor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="login-email" className="form-label">University Email</label>
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

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="At least 10 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="form-error" role="alert">{error}</p>
          )}

          <div className="auth-form__actions">
            <button
              type="submit"
              className="btn btn--ghost btn--full"
              id="btn-login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn__spinner" aria-label="Signing in…" />
              ) : (
                "Sign In"
              )}
            </button>

            <button
              type="button"
              className="btn btn--primary btn--full"
              id="btn-register-submit"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <span className="btn__spinner" aria-label="Creating account…" />
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <p className="auth-card__note">
          New accounts are created with a salted PBKDF2 hash, and successful sign-in sets an httpOnly session cookie.
        </p>

        <Link href="/" className="auth-card__back">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
