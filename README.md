# forget_list

A personal, romantic single-page web app for Sheng & Anne. Built with Next.js 16 and static export — a digital love letter with interactive widgets, games, and a photo album.

## Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Styling:** Plain CSS with CSS variables for dark/light theming
- **Build target:** Static export (`output: "export"`), images unoptimized
- **Linting:** ESLint with `eslint-config-next`

## Project structure

```
src/
  lib/
    getPhotos.ts              — Reads image files from public/photos/ (server-side)
  app/
    layout.tsx                — Root layout: fonts, theme toggle, global CSS imports
    page.tsx                  — Home page (async server component): hero header + grid layout
    globals.css               — CSS reset, theme variables, layout grid, hero, card, utilities
    api/photos/route.ts       — JSON endpoint returning the list of photo paths
    components/
      theme-toggle/           — Dark/light mode toggle (localStorage-persisted)
      forget-list/            — Packing checklist with add/toggle/remove/progress
      gallery/                — Polaroid photo album with pagination + lightbox
      flower/                 — 3D flip Valentine card with animated flower
      valentine/              — Bunny-themed "Will you be my Valentine?" with canvas confetti
      valentine-runner/       — Arrow-key collection game (Heart Dash Deluxe)
      birthday/               — Birthday celebration card with animated cake
      hydration-tracker/      — Water intake tracker with hourly reminders
```

## Components

### `ForgetList` (`components/forget-list/`)
A packing checklist. Add items, check them off (with pop animation), track progress via a bar, and bulk-remove checked items. State is in-memory only (no persistence). Shows decorative bear/bunny PNGs.

### `Gallery` (`components/gallery/`)
A polaroid-style photo album. Photos are loaded from `public/photos/` (server-rendered via `getPhotos()`, with a client-side fetch fallback through `/api/photos`). Displays 4 photos per spread in randomized layouts with rotation. Includes a lightbox with keyboard navigation (arrow keys + Escape).

### `Flower` (`components/flower/`)
A 3D flip card. Front side has a "open me" button; back side reveals an animated CSS flower (6 petals, stem, leaves, sparkles) with a handwritten message.

### `Valentine` (`components/valentine/`)
A bunny-themed Valentine's Day ask. Two buttons ("Yes, my bunny" and "Hoppy yes!") trigger canvas-based confetti particle animations with hearts, stars, and rectangles. Accepting shows a heart-eyes result; "declining" shows a playful consolation with a re-celebrate button.

### `ValentineRunner` (`components/valentine-runner/`)
An arrow-key collection game ("Heart Dash Deluxe"). A bunny (🐰) moves on a 360x260 board collecting hearts (💖), stars (🌟), avoiding bombs (💣) and arrows (➤). Features: streak bonuses (4+ streak = double points), invulnerability frames, score/best-score tracking, 8-second rounds with goal of 24 points.

### `HappyBirthday` (`components/birthday/`)
A static server component. Displays a birthday card with confetti animation, a CSS cake with a flickering flame candle, and a personalized message.

### `HydrationTracker` (`components/hydration-tracker/`)
An interactive water intake tracker. Log glasses of water (250ml each) toward a 2000ml daily goal, visualized with a CSS water bottle that fills up with an animated wave and floating bubbles. Sends browser `Notification` API reminders at a user-chosen interval (15 min to 4 hrs) — works on desktop and Android Chrome, even when in other apps. Customizable from the UI. State (water data, interval preference, last notified timestamp) persisted in `localStorage`. Includes a reset button.

### `ThemeToggle` (`components/theme-toggle/`)
A fixed-position button in the top-right corner. Toggles between dark and light themes, persisted in `localStorage`. Defaults to the system preference.

## Available scripts

```bash
npm run dev       # Start the dev server
npm run build     # Production build (static export)
npm run start     # Serve the static export
npm run lint      # Run ESLint
```

## How photos work

1. **Server-side (default):** `page.tsx` calls `getPhotos()` which reads `public/photos/` via `fs/promises` and returns image paths as props to `Gallery`.
2. **Client-side fallback:** `Gallery` also calls `GET /api/photos` on mount if no paths were provided, which does the same `readdir` via a Next.js route handler.

Place `.jpg`, `.png`, `.gif`, `.webp`, `.avif`, or `.svg` files in `public/photos/` to display them.

## Design notes

- Dark/light themes via `[data-theme]` attribute on `<html>` and CSS custom properties.
- The page layout is a CSS grid (`grid-template-areas`) that collapses to single-column below 980px.
- Most components are `"use client"` for interactivity; `HappyBirthday` and `page.tsx` are server components.
- The `ValentineGame` (Cupid Catch) component was removed as unused.
