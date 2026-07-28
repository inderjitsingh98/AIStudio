# Trusted Data AI Studio

A small Next.js App Router app for browsing enterprise AI capabilities.

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Start the development server.

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

4. Search the capability marketplace by name, description, type, or category.

5. Open any capability card to view its detail page.

## What To Look At First

1. [src/app/page.tsx](src/app/page.tsx) defines the homepage shell and passes capability data into the marketplace.
2. [src/components/CapabilityMarketplace.tsx](src/components/CapabilityMarketplace.tsx) owns the search state and filters the cards.
3. [src/components/SkillCard.tsx](src/components/SkillCard.tsx) renders each capability tile and links to the detail page.
4. [src/app/capabilities/[id]/page.tsx](src/app/capabilities/%5Bid%5D/page.tsx) renders a single capability from the shared data.

## User Flow

1. Land on the homepage.
2. Review the hero and marketplace summary.
3. Filter capabilities with the search bar.
4. Open a capability to inspect its detail page.

## Notes

This app uses the App Router, server components by default, and a single client boundary for search interaction.

For the implementation details and intent, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Recent Updates

1. Added a polished enterprise-style marketplace homepage.
2. Added search across capability name, description, type, and category.
3. Added capability detail pages with shared data.
