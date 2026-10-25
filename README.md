# Login & Sign Up

Full-stack authentication app.

- `client/`: React (Vite) + CSS, login and sign up pages
- `server/`: Node.js + Express REST API with JWT auth

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

| Where  | Name           | Purpose                                  |
| ------ | -------------- | ---------------------------------------- |
| server | `JWT_SECRET`   | Secret used to sign login tokens         |
| client | `VITE_API_URL` | Base URL of the backend (no trailing `/`) |

## API

- `POST /api/auth/signup` with `{ name, email, password }`
- `POST /api/auth/login` with `{ email, password }`
- `GET  /api/auth/me` with header `Authorization: Bearer <token>`

> Users are stored in memory, so they reset when the server restarts or redeploys.
> Connect a database (for example MongoDB) for permanent storage.
