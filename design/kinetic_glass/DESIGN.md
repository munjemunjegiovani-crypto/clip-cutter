---
name: Kinetic Glass
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#b4c5ff'
  on-tertiary: '#002a78'
  tertiary-container: '#185ce4'
  on-tertiary-container: '#e0e5ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  code-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system powers a high-velocity, precision-oriented AI video editing experience. It merges structural 2D clarity with luminous, weightless glassmorphism to transform dense multimedia workflows into intuitive, fluid interactions.

### Personality & Emotional Response
- **Surgical Precision:** Every frame marker, cut line, and boundary conveys exactness and total creative control.
- **Electric Energy:** High-contrast neon accents against deep substrates signal compute power, real-time AI processing, and dynamic timeline manipulation.
- **Effortless Flow:** Floating spatial surfaces and translucent layers reduce cognitive load by elevating active clips above inert interface controls.

### Design Language
The aesthetic relies on **Luminous Glass 2D**: flat structural silhouettes paired with multi-layered translucency, ultra-fine frosted strokes, and diffused directional glows. Key highlights catch top edges like polished optics, while low-friction backdrop blurs preserve background scene context without cluttering actionable tools.

## Colors

The palette balances intense radiant spectrums with deep, noise-absorbing foundations. Dark mode serves as the default operational state to prevent eye strain during video scrubbing and editing sessions.

### Core Color Roles
- **Electric Violet (`#7C3AED` / Hover: `#8B5CF6`):** Primary command actions, AI cut triggers, active timeline playheads, and processing states.
- **Neon Cyan (`#06B6D4` / Glow: `#22D3EE`):** AI scene detections, audio peaks, automated markers, and active scrubbing heads.
- **Cobalt Blue (`#2563EB` / Active: `#3B82F6`):** Structural highlights, selection ranges, multi-clip groupings, and secondary operational controls.
- **Coral Flare (`#F43F5E` / Tint: `#FB7185`):** Destructive actions, discarded segments, warnings, and high-energy "Motion Peak" detection flags.

### Canvas Foundations
- **Dark Mode (Default):** Canvas substrate `#0B0F19`, glass surface base `#111827`, elevated control decks `#1E293B`.
- **Light Mode:** Canvas substrate `#F8FAFC`, glass surface base `#FFFFFF`, elevated control decks `#F1F5F9`.

### Functional Application
Never apply gradients to small text or fine iconography. Gradients are reserved for primary action surfaces (`linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)`) and highlight state outlines (`linear-gradient(90deg, #06B6D4, #7C3AED)`).

## Typography

The typographic engine uses **Inter** for all prose, navigational labels, and interface elements to ensure neutral legibility, while **JetBrains Mono** is assigned to timecodes, frame indices, confidence scores, and duration badges.

### Rules of Usage
- **Tabular Numerals:** Always enable `font-feature-settings: "tnum" 1` across body and code styles to avoid frame-jitter during real-time video playback and scrubbing.
- **Hierarchy:** High-level headers use tight negative letter-spacing for visual density. Micro-labels and timecodes employ tracked positive letter-spacing for glanceability under high cognitive loads.

## Layout & Spacing

The system operates on an 8pt base grid with a 4pt subgrid for micro-controls, timeline notches, and nested indicators.

### Layout Model
- **Workbench Architecture:** A fluid, full-viewport dashboard anchored by a modular 12-column layout. The timeline workspace is pinned to the bottom 35-40% viewport height, while video preview panels and AI candidate drawers flex horizontally.
- **Reflow Rules:**
  - **Desktop (>= 1280px):** 12 columns, 24px gutter, full multi-track timeline, side-by-side preview and scene inspector.
  - **Tablet (768px - 1279px):** 8 columns, 16px gutter, collapsible inspector drawer, stacked playback engine above a dense timeline.
  - **Mobile (< 768px):** 4 columns, 12px gutter, bottom-sheet inspector, simplified single-ribbon clip selector with gesture pinch-to-zoom.

## Elevation & Depth

Visual hierarchy combines stacked backdrop filtration with subtle, multi-layered color-tinted ambient shadows.

### Glassmorphism Recipe
- **Glass Panel Surface (Dark Mode):** Background `rgba(17, 24, 39, 0.72)`, backdrop filter `blur(20px) saturate(180%)`, border `1px solid rgba(255, 255, 255, 0.08)`.
- **Glass Panel Surface (Light Mode):** Background `rgba(255, 255, 255, 0.75)`, backdrop filter `blur(20px) saturate(160%)`, border `1px solid rgba(0, 0, 0, 0.06)`.
- **Top Edge Specular Highlight:** Panels feature an inner shadow `inset 0 1px 0 0 rgba(255, 255, 255, 0.12)` to simulate chamfered glass reflection.

### Elevation Hierarchy
1. **Level 0 (Basebed):** Dark navy/slate canvas (`#0B0F19`) underlaid with a slow-moving, organic gradient mesh running at 5% opacity.
2. **Level 1 (Tracks & Playlists):** Recessed layers (`rgba(0, 0, 0, 0.25)` in dark mode) framed with a single sub-pixel border.
3. **Level 2 (Floating Glass Cards & Panels):** Multi-tier shadow:
   `0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 12px 24px -4px rgba(11, 15, 25, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)`.
4. **Level 3 (Modals & Dragged Clips):** Focused shadow amplified with violet aura:
   `0 20px 35px -5px rgba(0, 0, 0, 0.5), 0 0 24px 0 rgba(124, 58, 237, 0.25)`.

## Shapes

The design uses balanced, rounded geometries that soften complex editing controls without sacrificing edge precision.

### Geometric Rules
- **Base Cards & Floating Panels:** Set between `1rem` (16px) and `1.5rem` (24px) for master containers to create distinct floating silhouettes.
- **Controls & Buttons:** Stand at `0.5rem` (8px) for buttons, segment controls, and input frames to maintain actionable distinction.
- **Indicators & Micro-Badges:** Fully curved pill shapes (`9999px`) are reserved exclusively for dynamic clip statuses, confidence meters, and time markers.

## Components

### Buttons
- **Primary Gradient Button:** Filled with a 135deg gradient (`#7C3AED` to `#2563EB`). Features a crisp `1px` semi-transparent inner top highlight, white text, and a diffused hover glow (`box-shadow: 0 0 16px rgba(124, 58, 237, 0.45)`).
- **Secondary Ghost Glass:** Backdrop blur with transparent fill, `1px` border (`rgba(255, 255, 255, 0.14)`), shifting to cyan text and border on hover.
- **Destructive/Cut Button:** Translucent `#F43F5E15` with solid Coral text, blooming to full `#F43F5E` on engagement.

### Segmented Chips
- Floating pill-container hosting contiguous toggles (e.g., "All Scenes", "AI Curated", "Motion Peaks").
- Active tab features a floating glass plate with a vibrant white or neon label; inactive tabs remain muted slate (`#64748B`).

### Action Sliders & Playhead Controls
- **Track:** 4px tall solid slate bar with neon-tinted active fill.
- **Thumb:** 14px circular glass bead with a 2px solid white perimeter, glowing in cyan `#06B6D4` when scrubbed.

### Audio & Video Waveform Tracks
- Rendered on a flat recessed trackbed (`rgba(0, 0, 0, 0.3)`).
- Audio waveforms use vertical rounded bars (2px width, 1px gap) dynamic-colored: Cyan `#06B6D4` for normal decibel bands, shifting to Coral `#F43F5E` when clipping or peak action is reached.
- Selected timeline clips display a continuous 1.5px neon cyan bounding box with draggable glass handle ends.

### Clip Status Badges
- Compact pill elements incorporating JetBrains Mono text and a 4px pulsing status dot:
  - **'5.2s Action'**: Neutral slate background with an electric violet border.
  - **'Kept'**: Cyan background tint (`rgba(6, 182, 212, 0.15)`), Cyan label.
  - **'Motion Peak'**: Coral background tint (`rgba(244, 63, 94, 0.15)`), Coral label, animated warning pulse.

### Input Fields & Search Bars
- Recessed glass surface (`rgba(0, 0, 0, 0.2)` in dark, `rgba(255, 255, 255, 0.6)` in light).
- `1px` neutral border that transitions smoothly to electric violet `#7C3AED` with an 8px diffused outer glow upon focus.