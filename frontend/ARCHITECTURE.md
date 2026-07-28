# Architecture

## Intent

This app is a polished enterprise-style marketplace for trusted AI capabilities.
The goal is to make it easy for a new user to:

1. understand the product at a glance,
2. search the capability catalog,
3. open a capability detail page,
4. see consistent type, category, and description metadata.

## Design Principles

1. Keep the homepage and capability detail pages server-rendered.
2. Keep interactive search isolated to one client component.
3. Keep capability data in one shared module.
4. Preserve a restrained enterprise visual style with neutral surfaces and one indigo accent.

## Data Flow

1. `src/data/capabilities.ts` is the single source of truth for the capability list.
2. `src/app/page.tsx` imports that array and passes it into the marketplace.
3. `src/components/CapabilityMarketplace.tsx` owns the search text and filters capabilities in memory.
4. `src/components/SkillCard.tsx` renders one card per capability and links to the detail route.
5. `src/app/capabilities/[id]/page.tsx` reads the URL parameter, finds the matching capability, and renders the detail view.

## Component Boundaries

1. `src/app/page.tsx` is a Server Component.
2. `src/components/CapabilityMarketplace.tsx` is the only Client Component in the marketplace flow.
3. `src/components/SkillCard.tsx` is a presentational Server Component.
4. `src/app/capabilities/[id]/page.tsx` is a Server Component for the detail route.

## Routing

1. The homepage lives at `/`.
2. Capability details live at `/capabilities/[id]`.
3. If the requested `id` does not exist, the route calls `notFound()`.

## Why This Structure

1. The homepage stays simple and composable.
2. The search behavior is easy to understand because state lives in the nearest shared owner.
3. The detail page reuses the same data model as the marketplace, so the app stays consistent.
4. The shared module avoids duplicated capability definitions and keeps content changes localized.