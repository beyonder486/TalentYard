"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Submission } from "../../types/submission";

interface Props {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (submission: Submission) => void;
}

const MIN_SUMMARY_LENGTH = 20;
const MAX_SUMMARY_LENGTH = 1000;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function SubmitDeliverablesModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [summary, setSummary] = useState("");
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus summary field when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => summaryRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Trap Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const reset = useCallback(() => {
    setSummary("");
    setDeliverableUrl("");
    setSummaryError("");
    setUrlError("");
    setServerError("");
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  function validateFields(): boolean {
    let valid = true;
    setSummaryError("");
    setUrlError("");
    setServerError("");

    if (summary.trim().length < MIN_SUMMARY_LENGTH) {
      setSummaryError(
        `Please write at least ${MIN_SUMMARY_LENGTH} characters describing the work done.`
      );
      valid = false;
    }

    if (!deliverableUrl.trim() || !isValidUrl(deliverableUrl.trim())) {
      setUrlError(
        "Enter a valid URL starting with http:// or https:// (e.g. https://github.com/you/repo)."
      );
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateFields()) return;

    setSubmitting(true);
    setServerError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_summary: summary.trim(),
          deliverable_url: deliverableUrl.trim(),
        }),
      });

      const data = (await response.json()) as
        | { submission: Submission }
        | { error: string };

      if (!response.ok) {
        setServerError(
          "error" in data ? data.error : "An unexpected error occurred."
        );
        setSubmitting(false);
        return;
      }

      reset();
      onSuccess(("submission" in data ? data.submission : null) as Submission);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const charCount = summary.length;
  const charWarn = charCount > MAX_SUMMARY_LENGTH * 0.85;

  return (
    <div
      className="submit-modal-overlay"
      aria-modal="true"
      role="dialog"
      aria-labelledby="submit-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="submit-modal" ref={dialogRef}>
        {/* Header */}
        <div className="submit-modal__header">
          <div className="submit-modal__header-text">
            <p className="eyebrow">Final Deliverables</p>
            <h2 id="submit-modal-title">Submit Your Work</h2>
            <p className="submit-modal__project-name">
              📁 {projectTitle}
            </p>
          </div>
          <button
            className="submit-modal__close"
            onClick={handleClose}
            aria-label="Close submission form"
            id="btn-close-submit-modal"
            disabled={submitting}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form
          className="submit-modal__form"
          onSubmit={handleSubmit}
          noValidate
          id="form-submit-deliverables"
        >
          {/* Summary */}
          <div className="form-group">
            <label
              htmlFor="submission-summary"
              className="form-label"
            >
              Work Summary
              <span className="form-label__hint">required · min {MIN_SUMMARY_LENGTH} chars</span>
            </label>
            <textarea
              id="submission-summary"
              ref={summaryRef}
              className={`form-input form-textarea${summaryError ? " form-input--error" : ""}`}
              placeholder="Describe what you built, the approach you took, any decisions you made, and where the deliverables can be found…"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (summaryError) setSummaryError("");
              }}
              maxLength={MAX_SUMMARY_LENGTH}
              rows={5}
              aria-describedby={summaryError ? "summary-error" : undefined}
              aria-invalid={!!summaryError}
              disabled={submitting}
            />
            <div className="submit-modal__summary-footer">
              {summaryError ? (
                <span className="form-error" id="summary-error" role="alert">
                  {summaryError}
                </span>
              ) : (
                <span />
              )}
              <span
                className={`char-counter${charWarn ? " char-counter--warn" : ""}`}
                aria-live="polite"
              >
                {charCount} / {MAX_SUMMARY_LENGTH}
              </span>
            </div>
          </div>

          {/* URL */}
          <div className="form-group">
            <label htmlFor="deliverable-url" className="form-label">
              Deliverable Link
              <span className="form-label__hint">required · must be a valid URL</span>
            </label>
            <input
              id="deliverable-url"
              type="url"
              className={`form-input${urlError ? " form-input--error" : ""}`}
              placeholder="https://github.com/you/project-repo"
              value={deliverableUrl}
              onChange={(e) => {
                setDeliverableUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              aria-describedby={urlError ? "url-error" : undefined}
              aria-invalid={!!urlError}
              disabled={submitting}
            />
            {urlError && (
              <span className="form-error" id="url-error" role="alert">
                {urlError}
              </span>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="submit-modal__server-error" role="alert">
              ⚠ {serverError}
            </div>
          )}

          {/* Footer actions */}
          <div className="submit-modal__footer">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleClose}
              disabled={submitting}
              id="btn-cancel-submission"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
              id="btn-confirm-submission"
            >
              {submitting ? (
                <>
                  <span className="btn__spinner" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                "Submit Deliverables →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
