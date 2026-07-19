"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import SkillTagInput from "../../components/SkillTagInput";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

const MAX_BIO = 500;

export default function EditProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { profile, saveProfile, loading: profileLoading } = useProfile();
  const router = useRouter();

  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [skills, setSkills] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  const [isDirty, setIsDirty] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !currentUser) router.replace("/login");
  }, [authLoading, currentUser, router]);

  // Populate form from saved profile
  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? "");
      setHourlyRate(profile.hourlyRate > 0 ? profile.hourlyRate : "");
      setSkills(profile.skills ?? []);
      setCompanyName(profile.companyName ?? "");
      setIndustry(profile.industry ?? "");
    }
  }, [profile]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  function handleFieldChange(setter: Function) {
    return (val: any) => {
      setter(val);
      setIsDirty(true);
    };
  }

  function handleBioChange(val: string) {
    if (val.length <= MAX_BIO) { setBio(val); setIsDirty(true); }
  }

  function handleRateChange(val: string) {
    const n = parseFloat(val);
    setHourlyRate(val === "" ? "" : isNaN(n) ? "" : n);
    setIsDirty(true);
  }

  function handleSave(e?: FormEvent) {
    e?.preventDefault();
    const rate = typeof hourlyRate === "number" ? hourlyRate : 0;
    if (rate < 0) { showToast("Hourly rate must be 0 or more.", "error"); return; }
    saveProfile({ bio, hourlyRate: rate, skills, companyName, industry });
    setIsDirty(false);
    showToast("Profile saved successfully! 🎉");
  }

  // Auto-save on blur
  function handleFieldBlur() {
    if (isDirty) handleSave();
  }

  if (authLoading || profileLoading) {
    return <div className="page-loading"><span className="spinner" /></div>;
  }
  if (!currentUser) return null;

  const bioCharsLeft = MAX_BIO - bio.length;
  const isClient = currentUser.role?.toLowerCase() === "client";

  return (
    <>
      <Navbar />
      <main className="edit-profile-page">
        <div className="edit-profile-page__header">
          <div>
            <p className="eyebrow">{isClient ? "Client Profile Editor" : "Talent Profile Editor"}</p>
            <h1>Edit Your Profile</h1>
            <p className="edit-profile-page__uid">
              Account ID: <code className="user-id-badge">{currentUser.id}</code>
            </p>
          </div>
          <Link href={`/profile/${currentUser.id}`} className="btn btn--ghost" id="edit-view-public">
            View Public Profile →
          </Link>
        </div>

        <form
          className="profile-form glass-card"
          onSubmit={handleSave}
          id="profile-edit-form"
          noValidate
        >
          {isClient ? (
            <>
              {/* Client Fields */}
              <div className="form-group">
                <label htmlFor="company-name" className="form-label">
                  Company Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => handleFieldChange(setCompanyName)(e.target.value)}
                  onBlur={handleFieldBlur}
                />
              </div>

              <div className="form-group">
                <label htmlFor="industry" className="form-label">
                  Industry
                </label>
                <input
                  id="industry"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Technology, Finance, Healthcare"
                  value={industry}
                  onChange={(e) => handleFieldChange(setIndustry)(e.target.value)}
                  onBlur={handleFieldBlur}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-bio" className="form-label">
                  Company Description
                  <span className="form-label__hint">Tell freelancers about your business</span>
                </label>
                <textarea
                  id="profile-bio"
                  className="form-textarea"
                  rows={5}
                  placeholder="We are a fast-growing startup looking for top talent..."
                  value={bio}
                  onChange={(e) => handleBioChange(e.target.value)}
                  onBlur={handleFieldBlur}
                  maxLength={MAX_BIO}
                />
                <p className={`char-counter ${bioCharsLeft < 50 ? "char-counter--warn" : ""}`}>
                  {bioCharsLeft} characters remaining
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Talent Fields (Freelancer, Student, Mentor) */}
              <div className="form-group">
                <label htmlFor="profile-bio" className="form-label">
                  Bio
                  <span className="form-label__hint">Tell clients about yourself</span>
                </label>
                <textarea
                  id="profile-bio"
                  className="form-textarea"
                  rows={5}
                  placeholder="I'm a second-year CS student specialising in web development and data analysis…"
                  value={bio}
                  onChange={(e) => handleBioChange(e.target.value)}
                  onBlur={handleFieldBlur}
                  maxLength={MAX_BIO}
                />
                <p className={`char-counter ${bioCharsLeft < 50 ? "char-counter--warn" : ""}`}>
                  {bioCharsLeft} characters remaining
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="profile-rate" className="form-label">
                  Hourly Rate (USD)
                  <span className="form-label__hint">Set to 0 for project-based pricing</span>
                </label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    id="profile-rate"
                    type="number"
                    className="form-input form-input--prefixed"
                    placeholder="25"
                    min={0}
                    step={0.5}
                    value={hourlyRate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    onBlur={handleFieldBlur}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skills-input" className="form-label">
                  Skills
                  <span className="form-label__hint">Press Enter or comma to add a skill tag</span>
                </label>
                <SkillTagInput
                  tags={skills}
                  onChange={(val) => handleFieldChange(setSkills)(val)}
                  placeholder="e.g. Python, UI Design, Copywriting"
                />
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="form-actions">
            <button
              type="submit"
              className={`btn btn--primary ${isDirty ? "btn--pulse" : ""}`}
              id="btn-save-profile"
            >
              Save Profile
            </button>
            <Link href="/dashboard" className="btn btn--ghost" id="btn-back-dashboard">
              ← Back to Dashboard
            </Link>
            {profile?.updatedAt && (
              <span className="save-timestamp">
                Last saved: {new Date(profile.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </form>
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
