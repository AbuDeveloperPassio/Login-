# Login & Sign Up

Full-stack authentication app with an admin panel.

- `client/`: React (Vite) + CSS, login, sign up, dashboard and admin pages
- `server/`: Node.js + Express REST API with JWT auth and roles

## Run locally

```bash
# Backend (http://localhost:5000)
cd server
npm install
npm start

# Frontend (http://localhost:5173)
cd client
npm install
npm run dev
```

## Environment variables

| Where  | Name             | Purpose                                                |
| ------ | ---------------- | ------------------------------------------------------ |
| server | `JWT_SECRET`     | Secret used to sign login tokens                       |
| server | `ADMIN_EMAIL`    | Email of the admin account created on server start     |
| server | `ADMIN_PASSWORD` | Password of that admin account                         |
| client | `VITE_API_URL`   | Base URL of the backend (no trailing `/`)              |

## Admin panel

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` on the server, then log in with them.
Admins see an **Open Admin Panel** button on the dashboard, where they can:

- view all users and simple stats
- search users by name or email
- promote a user to admin or demote an admin
- delete users (you cannot change or delete your own account)

Public sign up always creates a regular user.

## API

- `POST /api/auth/signup` with `{ name, email, password }`
- `POST /api/auth/login` with `{ email, password }`
- `GET  /api/auth/me` with header `Authorization: Bearer <token>`
- `GET  /api/admin/users` (admin only)
- `PATCH /api/admin/users/:id/role` with `{ role: "admin" | "user" }` (admin only)
- `DELETE /api/admin/users/:id` (admin only)

> Users are stored in memory, so they reset when the server restarts or redeploys.
> Connect a database (for example MongoDB) for permanent storage.
