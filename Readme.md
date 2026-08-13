# priyam1498.github.io

Personal site. Static HTML and CSS, no build step.

## Files
- `index.html` — the whole site, one page with anchored sections
- `styles.css` — tokens for dark and light mode at the top
- `assets/favicon.svg`
- `assets/CV_Priyam_Srivastava.pdf` — drop the current CV here
- `assets/fig-metrology.png`, `assets/fig-rl.png` — research figures
- `assets/og-card.png` — 1200x630 link preview image (optional)

## Adding the research figures
In `index.html`, each thrust has a placeholder:

```html
<div class="figslot">assets/fig-metrology.png</div>
```

Replace with:

```html
<img src="assets/fig-metrology.png" alt="short description of what the figure shows">
```

Crop figures to roughly 4:3 and export at 2x (about 720x540) so they stay sharp
on retina screens. Keep them under ~200 KB each.

## Theme
Dark by default. The toggle writes to `localStorage`; first-time visitors get
their system preference. All colors live in the `:root`, `[data-theme='dark']`,
and `[data-theme='light']` blocks in `styles.css`.

## Deploying
Commit to the repo root on the default branch. GitHub Pages serves it directly.
The old `research.html` and `hobbies.html` can be deleted, or kept as redirect
stubs if anything links to them.
