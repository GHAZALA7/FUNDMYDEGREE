# FundMyDegree — Setup Guide

Everything is free. No credit card needed.

---

## Step 1 — Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and sign in with GitHub
2. Click **New Project** → give it a name like `fundmydegree`
3. Choose a region close to Canada (e.g. `us-east-1`)
4. Once the project is ready, go to **SQL Editor**
5. Paste the entire contents of `supabase/schema.sql` and click **Run**

**Get your API keys:**
- Go to **Settings → API**
- Copy the `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
- Copy the `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 2 — Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/fundmydegree.git
cd fundmydegree

# 2. Install Node dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Open .env.local and fill in the three Supabase values

# 4. Start the dev server
npm run dev
# Open http://localhost:3000
```

---

## Step 3 — Push to GitHub

```bash
git init  # if not already a git repo
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fundmydegree.git
git push -u origin main
```

---

## Step 4 — Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → select your `fundmydegree` repo
3. Add environment variables (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** — your site will be live in ~2 minutes
5. Point `fundmydegree.com` to Vercel (Settings → Domains)

---

## Step 5 — Set Up GitHub Actions Secrets (for scraper)

The scraper runs automatically via GitHub Actions. It needs the Supabase keys as secrets.

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** and add:
   - `SUPABASE_URL` — same as `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` — the secret service role key

The scraper will now:
- Run **every Sunday at 2 AM UTC** (weekly scrape)
- Run **on the 1st of every month at 3 AM UTC** (monthly cleanup)

You can also trigger either manually: **Actions → Select workflow → Run workflow**

---

## Step 6 — Run the Scraper Manually (First Time)

To populate the database before the first automated run:

```bash
# Install Python dependencies
pip install -r scraper/requirements.txt

# Add these to your .env.local (already there from Step 2)
# SUPABASE_SERVICE_ROLE_KEY=...

# Run the scraper
python -m scraper.main
```

---

## Project Structure

```
fundmydegree/
├── app/                    # Next.js pages
│   ├── page.tsx            # Landing page with filters
│   └── scholarships/       # Results page
│       └── page.tsx
├── components/             # UI components
│   ├── Navbar.tsx
│   ├── FilterSection.tsx   # Landing page hero + filters
│   ├── ResultsFilterBar.tsx
│   └── ScholarshipCard.tsx
├── lib/                    # Shared logic
│   ├── types.ts
│   ├── supabase.ts
│   └── scholarships.ts     # Data fetching
├── scraper/                # Python scrapers
│   ├── main.py             # Entry point
│   ├── cleanup.py          # Monthly cleanup
│   ├── base.py             # Base classes
│   └── scrapers/           # Individual source scrapers
│       ├── government.py
│       ├── scholarships_canada.py
│       └── universities.py
├── supabase/
│   └── schema.sql          # Database schema (run once)
└── .github/workflows/
    ├── scrape.yml          # Weekly scraping job
    └── cleanup.yml         # Monthly cleanup job
```

---

## Adding More Scholarship Sources

1. Create a new file in `scraper/scrapers/your_source.py`
2. Extend `BaseScraper` and implement `scrape()` — return a list of `ScholarshipRecord`
3. Import and add it to `scraper/scrapers/__init__.py` in `ALL_SCRAPERS`

---

## Adding More Countries

When you're ready to expand beyond Canada:
1. Add a `country` column to the Supabase `scholarships` table
2. Update `lib/types.ts` to include country
3. Update the filter UI in `FilterSection.tsx` and `ResultsFilterBar.tsx`
4. Add scrapers for the new country's sources
