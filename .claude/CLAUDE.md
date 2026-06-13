# Ben's Recipes — CLAUDE.md

## Project Description

A personal recipe website where only I can upload and manage recipes I enjoy. Authentication is handled by Clerk (restricted to a single admin user), and recipes are stored and queried via Convex. The public can browse recipes, but only the authenticated admin can create or manage them.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | Clerk (`@clerk/nextjs`) |
| Database / Backend | Convex |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| UI Components | shadcn/ui |
| Validation | Zod |
| Linting | ESLint (Next.js config + typescript-eslint) |
| Formatting | Prettier + prettier-plugin-tailwindcss |

## Skills to Invoke

- **`clerk`** — Use whenever working on authentication, route protection, middleware, or anything Clerk-related.
- **`clerk-nextjs-patterns`** — Use for Next.js-specific Clerk patterns (middleware, Server Actions, caching).
- **`ui-primitives`** — **Always invoke first before writing any UI code.** Evaluate the requested UI against the available primitive components in `src/components/ui` and reuse them before writing custom markup. This is the single source of truth for what's already built.
- **`shadcn`** — Invoke after `ui-primitives` when a needed component is NOT already in `src/components/ui`. Check whether a shadcn component exists for the use case and add it before writing custom markup.
- **`frontend-design`** — Use when building or updating UI components and pages (invoke after `ui-primitives` and `shadcn` to layer in design decisions on top of primitives).
- **`unsplash`** — Use when images are needed in UI (recipe covers, backgrounds, etc.). Always use this skill to source photos rather than placeholder URLs.
- **`plan-with-me`** — Use when implementing new features to create a solid plan before implementing any code.
- **`react-best-practices`** — Use when writing any React code.

## UI Component Rules

1. **Always check `ui-primitives` first.** Before writing any JSX, invoke the `ui-primitives` skill to map the UI need to an existing component in `src/components/ui`.
2. **Then check shadcn.** If no local primitive covers the need, invoke `shadcn` to see if a shadcn component can be added.
3. **Follow the theme in `globals.css`.** All colors, radii, spacing, and typography must use the CSS custom properties defined there — never hardcode values that conflict with the theme.

## Commands to Run After Every Code Change

Always run the following after making code changes:

```bash
npm run lint        # ESLint — catch lint errors
npm run format:write  # Prettier — auto-format changed files
```

For type checking:

```bash
npm run typecheck   # tsc --noEmit
```
