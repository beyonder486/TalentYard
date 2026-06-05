# TalentYard

TalentYard is a student freelancer marketplace built for students looking for part-time earnings, project experience, and reputation growth.

## Project Scope

This repository contains the initial Next.js boilerplate for TalentYard. The current scope is intentionally limited to a frontend starter setup. Supabase integration, authentication, database models, and backend services will be added in later development phases.

## Epics

The product is organized around these core epics in Jira:

- **User Management & Profiles**
  - Student registration and login
  - Profile creation and portfolio display
  - Skill tags, availability, and experience summary

- **Job Board & Homepage Feed**
  - Discoverable student-friendly gigs
  - Personalized homepage feed for job opportunities
  - Search and filters for categories, budgets, and deadlines

- **Bidding & Project Lifecycle**
  - Proposal submission and bid management
  - Negotiation and milestone tracking
  - Contract status and approvals

- **Project Delivery & Reviews**
  - Submission of completed work
  - Review and rating workflows
  - Reputation, testimonials, and project history

## Technology Stack

- **Next.js** for the frontend application
- **React** for UI components
- **TypeScript** for typed developer ergonomics
- **Supabase** planned for authentication, database, and storage

## Included Boilerplate

The initial scaffold includes:

- `app/layout.tsx` - application layout and metadata
- `app/page.tsx` - home page placeholder with epic summary
- `app/globals.css` - base styles for the app
- `package.json` - project scripts and dependencies
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - standard Node/Next ignore rules

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the site at:

```text
http://localhost:3000
```

## Scrum Master Notes

- This repository is the foundation for the developers working on the product backlog.
- Use Jira to manage the epics and user stories for each feature domain.
- Keep this boilerplate minimal until the team begins implementation of the first MVP features.

## Next Steps

- Add Supabase integration for authentication and persistent storage
- Build user profile pages and onboarding flows
- Create job posting and search/listing pages
- Implement bidding, milestone tracking, delivery workflows, and reviews
