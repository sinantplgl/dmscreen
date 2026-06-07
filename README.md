# ⚔ DM Screen

A customizable, offline-first Dungeon Master screen for D&D 5e. Run multiple
**campaigns**, track combat, build a bestiary with **authentic Monster Manual stat
blocks**, manage your party, prep your sessions as a nested tree/board, embed your
favourite web tools, and keep reference tables one glance away — all in panels you
can add, remove, drag between columns, and move across your own tabs. Everything is
saved locally in your browser and can be exported/imported as JSON.

Built with **Vite + React + TypeScript**. The only runtime dependency beyond React
is [`zustand`](https://github.com/pmndrs/zustand) for state + persistence
(`playwright` is an optional dependency, used only by the D&D Beyond "rendered"
detail view — see below).

---

## Features

- **Campaigns** — switch between fully separate workspaces from the header
  selector. Each campaign keeps its own tabs/layout, party & players, session
  tree, combat state, and dice history; the **bestiary and reference tables are
  shared** across every campaign. Create / rename / delete campaigns; the active
  one shows in the page title.
- **Fully customizable layout** — tabs hold 1–4 resizable columns of panels.
  - Add panels from a per-column menu; drag the panel header (`⠿`) to reorder,
    move between columns, or drop onto a tab to move it to another tab.
  - Create / rename (double-click) / delete / drag-reorder tabs.
  - Drag the dividers between columns to resize them; drag a panel's bottom grip
    to set an explicit height.
- **Combat Tracker** — initiative order (drag to reorder), round counter,
  next/prev turn, HP +/− and direct edit, conditions, add/remove combatants.
  Creatures added from the bestiary show their stat block inline.
- **Bestiary** *(shared across campaigns)* — authentic 5e stat blocks rendered on
  parchment. Search, add/edit custom creatures (full stat block editor), and send
  any creature straight to the combat tracker.
- **Player Roster** — compact cards (portrait, class & level, six ability scores,
  max HP, AC) grouped into parties. Optional **D&D Beyond** import/detail view
  (see below). Send the whole party to combat in one click.
- **Session Tracker** — prep an arbitrarily-nested tree of typed nodes
  (session › quest › scene › NPC › …). View it as a **tree** or a free-placement
  **board**; give nodes markdown bodies, images, or a linked bestiary stat block;
  Prev/Next cycle through a node's siblings. Node types ship with icons and each
  node can take a **custom icon** (any emoji/character you type).
- **Reference Tables** *(library shared across campaigns)* — starts **empty**;
  tick the built-in tables you want (Conditions, DCs, cover, actions,
  concentration, encounter difficulty) from a checkbox menu, or add your own
  tables, notes, and images on a free-placement board.
- **Web Frame** — embed an external site in an `<iframe>` with one-click
  bookmarks for common DM utilities (generators, ambience, SRD). Note: many large
  sites refuse to be embedded, so an "open in new tab" fallback is always offered.
- **Dice Roller** — build a pool of d4–d100, roll with modifiers/repeats, history.
- **Export / Import / Reset** — back up everything (all campaigns, bestiary,
  tables) to JSON and restore it.

## Visual design

Dark "DM's table" chrome with the iconic gold/parchment palette. Content that has
a canonical book layout — **creature stat blocks and reference tables** — is
rendered as authentic light-parchment "book pieces" (stat-block styling adapted
from the well-known open-source Solbera / statblock5e recreation), so the official
look isn't approximated. UI glyphs are inline SVG icons (Bootstrap Icons, MIT; a
few fantasy glyphs from game-icons.net, CC BY 3.0).

---

## Running it

### Requirements
Node.js **18+** and npm. (Easiest via [nvm](https://github.com/nvm-sh/nvm):
`nvm install --lts && nvm use --lts`.) No database or external services required —
the app is a static site plus a tiny optional proxy.

### Develop
```bash
npm install
npm run dev          # http://localhost:5173
```

### Type-check
```bash
npm run typecheck
```

### Production build
```bash
npm run build        # type-checks, then outputs the static site to dist/
npm run preview      # serve the built site locally
```

### As a web service (Node, no Docker)
After building, a tiny zero-dependency Node server serves the site **and** the
`/ddb-api` proxy used by the D&D Beyond detail view:
```bash
npm run build
npm run serve        # http://localhost:8080  (set PORT to change)
```

### As a web service (Docker)
> Requires Docker + the Compose plugin. These files are provided ready-to-run.

```bash
docker compose up -d --build   # then open http://localhost:8080
```

The image is the same tiny Node server (serves `dist/` + `/ddb-api`). It's
stateless — your data lives in the browser's `localStorage` per device. Use
**Export / Import** in the header to move data between machines or browsers.

---

## Data & storage

All state is persisted to `localStorage` under the key `dm-screen-v1`. Nothing is
sent to any server. The app works completely offline once loaded (the only
external requests are the Google Fonts in `index.html`, anything you load into a
**Web Frame** panel, and — if you use it — the D&D Beyond detail view).

Because data is per-browser, there's no sync across devices. Use **Export** to
download a JSON backup and **Import** on the other machine. Older save formats are
migrated automatically on load.

## D&D Beyond detail view

The roster's **Detail** view is **pluggable** (`src/character/`). Pick a method
from the dropdown in the Player Roster panel. Four ship:

- **`D&D Beyond (exact / rendered)`** (default, **recommended**) — renders the
  character sheet in a **headless browser** so D&D Beyond itself computes every
  value, then reads the result. This gives **DDB-exact AC, HP, ability scores and
  passive scores** without us reimplementing DDB's rules engine. Has a **⟳ Refresh**
  button. Requires the headless shell locally (or a host browser via CDP — see
  below). Takes a couple of seconds (it's spinning up a real render).
- **`D&D Beyond (native)`** — fetches the character JSON through the local
  `/ddb-api` proxy and computes a *reliable subset* ourselves (abilities with
  racial/ASI bonuses, level, proficiencies, estimated HP). Fast, no browser, but
  doesn't resolve AC or exotic edge-cases. Has a breakdown/raw-JSON inspector.
- **`D&D Beyond (embedded)`** — iframe of the live page. DDB usually **blocks
  embedding**; mostly a fallback. Always offers a link.
- **`D&D Beyond (link out)`** — just links to the sheet.

Set each character's D&D Beyond URL via the ✎ edit button on its roster card.
If you don't use D&D Beyond at all, ignore this — every panel works without it.

### Headless browser for the "rendered" provider

The rendered view needs Playwright's lightweight **headless shell** (~100 MB,
*not* full Chrome). Install it once:

```bash
npx playwright install chromium-headless-shell
```

Then `npm run dev` / `npm run serve` will launch it on demand. To use the host's
browser from elsewhere (e.g. Docker), run a browser with a remote-debugging port
and set `BROWSER_CDP_URL` (or `BROWSER_WS_ENDPOINT` for a Playwright server) — see
`docker-compose.yml`. If no browser is available, the rendered view reports that
clearly and the other providers keep working.

### Why a proxy, and the Cobalt cookie

A browser can't call D&D Beyond's character API directly (no CORS header), and
**campaign-only** characters require an authenticated session. The local proxy
(`server/ddbHandler.mjs`, used by the Vite dev server and the prod Node server)
handles both:

1. It exchanges your **CobaltSession** cookie for a short-lived Bearer token at
   `auth-service.dndbeyond.com` (same mechanism as Foundry's *ddb-importer*).
2. It fetches the character from `character-service.dndbeyond.com` with that token.

Set the cookie via **DDB Auth** in the Player Roster panel:
log in at dndbeyond.com → DevTools → Application → Cookies → copy the value of
`CobaltSession` → paste it. It's stored only in this browser's `localStorage`,
sent only to the local proxy (which forwards it to D&D Beyond), and is **never**
included in JSON exports. The token is short-lived, so re-paste the cookie if the
native view starts erroring. **Public** characters need no cookie at all.

To add another method, implement `CharacterDetailProvider` and register it in
`src/character/providers.ts`.

---

## Project structure

```
src/
  main.tsx, App.tsx          # entry + shell
  styles.css                 # dark chrome design system
  parchment.css              # authentic stat block + book tables (scoped)
  types.ts, lib/             # domain types + helpers (dnd, markdown)
  store/                     # zustand store, persistence, default data
  layout/                    # Header, TabBar, ColumnGrid, PanelFrame, registry
  panels/                    # the panel types + StatBlock
    CombatTracker, DiceRoller, Bestiary, PlayerRoster,
    SessionTracker, ReferenceTables, WebFrame
  components/                # shared UI (icons, Checkbox, Board)
  character/                 # pluggable character-detail providers
server/                      # zero-dep prod server + /ddb-api proxy + scraper
```

The original single-file prototype is preserved as `dm-screen.html` for reference.
