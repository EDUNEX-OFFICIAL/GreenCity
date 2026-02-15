# Color System — Bluish Enterprise Admin

## Principles
- Single blue hue family (~260)
- OKLCH-only values
- Light/dark modes with reduced chroma in dark
- Neutral surfaces with slight cool bias
- Color expresses hierarchy (primary, accent, ring), not decoration

## Hue & Chroma
- Hue: 260
- Primary chroma: 0.12–0.15 (light), ~20–30% reduction in dark
- Accent chroma: 0.03–0.05
- Background tint: ≤ 0.01
- Focus ring chroma: ≤ 0.10

## Token Roles
- Primary: brand anchor for actions and active states
- Accent: subtle supportive surfaces
- Ring: focus visuals, never competing with primary
- Sidebar: neutral base, blue-driven primary and accents
- Surfaces: background/card/popover remain neutral with cool bias

## Light Mode (:root)
```
--background: oklch(0.985 0.008 260)
--foreground: oklch(0.145 0 0)
--card: oklch(0.992 0.006 260)
--card-foreground: oklch(0.145 0 0)
--popover: oklch(0.992 0.006 260)
--popover-foreground: oklch(0.145 0 0)
--primary: oklch(0.60 0.15 260)
--primary-foreground: oklch(0.985 0 0)
--secondary: oklch(0.96 0.02 260)
--secondary-foreground: oklch(0.205 0 0)
--muted: oklch(0.96 0.015 260)
--muted-foreground: oklch(0.556 0.02 260)
--accent: oklch(0.96 0.04 260)
--accent-foreground: oklch(0.205 0 0)
--destructive: oklch(0.577 0.245 27.325)
--border: oklch(0.922 0.01 260)
--input: oklch(0.922 0.01 260)
--ring: oklch(0.65 0.08 260)
--chart-1: oklch(0.646 0.222 41.116)
--chart-2: oklch(0.6 0.118 184.704)
--chart-3: oklch(0.398 0.07 227.392)
--chart-4: oklch(0.828 0.189 84.429)
--chart-5: oklch(0.769 0.188 70.08)
--sidebar: oklch(0.985 0.008 260)
--sidebar-foreground: oklch(0.145 0 0)
--sidebar-primary: oklch(0.60 0.15 260)
--sidebar-primary-foreground: oklch(0.985 0 0)
--sidebar-accent: oklch(0.96 0.04 260)
--sidebar-accent-foreground: oklch(0.205 0 0)
--sidebar-border: oklch(0.922 0 0)
--sidebar-ring: oklch(0.65 0.08 260)
```

## Dark Mode (.dark)
```
--background: oklch(0.16 0.008 260)
--foreground: oklch(0.985 0 0)
--card: oklch(0.22 0.008 260)
--card-foreground: oklch(0.985 0 0)
--popover: oklch(0.22 0.008 260)
--popover-foreground: oklch(0.985 0 0)
--primary: oklch(0.70 0.11 260)
--primary-foreground: oklch(0.985 0 0)
--secondary: oklch(0.29 0.012 260)
--secondary-foreground: oklch(0.985 0 0)
--muted: oklch(0.29 0.01 260)
--muted-foreground: oklch(0.715 0.02 260)
--accent: oklch(0.30 0.03 260)
--accent-foreground: oklch(0.985 0 0)
--destructive: oklch(0.704 0.191 22.216)
--border: oklch(1 0 0 / 10%)
--input: oklch(1 0 0 / 15%)
--ring: oklch(0.56 0.06 260)
--chart-1: oklch(0.488 0.243 264.376)
--chart-2: oklch(0.696 0.17 162.48)
--chart-3: oklch(0.769 0.188 70.08)
--chart-4: oklch(0.627 0.265 303.9)
--chart-5: oklch(0.645 0.246 16.439)
--sidebar: oklch(0.205 0.008 260)
--sidebar-foreground: oklch(0.985 0 0)
--sidebar-primary: oklch(0.62 0.11 260)
--sidebar-primary-foreground: oklch(0.985 0 0)
--sidebar-accent: oklch(0.28 0.03 260)
--sidebar-accent-foreground: oklch(0.985 0 0)
--sidebar-border: oklch(1 0 0 / 10%)
--sidebar-ring: oklch(0.56 0.06 260)
```

## Usage Guidance
- Use primary for actions, active navigation, and key emphasis.
- Use accent for subtle surfaces and supportive highlights.
- Use ring for focus states; keep it restrained.
- Keep surfaces neutral; avoid visibly blue panels.

## Accessibility
- Primary foregrounds use untinted high-contrast values.
- Validate contrast for text and interactive states across light/dark.
