---
name: KavkazKamen
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#0d0d0d'
  on-primary: '#ffffff'
  primary-container: '#232323'
  on-primary-container: '#8b8a8a'
  inverse-primary: '#c8c6c5'
  secondary: '#615e59'
  on-secondary: '#ffffff'
  secondary-container: '#e8e2db'
  on-secondary-container: '#67645e'
  tertiary: '#260002'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f0009'
  on-tertiary-container: '#dd6463'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e8e2db'
  secondary-fixed-dim: '#cbc6bf'
  on-secondary-fixed: '#1d1b17'
  on-secondary-fixed-variant: '#494641'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410006'
  on-tertiary-fixed-variant: '#842226'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-xl:
    fontFamily: ebGaramond
    fontSize: 84px
    fontWeight: '500'
    lineHeight: 92px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: ebGaramond
    fontSize: 56px
    fontWeight: '500'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: ebGaramond
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: ebGaramond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-caps:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  section-padding: 120px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  grid-column-count: '12'
---

## Brand & Style

The design system is rooted in the intersection of architectural precision and heritage masonry. It evokes a sense of "monumental luxury"—the feeling of weight, permanence, and high-status craftsmanship found in high-end stone workshops and luxury watch boutiques. The target audience includes discerning clients seeking bespoke, museum-quality memorial complexes and architectural stone elements.

The style is **Minimalist / Architectural**, characterized by:
- **Maximum Air:** Significant whitespace to emphasize the "heaviness" and value of the stone materials featured in imagery.
- **Cinematic Framing:** Full-bleed visuals and high-contrast compositions that treat every piece of stone as a work of art.
- **Museum Discipline:** Structural integrity through strict grids, eliminating all non-essential decorative elements to allow the raw material textures to speak.
- **Quiet Luxury:** A focus on tactile transitions and precise typography over flashy UI animations.

## Colors

The palette is derived from natural geological strata and luxury finishes. 

- **Graphite (#232323):** Used for primary text and structural foundations. It provides a deeper, more sophisticated contrast than pure black.
- **Warm Stone (#E8E2DB):** The secondary foundation, used for large section backgrounds to avoid the clinical feel of pure white and provide a "gallery" backdrop.
- **Deep Bordeaux (#6E1118):** A heritage accent used sparingly for meaningful highlights, calls to action, or signature logo elements.
- **Champagne (#B79A72):** A premium metal accent for borders, icons, and subtle dividers, reflecting gold or brass inlays in stonework.
- **Olive (#454A21):** A grounded, organic tone for informational labels or hover states, connecting the product to its natural origin.

## Typography

The typography system relies on a high-contrast pairing between a classical serif and a systematic sans-serif.

- **Headlines (EB Garamond):** Used for titles and expressive statements. The `-0.02em` letter-spacing is mandatory for a tight, editorial look. On mobile, `display-xl` should scale down aggressively to maintain the "monolithic" appearance without breaking layout.
- **Body & Functional UI (Inter):** Provides a technical, architectural balance to the traditional serif. Large body text should maintain generous line heights (1.5x+) to ensure a relaxed reading experience.
- **Labels:** Use `label-caps` for technical specifications (e.g., stone type, dimensions) to give a professional, catalogued feel.

## Layout & Spacing

The layout philosophy is defined by a **Fixed Grid** with generous "air" to mimic architectural blueprints.

- **Hero Sections:** Always `100vh` for a cinematic entrance. Content should be vertically centered or anchored to the bottom left to emphasize the scale of the background imagery.
- **Catalog Grid:** A strict 4-column (desktop) or 2-column (tablet) grid for stone samples and portfolio projects. This creates a dense, gallery-like rhythm.
- **Process Timeline:** A vertical layout using a single center-aligned Champagne (#B79A72) line, with content alternating sides to guide the eye through the craftsmanship stages.
- **Breakpoints:**
  - Desktop (1440px+): 12 columns, 64px margins.
  - Tablet (768px - 1439px): 8 columns, 40px margins.
  - Mobile (Under 767px): 4 columns, 20px margins, fluid vertical stacking.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Tonal Layering** and **Parallax Depth**.

- **Depth through Material:** Surfaces do not float; they sit on top of one another like sheets of marble. Depth is conveyed through subtle changes in background color (e.g., a Graphite container on a Warm Stone background).
- **Parallax Imagery:** Large portfolio cards should utilize a subtle 3D-parallax effect where the image moves slightly within its frame on mouse movement, suggesting physical depth.
- **Interaction Shimmer:** Buttons and cards should feature a very faint "specular highlight" transition on hover—a subtle gradient sweep that mimics light hitting a polished stone surface.
- **Borders:** Use 1px Champagne (#B79A72) lines for structural separation in place of shadows to maintain a clean, architectural aesthetic.

## Shapes

The shape language is **Sharp (0)**. 

To reflect the precision of stone cutting and architectural masonry, no UI elements (buttons, cards, inputs) should have border radii. Every corner must be a perfect right angle. This reinforces the "Architectural Studio" aesthetic and provides a sense of rigidity and permanence. 

The only exception is for circular decorative elements like "scroll-down" indicators or specialized play buttons for project videos, which should be perfect circles (50% radius) to act as geometric counterpoints to the sharp grid.

## Components

- **Buttons:** Primary buttons are Graphite (#232323) with white text, no border-radius. Hover state shifts to Deep Bordeaux (#6E1118) with a smooth 400ms transition. Secondary buttons are outlined in Champagne (#B79A72).
- **Cards:** Portfolio cards are large-scale. The text overlay (Title, Stone Type) should only appear on hover via a subtle upward slide or a fade-in of a semi-transparent Graphite overlay.
- **Input Fields:** Bottom-border only (1px Graphite). Placeholder text in Inter, Light weight. Labels use `label-caps`. Focus state thickens the bottom border and changes the color to Champagne.
- **Counters:** For "Years of Experience" or "Completed Projects," use `display-xl` in EB Garamond with a very slow, graceful count-up animation.
- **Process Steps:** Large numerals in Champagne (#B79A72) with a low opacity background, paired with a short Graphite headline and Inter body text.
- **Navigation:** Transparent by default on hero sections, transitioning to a solid Warm Stone (#E8E2DB) background with a 1px bottom border upon scrolling.