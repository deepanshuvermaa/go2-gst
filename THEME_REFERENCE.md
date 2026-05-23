# Go2GST — Design System Reference
> Privy-inspired. High-contrast digital architecture.

## Color Tokens

| Name | Value | CSS Variable | Role |
|------|-------|-------------|------|
| Canvas White | #ffffff | --color-canvas-white | Page backgrounds, primary text on dark |
| Ink Black | #000000 | --color-ink-black | Primary text on light, borders, icons |
| Deep Midnight | #010110 | --color-deep-midnight | Dark UI backgrounds, primary button fill |
| Carbon Gray | #111117 | --color-carbon-gray | Card backgrounds, elevated surfaces |
| Steel Gray | #22222a | --color-steel-gray | Accent cards, darker elevated surfaces |
| Muted Stone | #73737c | --color-muted-stone | Helper text, secondary info |
| Deep Space Violet | #635bff | --color-deep-space-violet | Accent links, active states, highlights |

## Typography

- **Display/Headings:** IBM Plex Sans (substitute for ABC Favorit), weight 400, letter-spacing -0.03em
- **Body/UI:** Inter, weights 400/500/700, letter-spacing -0.02em
- **Captions:** system-ui, weight 400, 12px

### Type Scale
| Role | Size | Line Height | Letter Spacing |
|------|------|-------------|----------------|
| caption | 12px | 1.2 | -0.24px |
| body-sm | 14px | 1.27 | -0.28px |
| body | 16px | 1.5 | -0.32px |
| subheading | 28px | 1.13 | -0.84px |
| heading | 52px | 1.15 | -1.56px |
| display | 76px | 1.23 | -2.28px |

## Spacing
4, 5, 6, 8, 10, 12, 15, 16, 17, 19, 20, 24, 28, 30, 32, 70px

## Border Radius
- Cards: 8px
- Small elements: 2px
- Buttons: 100px (pill)
- Extreme: 951px

## Layout
- Section gap: 70px
- Card padding: 16px
- Element gap: 10px

## Surfaces (Elevation via color, NO shadows)
| Level | Color | Purpose |
|-------|-------|---------|
| 0 | #ffffff | Page background |
| 1 | #111117 | Primary cards |
| 2 | #22222a | Emphasized cards |

## Component Rules
- Primary Button: Deep Midnight fill, white text, 100px radius, 16px padding
- Ghost Button: Transparent bg, violet text+border, 100px radius
- Cards: No shadow, no border, color contrast only
- Inputs: Transparent bg, Deep Midnight border, no radius
- Nav links: Ink Black, violet on hover/active

## Do NOT
- Use multiple accent colors (violet only)
- Use drop shadows
- Use gradients
- Use generic system fonts for body (always Inter)
- Add borders on cards

## Icons
- Source: https://www.itshover.com/icons (interactive/animated)
- Style: Minimal line icons, consistent stroke width

## UI Libraries Reference
- 21st.dev for premium components
- No AI-slop patterns (no generic gradients, no stock illustrations)
