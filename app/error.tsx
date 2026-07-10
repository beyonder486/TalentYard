"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("TalentYard error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(222, 30%, 7%)",
        color: "hsl(210, 20%, 95%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "2rem",
        textAlign: "center",
        gap: "1.5rem",
      }}
    >
      <div style={{ fontSize: "3rem" }}>⚡</div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, hsl(249,90%,65%), hsl(280,90%,68%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          color: "hsl(210, 10%, 65%)",
          maxWidth: "40ch",
          lineHeight: 1.7,
          fontSize: "1rem",
        }}
      >
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          id="btn-error-retry"
          onClick={reset}
          style={{
            padding: "0.7rem 1.75rem",
            borderRadius: "999px",
            background: "linear-gradient(135deg, hsl(249,90%,65%), hsl(280,90%,68%))",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            border: "none",
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          id="btn-error-home"
          style={{
            padding: "0.7rem 1.75rem",
            borderRadius: "999px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "hsl(210,10%,65%)",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          ← Home
        </Link>
      </div>
      {error.digest && (
        <p style={{ fontSize: "0.75rem", color: "hsl(210,10%,35%)", fontFamily: "monospace" }}>
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
