# Repository Architecture

This repository is organized as a simple two-part workspace:

1. `backend/` for server-side work.
2. `frontend/` for the Next.js marketplace app.

## Frontend Overview

The frontend is the part of the repository that currently contains the enterprise AI capability marketplace.

1. `src/data/capabilities.ts` is the shared source of truth for capability data.
2. `src/app/page.tsx` renders the homepage shell.
3. `src/components/CapabilityMarketplace.tsx` owns search and filtering.
4. `src/components/SkillCard.tsx` renders each capability tile.
5. `src/app/capabilities/[id]/page.tsx` renders the capability detail page.

## Why These Docs Live at the Root

GitHub shows root-level files first on the repository landing page. These files are here so the main entry point of the repo is visible without opening `frontend/` first.
