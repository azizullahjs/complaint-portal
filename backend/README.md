# CivicFix Backend

Express + MongoDB (Mongoose) API for the CivicFix frontend.

## Setup

```
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:5000`. The frontend's Vite dev server already
proxies `/api` to this port (see `vite.config.js`), so just run the frontend
with `npm run dev` in its own folder and everything connects automatically.

## Environment variables (`.env`)

Already filled in with the values you provided:

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — secret used to sign login tokens
- `PORT` — defaults to 5000
- `CLIENT_ORIGIN` — allowed CORS origin, defaults to the Vite dev server

**Security note:** you pasted a live database password and JWT secret in
plain text. Since it's now sitting in the .env file, rotate the MongoDB
Atlas password (Database Access → edit user → new password) and generate a
new JWT secret before deploying anywhere public. Never commit `.env` — it's
already in `.gitignore`.

## API routes

- `POST /api/auth/signup` — `{ name, email, password }`, creates a citizen
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/complaints` — list, filters: `search, category, status, area, priority`
- `POST /api/complaints` — citizen only, create a complaint
- `GET /api/complaints/check-duplicate?category=&area=` — similar open complaints
- `GET /api/complaints/mine` — citizen only, complaints they filed
- `GET /api/complaints/export` — officer only, CSV download
- `GET /api/complaints/:id` — single complaint
- `PATCH /api/complaints/:id/upvote` — logged-in users, one upvote each
- `PATCH /api/complaints/:id/status` — officer only, `{ status, remark }`
- `PATCH /api/complaints/:id/feedback` — citizen (owner only), `{ rating, comment }`
- `POST /api/ai/officer-summary` — officer only, generates a briefing from
  current open complaint stats (no external AI key needed)

## Priority

Complaints get an automatic priority based on category (Electricity/Water
start High, Road Medium, Garbage/Other Low) and escalate as upvotes climb
(5+ upvotes bumps a level, 15+ jumps straight to Critical).

## Seeding an officer account

Signup always creates a `citizen`. To get an officer account, sign up
normally then flip the role directly in MongoDB:

```
db.users.updateOne({ email: "officer@example.com" }, { $set: { role: "officer" } })
```
