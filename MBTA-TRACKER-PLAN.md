# MBTA Subway Tracker — Implementation Plan

## Overview

An interactive MBTA subway map schematic showing Red, Orange, Blue, and Green Lines in the core Boston urban area. Tap a station to see live train arrival predictions.

---

## Files to create

| File | Purpose |
|------|---------|
| `src/app/components/mbta-tracker/index.tsx` | Client component: SVG map + predictions popup |
| `src/app/components/mbta-tracker/mbta-tracker.css` | Styles for map + popup |

## Files to modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add `"mbta"` grid area, update `grid-template-areas` |
| `src/app/page.tsx` | Import `<MbtaTracker />` and place in grid |
| `src/app/layout.tsx` | Import `mbta-tracker.css` |

---

## New grid layout (globals.css)

```css
grid-template-areas:
  "hydrate mbta"
  "forget  photos"
  "ask     card"
  "game    game"
  "birthday birthday";
```

Add `.grid-mbta { grid-area: mbta; }` and add to all uniform-tile selectors (same pattern as other grid items).

---

## Station layout (SVG viewport ~450×360)

All four transfer stations share exact (x,y) coordinates:

### Coordinates

**Green Line** (horizontal, Y=130):
```
Kenmore(30,130) → Hynes(65,130) → Copley(95,130) → Arlington(125,130) →
Boylston(155,130) → Park Street(180,130) → Government Center(290,130)
```

**Red Line** (vertical, X=180):
```
Harvard(180,20) → Central(180,50) → Kendall(180,85) → Charles/MGH(180,110) →
Park Street(180,130) → Downtown Crossing(180,200) →
South Station(180,245) → Broadway(180,280) → Andrew(180,315)
```

**Blue Line** (horizontal, Y=130):
```
Government Center(290,130) → State Street(310,130) → Aquarium(355,130) → Maverick(395,130)
```

**Orange Line** (top vertical, then diagonal, then vertical):
```
North Station(310,105) → Haymarket(310,115) → State Street(310,130) →
[diagonal to (180,200)] Downtown Crossing(180,200) →
Chinatown(180,230) → Tufts(180,260) → Back Bay(180,290) → Mass Ave(180,320) → Ruggles(180,350)
```

### Transfer stations (exact same point)

| Station | Coordinate | Lines |
|---------|-----------|-------|
| Park Street | (180, 130) | Red + Green |
| Government Center | (290, 130) | Green + Blue |
| State Street | (310, 130) | Blue + Orange |
| Downtown Crossing | (180, 200) | Red + Orange |

---

## API details

### Endpoints

**Routes & stops** (fetch once on mount, cache in state):
```
GET /routes?filter[type]=0,1&api_key=c246650beb044b66bd3c1d54d312b768
GET /stops?filter[route_type]=0,1&api_key=c246650beb044b66bd3c1d54d312b768
```

**Predictions** (fetch every 20s for selected station):
```
GET /predictions?filter[stop]=:stop_id&include=route&api_key=c246650beb044b66bd3c1d54d312b768
```

### Response shape

```json
{
  "data": [
    {
      "attributes": {
        "arrival_time": "2026-05-24T09:17:04-04:00",
        "departure_time": "2026-05-24T09:18:13-04:00",
        "direction_id": 1
      },
      "relationships": {
        "route": { "data": { "id": "Red" } }
      }
    }
  ],
  "included": [
    { "type": "route", "id": "Red", "attributes": { "color": "DA291C", "direction_destinations": ["Ashmont/Braintree", "Alewife"] } }
  ]
}
```

### Route data

| Route | Color | dir0 (↘) | dir1 (↖) |
|-------|-------|----------|----------|
| Red | #DA291C | Ashmont/Braintree | Alewife |
| Orange | #ED8B00 | Forest Hills | Oak Grove |
| Blue | #003DA5 | Bowdoin | Wonderland |
| Green-B | #00843D | Boston College | Government Center |
| Green-C | #00843D | Cleveland Circle | Government Center |
| Green-D | #00843D | Riverside | Union Square |
| Green-E | #00843D | Heath Street | Medford/Tufts |
| Mattapan | #DA291C | Mattapan | Ashmont |

---

## Component architecture

### State

```typescript
routes: MbtaRoute[]         // cached after initial fetch
stops: MbtaStop[]           // cached after initial fetch
selectedStop: string | null  // stop ID of tapped station
predictions: Prediction[]    // live predictions for selected stop
loading: boolean            // initial data loading
error: string | null        // error message
refreshing: boolean         // predictions refreshing indicator
lastUpdated: number | null  // timestamp of last prediction fetch
```

### Render flow

1. **On mount**: Fetch routes + stops → store in state (cached, never refetched)
2. **Render SVG**: Loop through hardcoded station positions → draw polylines for each route → draw circles for stations → add labels
3. **On tap**: Set `selectedStop`, fetch predictions, show popup
4. **Auto-refresh**: While `selectedStop` is set, re-fetch predictions every 20s
5. **Popup close**: Clear `selectedStop`, stop refresh timer

### SVG rendering details

- ViewBox: `"0 0 460 400"`
- Each route: `<polyline>` with stroke-width 4, line color matching route
- Each station: `<circle>` with white fill (r=7) + colored inner (r=4)
- Transfer stations: larger outer circle (r=9) + double border
- Station labels: `<text>` next to each circle, font-size 9-10px
- Transfer labels slightly larger / bold
- Connector lines (for diagonal Orange segment): use the same polyline

### Popup

```tsx
<div class="mbta-popup" style={{ position: 'absolute', left: X, top: Y }}>
  <div class="mbta-popup-header">🚇 Station Name</div>
  <div class="mbta-popup-section">
    <div class="mbta-popup-route-header">── 🔴 Red Line ──</div>
    <div class="mbta-popup-row">⬆ Alewife     🚃 2 min</div>
    <div class="mbta-popup-row">⬇ Ashmont/Br. 🚃 4 min</div>
  </div>
  <div class="mbta-popup-section">
    <div class="mbta-popup-route-header">── 🟢 Green Line ──</div>
    <div class="mbta-popup-row">➡ Gov Center  🚃 1 min</div>
    ...
  </div>
  <div class="mbta-popup-footer">
    ↻ Updated 5s ago  [✕]
  </div>
</div>
```

### States

| State | What to show |
|-------|-------------|
| Loading | Pulsing skeleton of the map layout (grey circles + lines) |
| Error | "Couldn't load MBTA data" + retry button |
| Data (no selection) | Interactive SVG map |
| Data (selected + loading predictions) | Map + popup with spinner |
| Data (selected + predictions) | Map + popup with times |
| Data (selected + no predictions) | Map + popup saying "No trains scheduled" |

---

## CSS notes

- Use `.mbta-` prefix for all classes
- Card uses `.card` class like other components
- Map area inside the card with padding
- Popup positioned absolutely within the card (needs `position: relative` on the card)
- Popup z-index above map, with subtle shadow + rounded corners
- Line colors match MBTA brand colors exactly
- Dark/light theme support via CSS variables — use `var(--text)`, `var(--bg)`, `var(--card)` etc.
- Responsive: on mobile (<640px) reduce font-sizes and station spacing if needed

---

## Pixel coordinates for SVG

Full station list with MBTA stop IDs:

```typescript
interface StationConfig {
  id: string;      // MBTA stop ID (for API call)
  name: string;    // Display name
  x: number;       // SVG x
  y: number;       // SVG y
  lines: string[]; // Route IDs serving this station
}

interface RouteConfig {
  id: string;
  color: string;
  stations: { x: number; y: number }[];  // ordered path
}

const STATIONS: StationConfig[] = [
  // Red Line
  { id: "place-harsq", name: "Harvard", x: 180, y: 20, lines: ["Red"] },
  { id: "place-cntsq", name: "Central", x: 180, y: 50, lines: ["Red"] },
  { id: "place-knncl", name: "Kendall/MIT", x: 180, y: 85, lines: ["Red"] },
  { id: "place-chmnl", name: "Charles/MGH", x: 180, y: 110, lines: ["Red"] },
  { id: "place-pktrm", name: "Park Street", x: 180, y: 130, lines: ["Red", "Green-B", "Green-C", "Green-D", "Green-E"] },
  { id: "place-dwnxg", name: "Downtown Crossing", x: 180, y: 200, lines: ["Red", "Orange"] },
  { id: "place-sstat", name: "South Station", x: 180, y: 245, lines: ["Red"] },
  { id: "place-brdwy", name: "Broadway", x: 180, y: 280, lines: ["Red"] },
  { id: "place-andrw", name: "Andrew", x: 180, y: 315, lines: ["Red"] },
  // Orange Line
  { id: "place-north", name: "North Station", x: 310, y: 105, lines: ["Orange"] },
  { id: "place-haecl", name: "Haymarket", x: 310, y: 115, lines: ["Orange"] },
  { id: "place-state", name: "State Street", x: 310, y: 130, lines: ["Orange", "Blue"] },
  // Downtown Crossing is also on Orange (x: 180 from diagonal)
  { id: "place-chncl", name: "Chinatown", x: 180, y: 230, lines: ["Orange"] },
  { id: "place-tumnl", name: "Tufts Med Center", x: 180, y: 260, lines: ["Orange"] },
  { id: "place-bbsta", name: "Back Bay", x: 180, y: 290, lines: ["Orange"] },
  { id: "place-masta", name: "Mass Ave", x: 180, y: 320, lines: ["Orange"] },
  { id: "place-rugg", name: "Ruggles", x: 180, y: 350, lines: ["Orange"] },
  // Green Line
  { id: "place-kencl", name: "Kenmore", x: 30, y: 130, lines: ["Green-B", "Green-C", "Green-D"] },
  { id: "place-hymnl", name: "Hynes", x: 65, y: 130, lines: ["Green-B", "Green-C", "Green-D"] },
  { id: "place-coecl", name: "Copley", x: 95, y: 130, lines: ["Green-B", "Green-C", "Green-D", "Green-E"] },
  { id: "place-armnl", name: "Arlington", x: 125, y: 130, lines: ["Green-B", "Green-C", "Green-D", "Green-E"] },
  { id: "place-boyls", name: "Boylston", x: 155, y: 130, lines: ["Green-B", "Green-C", "Green-D", "Green-E"] },
  // Park Street already defined in Red Line
  { id: "place-gover", name: "Government Center", x: 290, y: 130, lines: ["Green-B", "Green-C", "Green-D", "Green-E", "Blue"] },
  // Blue Line
  // State Street already defined in Orange Line
  { id: "place-aqucl", name: "Aquarium", x: 355, y: 130, lines: ["Blue"] },
  { id: "place-mvbcl", name: "Maverick", x: 395, y: 130, lines: ["Blue"] },
];

const ROUTES: RouteConfig[] = [
  {
    id: "Red",
    color: "#DA291C",
    stations: [
      { x: 180, y: 20 },    // Harvard
      { x: 180, y: 50 },    // Central
      { x: 180, y: 85 },    // Kendall
      { x: 180, y: 110 },   // Charles/MGH
      { x: 180, y: 130 },   // Park Street
      { x: 180, y: 200 },   // Downtown Crossing
      { x: 180, y: 245 },   // South Station
      { x: 180, y: 280 },   // Broadway
      { x: 180, y: 315 },   // Andrew
    ],
  },
  {
    id: "Orange",
    color: "#ED8B00",
    stations: [
      { x: 310, y: 105 },   // North Station
      { x: 310, y: 115 },   // Haymarket
      { x: 310, y: 130 },   // State Street
      { x: 180, y: 200 },   // Downtown Crossing (diagonal)
      { x: 180, y: 230 },   // Chinatown
      { x: 180, y: 260 },   // Tufts
      { x: 180, y: 290 },   // Back Bay
      { x: 180, y: 320 },   // Mass Ave
      { x: 180, y: 350 },   // Ruggles
    ],
  },
  {
    id: "Green",
    color: "#00843D",
    stations: [
      { x: 30, y: 130 },    // Kenmore
      { x: 65, y: 130 },    // Hynes
      { x: 95, y: 130 },    // Copley
      { x: 125, y: 130 },   // Arlington
      { x: 155, y: 130 },   // Boylston
      { x: 180, y: 130 },   // Park Street
      { x: 290, y: 130 },   // Government Center
    ],
  },
  {
    id: "Blue",
    color: "#003DA5",
    stations: [
      { x: 290, y: 130 },   // Government Center
      { x: 310, y: 130 },   // State Street
      { x: 355, y: 130 },   // Aquarium
      { x: 395, y: 130 },   // Maverick
    ],
  },
];
```

---

## Popup design

```
┌─────────────────────────────────┐
│ 🚇 Station Name                 │
│                                 │
│ ── 🔴 Red Line ──              │
│   ⬆ Direction name    🚃 X min  │
│   ⬇ Direction name    🚃 X min  │
│                                 │
│ ── 🟢 Green Line ──            │
│   ➡ Direction name    🚃 X min  │
│   ⬅ Direction (br.)  🚃 X min  │
│                                 │
│ ↻ Updated Xs ago          [✕]  │
└─────────────────────────────────┘
```

- Colors match route brand colors
- Only show sections for lines that serve the station
- Green Line branches show branch letter in parentheses
- Popup appears near the tapped station dot (offset to avoid covering it)
- Auto-dismiss if tapping another station or tapping outside

---

## Implementation order

1. Create `mbta-tracker.css` with base styles
2. Create `index.tsx` with:
   - Station/route data (hardcoded as above)
   - SVG rendering function that draws polylines + circles + labels
   - Initial data fetch from MBTA API
   - Click handler that sets selected station
   - Prediction fetch + 20s auto-refresh
   - Popup component
   - All states (loading, error, data, empty)
3. Update `globals.css` to add grid area
4. Update `page.tsx` to import and place component
5. Update `layout.tsx` to import CSS
6. Build and verify
