# Expense Tracker (v2) — Django + React

A rebuild of the original Flask/SQLite expense tracker as a decoupled REST API
(Django + DRF + JWT) with a React SPA frontend. Built as an MVP covering the
essential feature set: quick entry, categories, income vs expense, date
selection, and a monthly dashboard with a category pie chart, plus budgets.

## Stack
- **Backend:** Django 6, Django REST Framework, SimpleJWT, SQLite (dev) / Postgres (prod-ready via `DATABASE_URL`)
- **Frontend:** React (Vite), Tailwind CSS v4, Recharts, React Router, Axios

## Project layout
```
expense-tracker/
  backend/          Django project (config/, accounts/, transactions/)
  frontend/          React app (src/api, src/context, src/pages, src/components)
```

## Backend setup
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit SECRET_KEY etc.
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```
API runs at `http://localhost:8000/api/`.

To use Postgres instead of SQLite, set `DATABASE_URL` in `.env`, e.g.
`postgres://user:password@localhost:5432/expense_tracker`, then run `pip install psycopg2-binary` and re-run migrations.

## Frontend setup
```bash
cd frontend
npm install
cp .env.example .env          # points at the API URL
npm run dev
```
App runs at `http://localhost:5173`.

## API overview
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register/` | POST | Create account, returns JWT pair |
| `/api/auth/login/` | POST | Obtain JWT pair |
| `/api/auth/refresh/` | POST | Refresh access token |
| `/api/auth/me/` | GET/PATCH | Current user profile |
| `/api/categories/` | GET/POST/PATCH/DELETE | Per-user categories |
| `/api/transactions/` | GET/POST/PATCH/DELETE | Transactions (filter by `category`, `date`, `need_or_want`, or `?start=&end=`) |
| `/api/transactions/summary/` | GET | Dashboard data: totals + per-category breakdown for a given `?year=&month=` |
| `/api/budgets/` | GET/POST/PATCH/DELETE | Monthly per-category budget limits, with `spent_this_month` computed |

Every new user automatically gets a starter set of expense/income categories
(Food, Rent, Transport, Salary, etc.) via a `post_save` signal, so the app
isn't empty on first login.

## Design notes / why these choices
- **Relational DB over NoSQL:** transactions have fixed relationships to
  users and categories, and the dashboard relies on `SUM`/`GROUP BY`
  aggregation — a natural fit for Postgres/SQL over MongoDB.
- **Amount is always positive**; whether it's money in or out is derived
  from `category.kind` (`income`/`expense`). Keeps the schema and the pie
  chart logic simple.
- **`need_or_want`** lives directly on the transaction (not a separate
  model) so the existing category pie chart can be re-sliced by it later
  with no new joins.
- **JWT + refresh interceptor** on the frontend so a session survives past
  the 60-minute access token without forcing a re-login.

## What's next (see project roadmap)
Recurring transactions, visual budget progress bars in the UI (API already
returns `spent_this_month`), CSV/PDF export, and an AI financial coach
endpoint that summarizes a month's spending via an LLM call.
