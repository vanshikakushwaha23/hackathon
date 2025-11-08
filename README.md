# React + Node Full-Stack Starter

This repository bootstraps a modern full-stack application with a Vite/React frontend and a Node/Express backend. It is organised as an npm workspace so you can manage both apps from the repository root or work inside each package independently.

## Prerequisites

- Node.js 18+ (or any runtime that supports npm workspaces)
- npm 9+

## Getting Started

```bash
# Install dependencies for both frontend and backend
npm install

# Start React (http://localhost:5173) and Express (http://localhost:5000) together
npm run dev
```

The frontend is configured with a dev proxy so requests to `/api/*` are automatically forwarded to the Node server. The default health-check lives at `GET /api/health`.

## Available Scripts

- `npm run dev` – run frontend and backend in parallel
- `npm run build` – build both apps (frontend output in `client/dist`, backend JS in `server/dist`)
- `npm run preview` – preview the built frontend locally
- `npm run start` – run the compiled Express server
- `npm run dev:client` / `npm run dev:server` – run each app individually

You can also install/run scripts from within the `client` and `server` directories if you prefer.

## Project Structure

```
.
├── client/   # Vite + React + TypeScript frontend
├── server/   # Express + TypeScript backend
├── package.json  # npm workspace with shared scripts
└── README.md
```

### Backend Environment

Copy `server/.env.example` to `server/.env` to customise the API:

```
PORT=5000
```

Additional environment variables can be added as your application grows.

## Next Steps

- Add your own React routes/components under `client/src`
- Expand Express routes and middleware under `server/src`
- Introduce shared validation or types via a new workspace package if needed