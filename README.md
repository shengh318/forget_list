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
forget_list/
├── src/
│   ├── lib/
│   │   └── getPhotos.ts              # Reads public/photos/ via fs (server-side)
│   └── app/
│       ├── layout.tsx                # Root layout: fonts, theme toggle, global CSS
│       ├── page.tsx                  # Home page: hero header + CSS grid layout
│       ├── globals.css               # Reset, theme vars, grid, hero, cards
│       ├── favicon.ico
│       ├── api/photos/
│       │   └── route.ts              # GET /api/photos — photo list endpoint
│       └── components/
│           ├── birthday/             # 🎂 Birthday card with cake & confetti
│           │   ├── index.tsx
│           │   └── birthday.css
│           ├── flower/               # 🌸 3D flip card with animated flower
│           │   ├── index.tsx
│           │   └── flower.css
│           ├── forget-list/          # 📋 Packing checklist
│           │   ├── index.tsx
│           │   └── forget-list.css
│           ├── gallery/              # 📸 Polaroid photo album + lightbox
│           │   ├── index.tsx
│           │   └── gallery.css
│           ├── hydration-tracker/    # 💧 Water intake tracker
│           │   ├── index.tsx
│           │   └── hydration-tracker.css
│           ├── mbta-tracker/         # 🚇 Live MBTA subway map
│           │   ├── index.tsx
│           │   └── mbta-tracker.css
│           ├── theme-toggle/         # 🌓 Dark/light mode toggle
│           │   ├── index.tsx
│           │   └── theme-toggle.css
│           ├── valentine/            # 💌 Valentine's Day ask + confetti
│           │   ├── index.tsx
│           │   └── valentine.css
│           └── valentine-runner/     # 🐰 Heart Dash Deluxe game
│               ├── index.tsx
│               └── valentine-runner.css
├── public/
│   ├── bear.png                     # Forget-list decoration
│   ├── bunny.png                    # Forget-list decoration
│   ├── photos/                      # Gallery images (user-added)
│   └── (Next.js default assets)
├── .github/workflows/
│   └── nextjs.yml                   # GitHub Pages deploy
├── eslint.config.mjs                # ESLint config
├── next.config.ts                   # Next.js config (static export)
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── README.md
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
An interactive water intake tracker. Log glasses of water (250ml each) toward a 2000ml daily goal, visualized with a CSS water bottle that fills up with an animated wave and floating bubbles. Sends browser `Notification` API reminders at a user-chosen interval (15 min to 4 hrs) — works on desktop and Android Chrome, even when in other apps. Customizable from the UI. Features a "Test" button in the header to verify notifications, a countdown to the next reminder, and a reset button. State (water data, interval preference, last notified timestamp) persisted in `localStorage`.

### `MbtaTracker` (`components/mbta-tracker/`)
An interactive MBTA subway map showing the Red, Orange, Blue, and Green lines as an SVG schematic. Tap any station to open a popup with live predictions (up to 3 per direction), updated on open and via a manual ↻ refresh button. Predictions are fetched from the MBTA API v3. The popup shows route-colored direction headers with arrival times.

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
