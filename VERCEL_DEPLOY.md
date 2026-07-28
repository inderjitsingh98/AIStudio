# Vercel Deploy (Single Project)

Use one Vercel project with `frontend` as the root directory.

## 1) Create One Project

1. Go to Vercel.com -> Add New... -> Project.
2. Import repository: `inderjitsingh98/AIStudio`.
3. Set **Root Directory** to `frontend`.
4. Framework should auto-detect as **Next.js**.
5. Click **Deploy**.

## 2) Verify Frontend

Open your deployed URL root (`/`) and confirm the marketplace page loads.

## 3) Verify API (Backend Health)

Open:

`https://<your-project>.vercel.app/api/v1/health`

Expected JSON includes:

1. `service: trusted-data-ai-api`
2. `status: healthy`
3. `version: 1.0.0`

## Notes

1. The health API is served from `frontend/src/app/api/v1/health/route.ts`.
2. This gives one deployment URL for UI and API endpoints.
3. Existing `backend/` code can remain for local/backend-only workflows.
