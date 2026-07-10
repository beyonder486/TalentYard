import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <span className="navbar__brand">
          <span className="navbar__logo-icon">⚡</span>
          <span className="navbar__logo-text">TalentYard</span>
        </span>
        <Link href="/login" className="btn btn--primary btn--sm" id="landing-signin">
          Sign In →
        </Link>
      </nav>

      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">TalentYard Beta</p>
          <h1>
            Student freelancing,{" "}
            <span className="gradient-text">made simple.</span>
          </h1>
          <p className="hero__desc">
            A marketplace built for students who want part-time earnings,
            real project experience, and community-driven work.
          </p>
          <div className="hero__ctas">
            <Link href="/login" className="btn btn--primary btn--lg" id="landing-get-started">
              Get Started Free
            </Link>
            <Link href="/dashboard" className="btn btn--ghost btn--lg" id="landing-dashboard">
              Go to Dashboard →
            </Link>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__glow" />
          <div className="hero__card-stack">
            <div className="hero__mock-card glass-card">
              <div className="hero__mock-avatar">AR</div>
              <div className="hero__mock-info">
                <strong>Alex Rivera</strong>
                <span>$28/hr</span>
              </div>
              <div className="hero__mock-chips">
                <span className="skill-chip skill-chip--sm">Python</span>
                <span className="skill-chip skill-chip--sm">React</span>
                <span className="skill-chip skill-chip--sm">UI Design</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="card-grid">
          <article id="feature-profiles">
            <span className="feature-icon">👤</span>
            <h2>Freelancer Profiles</h2>
            <p>Showcase your skills, bio, and hourly rate. Get discovered by student clients.</p>
          </article>
          <article id="feature-jobs">
            <span className="feature-icon">📋</span>
            <h2>Job Board &amp; Feed</h2>
            <p>Browse student-friendly gigs and discover new project opportunities.</p>
          </article>
          <article id="feature-bids">
            <span className="feature-icon">🏷️</span>
            <h2>Bidding &amp; Lifecycle</h2>
            <p>Submit proposals, negotiate terms, and manage project milestones.</p>
          </article>
          <article id="feature-reviews">
            <span className="feature-icon">⭐</span>
            <h2>Delivery &amp; Reviews</h2>
            <p>Deliver completed work, gather feedback, and build reputation.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
