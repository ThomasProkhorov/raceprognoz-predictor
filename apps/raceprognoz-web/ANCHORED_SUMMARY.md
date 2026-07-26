# Anchored Summary

## What We Learned About the API

### Event & Session Structure
- `GET /formula1/events` returns `{ data: ApiEvent[], meta: {...} }` — NOT `{ upcoming, past }`
- `GET /formula1/events/{eventId}/sessions/{sessionId}/results` returns a flat array `ApiSessionResult[]`, NOT `{ session, results }`
- `position` is a **string** (not number)
- Driver identifier is `driver.code` (3-letter, e.g. `"LEC"`), not `driver.abbreviation`
- Session status can be `"ongoing"` — during a live race the results endpoint returns `[]` (empty array)
- `getCurrentEvent()` uses event `status` field (`"ongoing"`, `"scheduled"`, `"completed"`) instead of date-range checks
- `getBestSessionResults()` uses `event.schedule` array (contains session UUIDs) to find qualifying/sprint/race sessions

### Scoring System
- Points-based: `[25, 15, 10, 8, 6, 4, 2, 1]` (top 8)
- Standings computed from predictions vs actual session results
- `userId` used as key, not `userName`

### Ocblacktop.com Issues
- API has **no** live timing endpoint (`/timing` returns 404)
- Server-side `fetch` to `ocblacktop.com` fails (`ECONNRESET` — likely Cloudflare)
- Workaround: **client-side component** fetches and parses the HTML using `DOMParser`
- Page: `https://ocblacktop.com/events/{eventId}` contains a live timing grid

## Created Files

| File | Description |
|------|-------------|
| `src/lib/api/ocblacktop.ts` | API client: `getCurrentEvent`, `getBestSessionResults`, `fetchPredictions`, `fetchStandings`, `submitPredictions` |
| `src/lib/race-utils.ts` | Helpers: `scorePredictions`, `buildStandings`, `parseSessionIdFromSchedule` |
| `src/lib/scraper/ocblacktop.ts` | Server-side scraper (cheerio) — currently unused, kept for future if server can reach ocblacktop |
| `src/components/live/live-timing.tsx` | **Client component** — fetches ocblacktop.com HTML from browser, parses driver positions using DOMParser |
| `src/app/live/page.tsx` | Live page — shows event name + client-side live timing |

## Live Timing HTML Structure

```html
<div class="group/row grid items-center px-2 ...">
  <div>               <!-- team color bar -->
  <div class="text-center font-bold text-sm ...">
    <span class="flash-cell">1</span>    <!-- POSITION -->
  </div>
  <div class="flex items-center gap-2 pl-1 min-w-0">
    <span class="font-mono text-xs ...">16</span>  <!-- car number -->
    <span class="font-semibold text-sm text-foreground truncate">LEC</span>  <!-- DRIVER CODE -->
  </div>
  ...
</div>
```

Parser (client, `live-timing.tsx`):
- Find all `[class*="group/row"]`
- `cells[1].textContent` → position
- `cells[2].querySelector(".truncate").textContent` → driver code
