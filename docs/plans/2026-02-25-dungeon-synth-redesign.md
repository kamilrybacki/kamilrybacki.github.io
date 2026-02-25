# Dungeon Synth Redesign -- Design Document

Port the visual design from `dungeon-synth-sanctuary` (Lovable/React) to the existing Eleventy blog.
Keep the 11ty + Markdown stack, restyle everything to match the dark "dungeon synth" aesthetic.

## Color Palette

- Background: `hsl(0, 0%, 3%)` (#080808)
- Foreground: `hsl(40, 20%, 85%)` (#D9D0C0)
- Primary/accent (gold): `hsl(43, 50%, 55%)` (#C8A850)
- Muted text: `hsl(40, 10%, 50%)` (#8C8070)
- Secondary foreground: `hsl(40, 20%, 75%)`
- Borders: `hsl(0, 0%, 15%)` (#262626)
- Card/code background: `hsl(0, 0%, 6%)`
- Selection: gold tint `hsl(43 50% 55% / 0.3)`

## Typography

- Headings: Cinzel (400-900), wide letter-spacing
- Body: Crimson Text (400, 600, 700 + italics), 18px base, line-height 1.7
- Code: JetBrains Mono (400, 500)

## Layout

### Header
- Bottom border only
- Left: "Kamil Rybacki" in Cinzel 3xl/4xl with text-glow + flicker animation. Below: gold accent line + italic tagline
- Right: LinkedIn + GitHub SVG icons, muted -> gold on hover
- Max-width container: 48rem centered

### Hero (homepage only)
- hero-dungeon.jpg background at 40% opacity with gradient overlay to background
- Two intro paragraphs only (no greeting, no kaomoji)
- Padding: 4rem mobile / 6rem desktop

### Articles Section
- "Writings" heading: small uppercase Cinzel + horizontal line
- Category filter: uppercase Cinzel buttons, gold active state
- Article cards: title (Cinzel, gold hover), date (mono) + category (tiny Cinzel), description (Crimson Text)
- Fade-in animation via IntersectionObserver, 80ms stagger

### Article Page
- Back link with arrow, mono, muted -> gold hover
- Title: Cinzel 3xl/4xl with text-glow
- Dotted separator, date + category meta row
- Content: Crimson Text, dark code blocks (JetBrains Mono), gold-bordered blockquotes, dark Prism theme

### Footer
- Top border, centered copyright in Cinzel, muted

## Effects
- Grain overlay: SVG feTurbulence noise, 6% opacity, fixed, z-index 9999
- Text glow: `text-shadow: 0 0 20px hsl(43 50% 55% / 0.15)`
- Flicker: opacity 1 <-> 0.85 over 3s infinite
- Card fade-in: IntersectionObserver + translateY + staggered delay
- Selection: gold background tint

## File Changes

### Modified
- `src/styles/tokens/variables.css`
- `src/styles/base/reset.css`
- `src/styles/base/typography.css`
- `src/styles/layouts/base-layout.css`
- `src/styles/layouts/article-layout.css`
- `src/styles/prism.css`
- `src/_layouts/base.njk`
- `src/_layouts/article.njk`
- `src/index.njk`
- `public/article-filters.js`

### New
- `public/images/hero-dungeon.jpg`

### Unchanged
- `.eleventy.js`
- Article markdown files
- GitHub Actions workflow
- `package.json`
