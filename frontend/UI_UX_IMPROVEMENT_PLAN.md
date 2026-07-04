# CognitiveCoach — Frontend UI/UX Review & Improvement Plan

_Reviewed: 2026-07-04 · Scope: `frontend/src` (Next.js 16 App Router, React 19, Tailwind 3)_

This document is a full UI/UX audit of the CognitiveCoach frontend. It records
systemic (cross-cutting) issues, a per-screen breakdown, a worst→best ranking,
and the concrete plan applied to the Dashboard. No application _functionality_
is changed by this pass — only presentation, hierarchy, accessibility, and copy.

---

## 1. Systemic issues (affect every screen)

These are the highest-leverage problems because they repeat on every route.

### 1.1 The color system is hijacked by CSS-variable remapping
`tailwind.config.js` redefines `slate`, `violet`, `indigo`, and `cyan` to point
at CSS variables. In `globals.css`, dark mode **remaps all of those variables to
champagne gold / obsidian**. Consequences:

- The colorful per-role gradients on the Dashboard (`from-cyan-500 to-sky-500`,
  `from-emerald-500 to-teal-500`, …) only render in **light** mode. In dark mode
  every accent collapses to gold, so the careful color-coding is invisible.
- Primary CTAs are styled with `from-violet-500 to-indigo-650`, then _overridden_
  in dark mode by brittle `!important` selectors that string-match the class
  names (`.dark .bg-gradient-to-r.from-violet-500.to-indigo-650`). Any refactor
  of a button's classes silently breaks its dark-mode styling.

**Recommendation:** Introduce real semantic tokens (`--color-primary`,
`--color-accent`, `--color-surface`, …) and reference those, instead of
overloading Tailwind's named palettes. Medium effort, high payoff. _(Not done in
this pass — it would touch every file.)_

### 1.2 Hallucinated Tailwind shades → dead classes everywhere
The code is peppered with color shades that **do not exist** in the config or in
standard Tailwind, so the class is silently dropped and the element falls back to
inherited color. Examples seen across files: `slate-909`, `slate-505` _(exists)_
vs `slate-455`/`slate-555` _(dead)_, `slate-350`, `slate-205`, `rose-455`,
`rose-505`, `rose-550`, `rose-650`, `emerald-405/450/455`, `amber-405/450/455`,
`cyan-405/505`, `violet-405/455/505`, `zinc-750/805/855/955`, and the invalid
utilities `scale-102`, `scale-98`, `z-55`, `r-5.5`, `gap-4.5`, `px-4.5`.

**Impact:** muted text that was meant to be a specific gray simply has _no_ color
applied; hover/press micro-interactions (`hover:scale-102`, `active:scale-98`)
are no-ops; the floating chatbot's `z-55` yields no z-index at all.

**Recommendation:** Lint for non-existent classes and normalize to real shades.

### 1.3 Accessibility gaps
- Clickable `<div>`s (role cards, results question list) have `onClick` but no
  `role`, `tabIndex`, or keyboard handler → not operable by keyboard.
- Few visible **focus states** (inputs get a border color; buttons get nothing).
- Icon-only controls are inconsistently labeled.
- Native `alert()` / `confirm()` are used for errors and exit prompts.

### 1.4 Responsive gaps
- **Navbar** never collapses: four text links + profile + theme toggle sit in a
  single row and overflow on small screens (no hamburger / mobile menu).
- Career Center is locked to `h-[calc(100vh-100px)]`, which clips on short
  viewports and mobile browser chrome.

### 1.5 Brand / copy inconsistencies
- **Login** is titled **“NeuroSync Workspace”** while the product is
  **CognitiveCoach** everywhere else — reads as a broken/leftover screen.
- **Career Center** ships a literal placeholder: the advisor card subtitle says
  **“Lorem Ipsum flash.”**
- Heavy sci-fi jargon (“Diagnostics”, “Sandbox”, “velocity indexes”) that adds
  noise without informing.

---

## 2. Per-screen findings

### Dashboard — `/` (`src/app/page.jsx`)
- A **70vh marketing hero** pushes the actual dashboard (stats, role grid) below
  the fold; the screen is doing double duty as landing page _and_ dashboard.
- The WPM card **always** shows a green “Pacing rate aligns with conversational
  fluency benchmarks” — even for a guest with **0 WPM / no data**. Misleading.
- Stat tiles render `0%` for guests with no framing that they're empty.
- Dead classes: `bg-violet-55`, `hover:scale-102`, `active:scale-98`, `slate-909`.
- Role cards are keyboard-inaccessible clickable divs.
- The trend chart draws the **same `<circle>` twice** per data point (redundant).

### Career Center — `/advisor`
- Ships **“Lorem Ipsum flash”** placeholder text.
- Static **“Live Session”** badge implies realtime that doesn't exist.
- Locked full-viewport height clips on small screens.
- Hand-rolled markdown parser with `dangerouslySetInnerHTML` (duplicated in 3
  places — see Chatbot & Results).

### Login — `/login`
- **Wrong brand name** (“NeuroSync Workspace”).
- No password show/hide, no “forgot password”.
- “Continue as Guest” is a large secondary button competing with the primary CTA.
- Otherwise a clean, well-structured form.

### Interview Room — `/interview`
- Uses native `confirm()` (exit) and `alert()` (upload failure).
- Good: spacebar hotkey, adaptive-resume toggle, difficulty badges, real-time HUD.
- Dense configuration → loading → error → session state machine; solid but noisy.

### Resume Checker — `/resume-checker`
- Solid drag-and-drop, good result layout, accessible circular gauges (`role`,
  `aria-valuenow`).
- The scan “steps” are a **simulated** timer, not real progress — mildly
  deceptive but low-risk.

### Results — `/results/[id]`
- The most feature-rich screen: click-to-seek transcript, filler highlighting,
  gauges, read-only Monaco code view, model answer. Well organized.
- Bug: the “No Hire” verdict pill uses `bg-rose-50` (should be `bg-rose-500`), so
  the pill is nearly invisible on that path.

### Global — Navbar & Career Chatbot
- **Navbar:** no mobile menu (overflow). Otherwise functional, nice active-link
  underline.
- **Chatbot:** `z-55` is invalid → container has no stacking context and can be
  covered. Largely duplicates the Advisor page.

---

## 3. Ranking — worst → best (by UX debt & impact)

| Rank | Screen | Why it ranks here |
|-----:|--------|-------------------|
| 1 (worst) | **Dashboard `/`** | Most-visited, most surface issues: giant hero buries content, **misleading always-green pacing note**, empty-state confusion, dead classes, keyboard-inaccessible cards, accents broken in dark mode. |
| 2 | **Career Center `/advisor`** | Ships **Lorem Ipsum**, fake “Live” badge, rigid full-height layout. |
| 3 | **Login `/login`** | **Wrong product name** undermines trust; minor form gaps. |
| 4 | **Interview Room `/interview`** | Functional and feature-rich but relies on native `alert`/`confirm`; dense. |
| 5 | **Resume Checker `/resume-checker`** | Strong, accessible; only the simulated progress is questionable. |
| 6 (best) | **Results `/results/[id]`** | Most polished and information-dense; one color typo aside, it's the reference-quality screen. |

_Global components, ranked alongside: Navbar (needs mobile menu) < Chatbot
(z-index bug, redundant) — both below the route screens in priority only because
they're smaller surfaces._

---

## 4. What was implemented in this pass (Dashboard only)

Functionality is unchanged — data fetching, the `/health` probe, role → interview
navigation, the trend chart, the history table, and the offline banner all behave
exactly as before. Changes are presentational/accessibility/copy:

1. **Hero tightened** — reduced the oversized `70vh`/`mb-24` block so the stats
   and role grid are reachable sooner; responsive padding.
2. **Honest pacing state** — the WPM card's reassurance message is now
   **data-aware**: neutral prompt when there's no data, in-range confirmation
   only when WPM is actually within the 110–140 target, and an out-of-range note
   otherwise.
3. **Keyboard accessibility** — role “Start Interview” buttons and history “View
   Report” buttons get visible `focus-visible` rings and clear `aria-label`s.
4. **Real micro-interactions** — replaced no-op `hover:scale-102` / `active:scale-98`
   with valid transforms so hover/press feedback actually renders.
5. **Fixes** — `bg-violet-55` → `bg-violet-50`; removed the duplicate `<circle>`
   drawn per chart point; `role="alert"` on the offline banner; `scope="col"` on
   history table headers.

### Deferred (require broader, multi-file work — out of scope for “Dashboard only”)
- Replace the CSS-variable palette hijack with real semantic tokens (§1.1).
- Repo-wide dead-class normalization (§1.2).
- Navbar mobile menu; Chatbot `z-55` fix; Login brand name; remove Advisor
  Lorem Ipsum; Results `bg-rose-50` pill typo.
