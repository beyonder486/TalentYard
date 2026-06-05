export const dynamic = "force-static";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="content">
          <p className="eyebrow">TalentYard</p>
          <h1>Student freelancing made simple.</h1>
          <p>
            A marketplace built for students who want part-time earnings,
            project experience, and community-driven work.
          </p>
        </div>
        <div className="card-grid">
          <article>
            <h2>User Management & Profiles</h2>
            <p>Create accounts, manage student profiles, and showcase talent.</p>
          </article>
          <article>
            <h2>Job Board & Feed</h2>
            <p>Browse student-friendly gigs and discover new project opportunities.</p>
          </article>
          <article>
            <h2>Bidding & Lifecycle</h2>
            <p>Submit proposals, negotiate terms, and manage project milestones.</p>
          </article>
          <article>
            <h2>Delivery & Reviews</h2>
            <p>Deliver completed work, gather feedback, and build reputation.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
