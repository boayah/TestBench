# TestBench Tracker

A professional engineering test operations platform for tracking test protocols, test runs, fixtures, failures, and verification results. Built as a portfolio project targeting engineering technician, product verification, lab automation, QA, and test engineering support roles.

---

## The Problem

In hardware testing and lab environments, test data often lives in scattered spreadsheets, paper forms, or tribal knowledge. There is no single system for:
- Knowing which protocol version was used for a given unit
- Tracking whether fixtures are calibrated and current
- Linking failures back to the specific test run that surfaced them
- Generating a complete, exportable record for review

TestBench Tracker solves this at the workflow level: a technician opens a protocol, creates a test run, enters measured values, and the system auto-evaluates pass/fail against defined acceptance criteria. Failures can be logged and tracked to closure. Reports are exportable as markdown or CSV.

---

## Workflow

1. **Define a protocol** - name, revision, owner, required equipment, required fixture, and acceptance criteria (parameter, unit, min, max, nominal).
2. **Create a test run** - select a protocol, enter the unit ID, operator, fixture, and date. The form auto-populates measurement rows from the acceptance criteria.
3. **Record measured values** - each row shows the spec limit and auto-evaluates within-spec status as you type.
4. **Set the result** - auto-calculated from measurements (pass if all pass, fail if any fail), with manual override to "Needs Review" if engineering judgment is needed.
5. **Log failures** - linked directly to the test run, with severity, disposition, suspected cause, corrective action, and owner.
6. **Track to closure** - update failure status as investigation and corrective action proceed.
7. **Export** - full test run report as markdown, or bulk export test runs and failures as CSV.

---

## Pages

| Page | Description |
|------|-------------|
| Dashboard | Summary stats, recent test runs, fixture alerts, open failures |
| Test Protocols | List, create, and manage test protocols with acceptance criteria |
| Test Runs | Filter by protocol / result / fixture / operator / date, create new runs |
| Fixtures | Manage calibrated test equipment with check date tracking and overdue alerts |
| Failure Log | Full failure log with Pareto chart, repeat mode detection, CSV export |
| Reports | Test run report view with markdown export, bulk CSV export |

---

## Data Model

```typescript
Protocol {
  id, name, revision, owner,
  equipment_required: string[],
  fixture_required: string,
  acceptance_criteria: AcceptanceCriterion[],
  status: 'draft' | 'active' | 'archived'
}

AcceptanceCriterion {
  id, parameter, unit, min?, max?, nominal?
}

TestRun {
  id, protocol_id, protocol_revision,
  unit_id, operator, fixture_id, date,
  measurements: Measurement[],
  result: 'pass' | 'fail' | 'needs_review',
  observations
}

Fixture {
  id, name, type, location,
  status: 'active' | 'inactive' | 'under_maintenance' | 'retired',
  last_check_date, next_check_date, notes
}

Failure {
  id, test_run_id, failure_mode,
  severity: 'critical' | 'major' | 'minor',
  suspected_cause, disposition, corrective_action,
  owner, status: 'open' | 'in_progress' | 'closed' | 'cancelled',
  opened_date, closed_date
}
```

---

## Architecture

- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS v4** for styling
- **React context + useReducer** for state management with localStorage persistence
- **Supabase** integration layer ready (see below)
- Clean component separation: `StatusBadge`, `StatCard`, `ParetoChart`, `Sidebar`
- Export utilities: markdown report generation, CSV for test runs and failures

### File Structure

```
app/
  page.tsx               - Dashboard
  protocols/             - Protocol list, detail, new
  test-runs/             - Run list, detail (with result edit + failure logging), new
  fixtures/              - Fixture list with CRUD
  failures/              - Failure log with Pareto, detail with edit
  reports/               - Report list, per-run report view
components/
  Sidebar.tsx
  StatusBadge.tsx
  StatCard.tsx
  ParetoChart.tsx
lib/
  types.ts               - All TypeScript interfaces
  mock-data.ts           - Realistic seed data (HVAC/refrigeration domain)
  store.tsx              - React context, useReducer, localStorage persistence
  utils.ts               - Date helpers, spec evaluation, ID generation
  export.ts              - CSV and markdown export utilities
  supabase.ts            - Supabase client + query helpers (optional)
supabase/
  schema.sql             - Full Postgres schema with triggers
```

---

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app runs with mock data by default - no backend required.

---

## Supabase Setup (Optional)

The app uses local state (localStorage) by default. To enable cloud persistence:

1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your project URL and anon key
4. Create `.env.local` from `.env.local.example` and fill in the values
5. Migrate the data layer in `lib/supabase.ts` by wiring the query helpers into the pages/hooks

For production, enable Row Level Security on all tables and add appropriate policies.

---

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Or connect the GitHub repo to a Vercel project and set the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Security Note

This is a demonstration tool. Production deployment in a regulated environment (medical device, aerospace, food safety, etc.) requires:
- User authentication and role-based access control
- Formal validation and qualification of the software (e.g., 21 CFR Part 11, IQ/OQ/PQ)
- Controlled document management with audit trails and electronic signatures
- Data integrity controls and backup procedures

---

## Resume Bullets

- Built a full-stack engineering test operations platform using Next.js 16, TypeScript, and Tailwind CSS, supporting end-to-end workflow from protocol definition to failure closure
- Implemented automatic pass/fail evaluation against acceptance criteria, linking measured values to tolerance limits defined at the protocol level
- Designed and integrated a Supabase-backed data model with PostgreSQL constraints, updated_at triggers, and RLS-ready table structure
- Built fixture calibration tracking with overdue detection and dashboard alerts, simulating calibration management practices common in ISO 9001 environments
- Implemented failure log with Pareto analysis, repeat failure mode detection, and CSV/markdown export, demonstrating familiarity with nonconforming product workflows

---

## Interview Talking Points

**Why React context instead of Redux or Zustand?**
For a single-user CRUD application of this scale, useReducer + context gives you explicit state transitions (readable in one file) without introducing a dependency. The dispatch actions map cleanly to database operations, which makes the Supabase migration path straightforward.

**How would you validate this tool for a regulated environment?**
IQ (installation qualification) confirms the software installs correctly. OQ (operational qualification) executes scripted test cases against each workflow. PQ (performance qualification) demonstrates the system performs under realistic conditions. Electronic records would also need to meet 21 CFR Part 11 audit trail and signature requirements.

**How does the failure log support root cause analysis?**
Each failure records the failure mode as a string, which lets the system detect repeat occurrences of the same mode across multiple runs - surfaced visually as a Pareto chart and "Repeat" badge in the table. This mirrors standard 8D / CAPA workflows where understanding recurrence is the first step to systemic corrective action.

**What would you change to scale this to a team?**
Add Supabase Auth for user identity, scope operator values to authenticated users, enable RLS so each team sees only its own data, and add a notification layer (email or Slack) for newly opened critical failures. The data model is already structured to support this without schema changes.
