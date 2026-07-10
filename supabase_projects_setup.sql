-- ============================================================
-- TalentYard — projects table
-- Run this in your Supabase project → SQL Editor
-- ============================================================

create table public.projects (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  skills      text[]      not null default '{}',
  budget_min  numeric     not null default 0,
  budget_max  numeric     not null default 0,
  client_name text,
  status      text        not null default 'active'
                          check (status in ('active', 'closed', 'draft')),
  created_at  timestamptz not null default now()
);

-- Row Level Security: allow any anonymous reader to SELECT active projects
alter table public.projects enable row level security;

create policy "anyone can read active projects"
  on public.projects
  for select
  using (status = 'active');

-- ── Sample seed data (optional) ─────────────────────────────
insert into public.projects (title, description, skills, budget_min, budget_max, client_name) values
  (
    'Build a Next.js SaaS landing page',
    'We need a high-converting landing page for our new B2B SaaS product. The page should include a hero, features grid, pricing table, and a contact form.',
    array['Next.js','React','TypeScript','Tailwind CSS'],
    500, 1500,
    'Acme Corp'
  ),
  (
    'UI/UX redesign for mobile banking app',
    'Redesign the core flows of our iOS/Android banking app: onboarding, dashboard, transaction history, and payments. Deliverable: Figma file + design system.',
    array['Figma','UI Design','UX Research','Prototyping'],
    1200, 3000,
    'FinTech Startup'
  ),
  (
    'Python data pipeline for e-commerce analytics',
    'Build an ETL pipeline that pulls order data from Shopify, transforms it, and loads it into BigQuery for BI dashboards.',
    array['Python','BigQuery','SQL','Airflow','Data Engineering'],
    800, 2500,
    'ShopBoost Inc'
  ),
  (
    'React Native cross-platform fitness app',
    'Develop v1 of a fitness tracking app: workout logging, progress charts, and push notifications. API integration with HealthKit and Google Fit.',
    array['React Native','TypeScript','Node.js','REST APIs'],
    2000, 5000,
    'FitTrack'
  ),
  (
    'WordPress to Webflow migration',
    'Migrate our 40-page marketing site from WordPress to Webflow. Preserve SEO, rebuild the blog CMS, and implement a new design from provided mockups.',
    array['Webflow','HTML','CSS','SEO','CMS'],
    600, 1200,
    'Marketing Agency'
  ),
  (
    'Machine learning model for churn prediction',
    'Train and deploy a customer churn prediction model using our CRM dataset (~50k rows). Deliverable: trained model + REST API endpoint + documentation.',
    array['Python','Machine Learning','scikit-learn','FastAPI','AWS'],
    1500, 4000,
    'SaaS Co'
  );
