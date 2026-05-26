# ANSWERS.md

---

## 1. How to Run

Open `index.html` directly in any modern browser — no installation required.

```bash
open index.html
```

For a local server (optional):

```bash
npx serve .
# → http://localhost:3000
```

> Deployed URL: _(add after deployment)_

---

## 2. Stack & Design Choices

**Stack:** Vanilla HTML/CSS/JS, no framework, no bundler. I chose this because the task is a focused single-screen calculator — adding React would mean a build pipeline and runtime overhead for a component that has maybe 8 pieces of state. Plain JS stays in the browser's native event model, loads instantly, and makes the tab-order and focus management easier to reason about. Google Fonts is the only external dependency, loaded via CDN.

**Design direction:** I went for a *refined editorial / luxury receipt* aesthetic — warm off-white paper tone, ink-black typography, Playfair Display as the display serif. It treats the output like an actual restaurant bill rather than a generic SaaS dashboard.

**Decision 1 — The hero "Per Person" block takes the full width of the results column at the bottom.**

The per-person figure is what the user actually cares about. Everything else (tip amount, grand total) is supporting context. By giving that number its own dark-background panel with a large serif typeface, I made the primary output the visual endpoint your eye lands on after scanning down the results column. The bump animation on change reinforces that this is the live answer, not just a label.

**Decision 2 — Two-column layout (inputs left, results right) on wide screens, stacked on narrow.**

A single-column layout forces the user to scroll past all the inputs to see results update. Side-by-side keeps the input fields and output summary in simultaneous view, so the live-update behavior is immediately perceived — you type a number and the receipt column reacts without any scroll. On screens below 600px the columns stack (inputs first, summary second), because the viewport is too narrow for two usable columns and the tab order stays correct when stacked vertically.

---

## 3. Responsive & Accessibility

**360px phone:** Single-column layout. Inputs stack above results. The hero per-person block spans full width. Font sizes use `clamp()` so headings scale down gracefully. The tip preset buttons are a 3+1 grid that remains tappable. The custom tip input and number-pad (`inputmode="decimal"` / `inputmode="numeric"`) pull up the right mobile keyboard so users don't get a full QWERTY for a number field.

**1440px laptop:** Two-column grid. Both panels are visible simultaneously. The card is capped at 740px max-width and centred, so it doesn't stretch uncomfortably wide on large monitors.

**Accessibility handled:** Keyboard navigation — `Enter` on the bill field moves focus to the first preset button; `Enter` on the custom tip field moves focus to the people field; `Enter` on the people field moves focus to Reset. The tip preset buttons use `aria-pressed` to communicate active state to screen readers. Error containers use `role="alert"` and `aria-live="polite"` so assistive technology announces validation messages without interrupting typing. Inputs have `aria-describedby` pointing to their error containers, and `aria-invalid` is toggled programmatically. The results section has `aria-live="polite"` and `aria-atomic="true"` so screen readers announce the updated total as a group. Color contrast for all text passes WCAG AA (dark ink on cream background; white text on dark hero panel).

**Accessibility skipped:** I did not implement a skip-to-results link. On a single-screen calculator with a short tab sequence this is low priority, but on a longer page it would be the right call. I also did not test with a screen reader on Android (TalkBack), only with VoiceOver on macOS — behaviour differences in mobile screen reader + virtual keyboard combinations are a known gap.

---

## 4. AI Usage

I used Claude (Sonnet) to help draft portions of this project. Here are the specific places and what I changed:

**1 — Initial HTML structure.** Claude produced a two-column card layout with input fields and a results panel. The original output used a single `<div class="results">` with a few `<p>` tags for the numbers. I restructured this into distinct `.receipt-row` elements with separate label and value spans, because the row-based receipt metaphor needed semantic pairing between label and value for the aria-label text to make sense to screen readers.

**2 — Rounding logic.** Claude's first pass used `Math.round()` on the per-person amount, which means the group could underpay by a few paisa. I switched this to `Math.ceil(exact * 100) / 100` (ceiling at the paisa level) and added the overage disclosure note so users know they're collecting a small surplus. This was a deliberate product decision about who bears the rounding risk (the payer, not the recipient), not a styling fix.

**3 — Validation error display.** Claude generated the error elements with `display: none` toggled via JS. I replaced the show/hide toggle with a CSS transition (`opacity` + `translateY`) and a `.visible` class, so errors slide in and out rather than snapping. This was important for the stated requirement that "errors should appear and disappear gracefully, not flicker." The `min-height` on the error container also prevents the layout from jumping when errors appear and disappear.

---

## 5. Honest Gap

The rounding disclosure ("↑ rounded up · group collects +Rs X.XX extra") appears as small mono text below the hero block. It's functional but not polished — if the overage is, say, Rs 0.04, a user might not understand why the per-person total × people doesn't exactly equal the grand total shown above. I would improve this by adding a small explainer tooltip or expandable note that explains the rounding policy in plain language ("We round each share up to the nearest paisa so the venue is never shortchanged. The group collects Rs 0.04 more than the bill requires."). With another day I'd also add a second output row showing "Total collected" vs "Grand total" when they differ, making the arithmetic transparent at a glance.
