# Gratuity — Tip Calculator & Bill Splitter

A single-screen tip calculator and bill splitter with live updates, inline validation, and a refined editorial aesthetic.

---

## How to Run

### Option A — Open directly (zero setup)

```bash
open index.html
# or double-click index.html in your file explorer
```

Any modern browser works (Chrome, Firefox, Safari, Edge). No build step, no server, no dependencies.

### Option B — Local dev server (optional, avoids CORS quirks)

With Node.js installed:

```bash
npx serve .
# then visit http://localhost:3000
```

Or with Python 3:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

### Option C — Deployed URL

> Add your Vercel / Netlify / GitHub Pages URL here after deployment.

---

## Stack

Vanilla HTML, CSS, and JavaScript — no frameworks, no bundler, no dependencies (aside from Google Fonts, loaded via CDN).

---

## Features

- Live calculation as you type — no "Calculate" button
- Tip presets (10% / 15% / 20%) + custom percentage input
- Inline validation with animated error messages
- Rounding-up policy (group never underpays) with overage disclosure
- Full keyboard navigation with logical tab order
- Reset button that returns to a clean state
- Responsive down to 360px

---

## Project Structure

```
tip-calculator/
├── index.html     # All HTML, CSS, and JS in one file
├── README.md
└── ANSWERS.md
```
