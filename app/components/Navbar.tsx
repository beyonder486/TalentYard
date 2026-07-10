"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        <Link href={currentUser ? "/dashboard" : "/"} className="navbar__brand" aria-label="TalentYard home">
          <span className="navbar__logo-icon">⚡</span>
          <span className="navbar__logo-text">TalentYard</span>
        </Link>

        <nav className="navbar__nav" aria-label="Main navigation">
          {currentUser ? (
            <>
              <Link href="/dashboard" className="navbar__link" id="nav-dashboard">
                Dashboard
              </Link>
              <Link href="/profile/edit" className="navbar__link" id="nav-edit-profile">
                Edit Profile
              </Link>
              <Link
                href={`/profile/${currentUser.id}`}
                className="navbar__link"
                id="nav-view-profile"
              >
                My Profile
              </Link>
            </>
          ) : (
            <Link href="/login" className="navbar__link" id="nav-login">
              Sign In
            </Link>
          )}
        </nav>

        {currentUser ? (
          <div className="navbar__user">
            <Link href={`/profile/${currentUser.id}`} className="navbar__avatar" aria-label="View profile">
              {getInitials(currentUser.name)}
            </Link>
            <button
              className="navbar__logout"
              onClick={handleLogout}
              id="btn-logout"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn btn--primary btn--sm" id="nav-cta">
            Get Started
          </Link>
        )}
      </div>
    </header>
  );
}
