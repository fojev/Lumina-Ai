---
name: Lumina AI
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#8127cf'
  on-secondary: '#ffffff'
  secondary-container: '#9c48ea'
  on-secondary-container: '#fffbff'
  tertiary: '#545c70'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d7489'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#dbe2fa'
  tertiary-fixed-dim: '#bfc6dd'
  on-tertiary-fixed: '#141b2c'
  on-tertiary-fixed-variant: '#3f4759'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max-width: 800px
  gutter: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  section-padding: 4rem
---

## Brand & Style

The design system is anchored in the concept of "Illuminated Intelligence." It aims to evoke a sense of calm authority, clarity, and futuristic sophistication. The target audience consists of professionals, creatives, and power users who seek a premium, distraction-free environment for deep work and synthesis.

The visual style is a refined hybrid of **Minimalism** and **Glassmorphism**. It prioritizes a high signal-to-noise ratio, utilizing light-as-air surfaces and subtle depth to guide the user's focus toward the conversation. The aesthetic avoids the "gamer" neon tropes of early AI, instead opting for a soft, ethereal glow that feels organic and approachable.

## Colors

The palette is built on a foundation of "Atmospheric Gradients." 

- **Primary & Secondary:** A soft transition between Periwinkle Blue and Muted Amethyst. These are used for active states, AI-generated icons, and brand accents.
- **Light Mode:** Uses a "Pure Ceramic" base (#FFFFFF) with ultra-faint gradients of blue-tinted white to create a sense of three-dimensional space without heavy lines.
- **Dark Mode:** Moves away from pure black to a "Deep Obsidian" (#0B0E14). Depth is achieved through localized "glow" overlays in the background rather than varying gray values.
- **Accents:** Use low-saturation versions of the primary colors to maintain a premium, subdued feel.

## Typography

The typography system uses **Inter** for its exceptional readability and systematic feel in the core interface and conversation threads. To inject a hint of "intelligent technology," **Space Grotesk** is used sparingly for labels, small metadata, and secondary navigation elements.

Line heights are intentionally generous (1.6x for body text) to promote reading endurance. Tracking is slightly tightened for large display headers to maintain a "tight" premium feel, while small labels use increased tracking for legibility.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the core conversation, centered within the viewport to minimize eye strain. 

1.  **Centered Thread:** The primary chat history is confined to a 800px max-width container.
2.  **Generous Margins:** Side margins scale dynamically, but the content never exceeds its comfortable reading width.
3.  **Vertical Rhythm:** Message blocks are separated by significant whitespace to clearly delineate speaker turns.
4.  **Floating Navigation:** Sidebar and input elements appear as floating layers rather than docked blocks, maintaining the "light" aesthetic.

## Elevation & Depth

This design system uses **Glassmorphism** and **Ambient Glows** to establish hierarchy.

- **Level 0 (Base):** The primary background, featuring subtle radial gradients of color in the corners.
- **Level 1 (Messages):** Subtle surface differentiation. AI messages use a faint background tint (5% opacity of primary color), while user messages are plain text or housed in a slightly more elevated card.
- **Level 2 (Input & Overlays):** Floating elements like the chat input bar use `backdrop-filter: blur(20px)` with a 1px border of high-transparency white.
- **Shadows:** Avoid heavy black shadows. Instead, use "Tinted Soft Shadows"—extended blurs (30px-50px) with 5-10% opacity, utilizing the primary blue/purple hues to create a "lifted" effect.

## Shapes

The shape language is "Organic Geometric." While most containers use a standard **Rounded** (0.5rem to 1.5rem) corner radius, interactive elements like buttons and the chat input utilize **Pill-shaped** (full round) edges to feel more inviting. 

Avoid sharp 90-degree angles entirely, as they conflict with the soft, ethereal nature of the brand.

## Components

- **Chat Input:** A floating pill-shaped container. It uses a soft glass effect. The "Send" button is a simple, high-contrast icon that glows slightly when active.
- **Message Bubbles:** Not strictly "bubbles" in the traditional sense. They are frameless text blocks with a very subtle background treatment (glassmorphism) for AI responses to distinguish them from user prompts.
- **Buttons:** Primary buttons use a subtle linear gradient (Primary to Secondary). Secondary buttons use a "Ghost" style with a 1px semi-transparent border.
- **Chips/Badges:** Used for suggested prompts. These should have a light blur and transition to a solid color on hover.
- **Scrollbars:** Custom-styled to be ultra-thin, semi-transparent, and only visible during interaction to reduce visual noise.
- **AI "Thinking" Indicator:** A soft, pulsing glow rather than a mechanical spinning loader, reinforcing the "Lumina" brand concept.