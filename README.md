# Portfolio Website Generator

Students create an account, enter their details, projects and skills, and get a public portfolio page at `/p/<username>`.

**Stack:** HTML, CSS, Vanilla JS | Node.js + Express | Supabase PostgreSQL | Git/GitHub

## Folder structure
```
portfolio-website-generator/
├── frontend/   index.html, portfolio.html, styles.css, app.js, portfolio.js
├── backend/    server.js, supabase.js, routes/, middleware/, utils/, package.json, .env.example
├── database/   schema.sql
├── .gitignore
└── README.md
```

## Setup (Windows)
1. Install [VS Code](https://code.visualstudio.com), [Node.js LTS](https://nodejs.org) and [Git](https://git-scm.com). Check with `node -v`, `npm -v`, `git --version`.
2. Create a free project at [supabase.com](https://supabase.com). Open **SQL Editor > New query**, paste all of `database/schema.sql`, click **Run**. Open **Table Editor** and confirm `users`, `portfolios`, `projects`, `skills` exist.
3. In Supabase go to **Project Settings > API**. Copy the **Project URL** and the **service_role** key (keep it secret).
4. In the `backend` folder run `copy .env.example .env` (macOS/Linux: `cp`), then fill in `.env`:
   - `SUPABASE_URL` - Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - service_role key (server only)
   - `JWT_SECRET` - generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   - `PORT` - default 3000
5. In `backend` run `npm install`, then `npm start`. You should see `Server running at http://localhost:3000`.
6. Open http://localhost:3000, register, fill in details, then click **View my portfolio**.

`.env` holds your real secrets and is never committed. `.env.example` is the safe template that is committed.

## Security design
- Passwords hashed with bcrypt. Login uses a signed JWT in an httpOnly, SameSite=strict cookie.
- The user id comes from the verified token, never from the browser. Every update/delete also filters by `user_id`.
- Login/register are rate limited; `helmet` sets security headers.
- RLS is enabled on all tables with no public policies, so the browser cannot read the database directly. Only the backend (service-role key) can, and it enforces permissions itself.
- User text is rendered with `textContent` to prevent XSS.

## API
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /api/health | no | health check |
| POST | /api/auth/register | no | `{username,email,password}` |
| POST | /api/auth/login | no | `{email,password}` |
| POST | /api/auth/logout | no | clear cookie |
| GET | /api/me | yes | own profile, projects, skills |
| PUT | /api/me/portfolio | yes | update details/theme |
| POST, DELETE | /api/me/projects, /api/me/projects/:id | yes | add / delete project |
| POST, DELETE | /api/me/skills, /api/me/skills/:id | yes | add / delete skill |
| GET | /api/public/:username | no | public portfolio data |

## Manual test checklist
- Register with a short password: error shown. Register the same username twice: "already taken".
- Log in with a wrong password: error. Open `/api/me` while logged out: 401.
- Save details, add a project and a skill, refresh: data persists. Add the same skill twice: rejected.
- Delete a project: confirmation appears, item removed. Change theme and view `/p/<username>`. Visit `/p/nobody`: "not found".
- Log out: dashboard hidden.

## Troubleshooting
- `Missing SUPABASE_URL...`: `.env` is missing or not in `backend/`.
- `Something went wrong on the server`: check the terminal; usually the schema was not run or the key is wrong.
- `EADDRINUSE`: change `PORT` or close the other app.

## GitHub upload
From the root folder:
```
git init
git status        # confirm .env and node_modules are NOT listed
git add .
git commit -m "Build portfolio website generator"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
Adding a file to `.gitignore` does not remove a secret that was already committed. If a key leaks, rotate it in Supabase immediately.

## Limitations / future ideas
No automated tests, password reset, image upload, or downloadable static export.
