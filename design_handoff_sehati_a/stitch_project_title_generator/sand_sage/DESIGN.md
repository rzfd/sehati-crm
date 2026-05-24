---
name: Sand & Sage
colors:
  surface: '#FFFFFF'
  surface-dim: '#EEE7D5'
  surface-bright: '#fff8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2e6'
  surface-container: '#f6ece1'
  surface-container-high: '#f0e7db'
  surface-container-highest: '#eae1d5'
  on-surface: '#1f1b14'
  on-surface-variant: '#434841'
  inverse-surface: '#343028'
  inverse-on-surface: '#f9efe3'
  outline: '#737971'
  outline-variant: '#c3c8bf'
  surface-tint: '#4a654a'
  primary: '#466147'
  on-primary: '#ffffff'
  primary-container: '#5e7a5e'
  on-primary-container: '#edffe9'
  inverse-primary: '#b0cfae'
  secondary: '#95492b'
  on-secondary: '#ffffff'
  secondary-container: '#fe9d7a'
  on-secondary-container: '#773217'
  tertiary: '#385f73'
  on-tertiary: '#ffffff'
  tertiary-container: '#51788d'
  on-tertiary-container: '#f6fbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ccebc9'
  primary-fixed-dim: '#b0cfae'
  on-primary-fixed: '#07200c'
  on-primary-fixed-variant: '#334d34'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59b'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#773217'
  tertiary-fixed: '#c1e8ff'
  tertiary-fixed-dim: '#a4cce3'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#234b5e'
  background: '#FAF6EE'
  on-background: '#1f1b14'
  surface-variant: '#eae1d5'
  surface-alt: '#F2EDE0'
  ink-muted: '#6F665A'
  ink-dim: '#A39A8B'
  border: '#E8E0CC'
  border-soft: '#F0E9D6'
  primary-soft: '#EAEFE3'
  primary-dim: '#D9E1D2'
  accent-soft: '#F0D9CB'
  danger: '#A8443E'
  danger-soft: '#F2D6D3'
  warning: '#C97B2C'
  warning-soft: '#F4E1CC'
  info-soft: '#D6E1E7'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  card-title:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  eyebrow:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  code-mono:
    fontFamily: DM Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 224px
  topbar-height: 56px
  desktop-margin: 24px
  mobile-margin: 16px
  gutter: 16px
  stack-sm: 8px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The design system is a warm, calm, and professional healthcare aesthetic designed specifically for the Indonesian medical landscape. It balances the clinical reliability required by hospitals with the approachability of a modern, AI-integrated service.

**Design Narrative:**
- **Style:** Corporate Modern with a "Warm Minimalist" twist. It avoids the cold, sterile whites of traditional medical software in favor of organic, earthy tones.
- **Personality:** Trustworthy, empathetic, and organized.
- **Target Audience:** Indonesian patients (seeking clarity and comfort) and clinical staff (requiring efficiency and triage-focus).
- **Core Principle:** Human-AI Transparency. Every AI interaction is visually distinct, ensuring users never confuse a machine's guidance for a human professional's advice.

## Colors

The palette is rooted in the "Sand & Sage" concept, using natural tones to reduce patient anxiety and staff fatigue.

- **Primary (Sage):** Used for growth, health, and successful actions. It is the dominant color for buttons and active states.
- **Secondary (Clay):** An earthy accent for alerts, notifications, and specific date/time highlights.
- **Tertiary (Info/Doctor):** A cool blue-slate used specifically for professional medical context and doctor-related information.
- **The Sand Gradient:** The background uses a soft `#FAF6EE` (Sand) rather than pure white to minimize eye strain and feel more welcoming.
- **Semantic Colors:** 
    - **Danger:** Reserved for urgent escalations and system errors.
    - **Warning:** Used for gaps in the Knowledge Base or items requiring attention.

## Typography

The system uses **Plus Jakarta Sans** for the vast majority of interactions to maintain a friendly and accessible tone. **DM Mono** is strictly reserved for technical strings like Booking IDs, timestamps, and search shortcut tags to differentiate data from narrative text.

- **KPI Numbers:** Use the `headline-lg` style with tight tracking for maximum impact.
- **Hierarchies:** Use `eyebrow` styles for section headers in the sidebar or small metadata tags.
- **Language:** All copy must be in Bahasa Indonesia. Ensure font weights remain medium (500) or higher to maintain legibility against the warm sand backgrounds.

## Layout & Spacing

This design system uses a flexible grid approach tailored to the three primary surfaces:

- **Staff/Admin Workspace:** A fixed sidebar (224px) with a fluid content area. The Inbox specifically uses a three-column layout:
    - Left: List (320px)
    - Center: Conversation (Fluid)
    - Right: AI Assist (312px)
- **Patient App (Mobile):** A single-column fluid layout with 16px side margins.
- **Spacing Rhythm:** Based on a 4px baseline, with preferred increments of 8px, 12px, and 16px. Use `stack-md` (12px) for most vertical spacing between elements within cards.

## Elevation & Depth

Hierarchy is conveyed through **Tonal Layers** and **Soft Shadows**. 

- **Surface Tiers:**
    - Level 0: Background (`#FAF6EE`)
    - Level 1: Surface Alt (`#F2EDE0`) used for sidebars and inset areas.
    - Level 2: Surface/Card (`#FFFFFF`) used for primary interaction units.
- **Shadows:** Avoid heavy, dark shadows. Use a subtle `0 1px 2px rgba(45,30,10,0.05)` for standard cards and a larger `0 8px 24px rgba(45,30,10,0.06)` for modals or floating elements. Shadows should feel "warm" by using a dark brown tint rather than pure black.
- **Borders:** Use `border` (`#E8E0CC`) for standard separation and `border-soft` (`#F0E9D6`) for dividers within a card.

## Shapes

The design system employs a "Rounded" (Level 2) logic to maintain a friendly, healthcare-appropriate feel.

- **Standard Cards:** 12px radius.
- **Small Elements:** 8px radius (buttons, input fields, small chips).
- **Large Containers:** 16px radius (large landing cards, hero sections).
- **Interactive Pills:** Full-round (status pills, filter chips, search bar).
- **Icons:** Use "Material Symbols Rounded" style. Active navigation icons should be **filled**, while inactive ones are **outlined**.

## Components

### Chat Bubbles (Critical)
Chat is the core interaction. Bubbles must follow strict coloring to identify the sender:
- **Patient:** `surface-dim` background, left-aligned.
- **AI Assistant:** `primary-soft` background, `primary-dim` border, right-aligned. **Requirement:** Must include "Asisten AI" label and sparkles icon.
- **Staff:** `info-soft` background, info border, right-aligned.
- **Doctor Assistant (Asdok):** `accent-soft` background, accent border, right-aligned.

### Buttons & Inputs
- **Primary Button:** `ink` background with white text for high contrast.
- **Secondary Button:** Outline or `surface-alt` background.
- **Input Fields:** 8px radius, `surface` background, `border` stroke. Focus state uses `primary (sage)` border.

### Status Pills
- Full-round radius.
- 11px Medium text.
- **Urgent:** `danger-soft` background with `danger` text.
- **Sukses/Confirmed:** `primary-soft` background with `primary` text.
- **Info:** `info-soft` background with `tertiary` text.

### Navigation
- **Sidebar (Desktop):** Active item features a white background, bold text, and a 3px Sage (`primary`) left-indicator bar.
- **Bottom Nav (Mobile):** 4 items. Active state uses filled icons and Sage labels.