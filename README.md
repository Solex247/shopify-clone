# spotify-mini — audition / portfolio project

A Spotify-style music app: MongoDB stores song metadata, Express serves it
and handles Cloudinary uploads, Next.js renders the UI. Anyone can browse
and play songs with no account. Exactly one admin — configured via
environment variables, no database record at all — can log in to add, edit,
or delete songs.

## Project structure

```
backend/
  config/cloudinary.js     # Cloudinary SDK setup
  middleware/auth.js       # JWT verification + admin check
  models/Song.js           # title, artist, album, year, coverUrl, audioUrl
  routes/auth.js           # POST /login, GET /me — checks env vars, no DB
  routes/songs.js          # GET (public), POST/PUT/DELETE (admin only)
  seed.js                  # sample songs, no login required
  server.js

frontend-snippet/
  app/page.js              # homepage: card grid, click cover -> detail page
  app/songs/[id]/page.js   # song detail + player
  app/login/page.js        # admin-only login form
  app/admin/page.js        # admin dashboard: add/edit/delete songs
  app/layout.js            # wraps the app in AuthProvider
  lib/auth-context.js      # holds the JWT, exposes login/logout/isAdmin
  lib/RequireAdmin.js       # redirects non-admins away from /admin
```

## 1. Cloudinary account (free)

1. Sign up at https://cloudinary.com — no credit card required.
2. On your dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Free tier gives 25 credits/month (1 credit = 1GB storage, 1GB bandwidth,
   or 1,000 transformations) — plenty for a handful of demo songs.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- Paste your Cloudinary credentials.
- Set `JWT_SECRET` to any long random string.
- Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to whatever you want your admin
  login to be. **This is the entire admin account** — there's no database
  record, no sign-up form. The login route just compares what's submitted
  against these two values.

```bash
npm run seed   # optional: adds 3 sample songs, no login needed
npm run dev    # starts Express on http://localhost:5000
```

Requires a local MongoDB running (e.g. `mongodb://127.0.0.1:27017/musify-mini`)
or a MongoDB Atlas connection string — either way, paste it into `MONGODB_URI`
in `.env`. There's no fallback value; the server exits with a clear error if
it's missing.

## 3. Frontend setup

If you don't already have a Next.js app scaffolded:

```bash
npx create-next-app@latest musify-frontend
```

Copy everything under `frontend-snippet/` into your app, preserving the
folder structure (`app/`, `app/songs/[id]/`, `app/login/`, `app/admin/`,
and `lib/`).

Create `.env.local` in the frontend root:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run it:

```bash
npm run dev
```

- Visit `http://localhost:3000` — browse songs as a guest, click any cover
  to open its detail page and play it.
- Visit `/login` and sign in with the `ADMIN_USERNAME` / `ADMIN_PASSWORD`
  from your backend `.env` to reach `/admin`.

## 4. How the admin-only login works

There is no `User` collection and no registration route. The single admin
identity lives entirely in two environment variables:

1. The login form POSTs `{ username, password }` to `/api/auth/login`.
2. The route compares them directly against `process.env.ADMIN_USERNAME`
   and `process.env.ADMIN_PASSWORD`.
3. If they match, the server signs a JWT with `{ username, role: "admin" }`
   and sends it back.
4. The frontend stores that token and attaches it as an `Authorization:
   Bearer <token>` header on every admin request (create/edit/delete song).
5. `middleware/auth.js` verifies the token's signature and checks
   `role === "admin"` before letting the request through to `routes/songs.js`.

This is intentionally simpler than a full user system — it still teaches
the real login → token → protected route pattern, just without the
overhead of a users table for an app that only ever needs one admin.

## 5. A note on scope for your audition video

This is now a complete small full-stack project — good for a portfolio, but
too much to teach well in 20 minutes. Two ways to use it:

- **For the audition video**: pick one thread and go deep — e.g. the
  homepage → detail page flow, or the login → protected route flow. Depth
  on a few concepts beats a rushed tour of everything.
- **For your portfolio**: keep the full project as-is and link the repo,
  mentioning you also built auth, an admin dashboard, and Cloudinary
  uploads.

## 6. Suggested recording order (full walkthrough, for reference)

1. Show the finished app: browse as a guest, click a cover to open its
   detail page and play it (30 sec) — this is your hook.
2. Open `models/Song.js` — explain the fields, including `album`/`year` as
   optional metadata versus `title`/`artist`/`audioUrl` as required.
3. Open `app/page.js` and `app/songs/[id]/page.js` — explain why clicking
   a card navigates instead of playing inline: it mirrors how real music
   apps give each song its own page and URL.
4. Open `middleware/auth.js` — explain `requireAuth` and `requireAdmin` as
   a two-step gate, and that there's no database lookup involved.
5. Open `routes/auth.js` — the login route: compare against env vars, sign
   a token. Emphasize why credentials live in `.env` and are never
   committed to source control.
6. Open `routes/songs.js` — show that `GET` routes have no middleware
   (public) but `POST`/`PUT`/`DELETE` have `requireAuth, requireAdmin`
   (protected). This contrast is the core lesson of the auth section.
7. Live demo: try opening `/admin` while logged out (redirects to login),
   then log in and add, edit, and delete a song from the dashboard.
8. Recap: authentication (who are you) vs. authorization (what can you
   do), and why a single-admin app can skip a full user system without
   skipping the underlying lesson.

## Notes

- Sample audio/cover URLs in `seed.js` are free-to-use placeholders
  (Bensound royalty-free tracks) — no Cloudinary or login needed for that
  path.
- The UI mirrors Spotify's layout and interaction patterns (sidebar, card
  grid, detail page, login screen) as a teaching reference — it doesn't
  use Spotify's logo, wordmark, or brand assets.
- Deleting a song currently only removes the MongoDB record, not the
  Cloudinary file — a good "next step" to mention if asked about
  production-readiness.
- Because there's no user database, "logging in" always produces the same
  single admin identity — there's no concept of multiple admins in this
  version.
