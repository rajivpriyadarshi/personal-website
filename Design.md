# Design System — Warm Editorial

A hybrid design language combining **warm glass surfaces** with **high-fashion editorial typography**. The aesthetic of a luxury fashion magazine shot in a sunlit atelier with frosted glass partitions.

---

## 1. Visual Theme & Atmosphere

**Core Identity:** Warm glass meets editorial precision.

- Frosted surfaces over warm cream backgrounds
- Oversized editorial typography that dominates
- Line-based visual hierarchy
- Soft corners (10-14px radius)
- Dramatic negative space

**Mood:** Calm, confident, luxurious — like a Celine editorial in a warm paper studio.

**Inspirations:**
- High-end fashion editorials (Vogue, Harper's Bazaar)
- Architectural monographs and museum catalogs
- Luxury brand identities (Chanel, Celine, Bottega Veneta)
- Award-winning book design and fine typography

---

## 2. Color Palette

```css
/* Background */
--bg:              #faf8f2        /* warm cream */
--bg-alt:          #f5f2ea        /* slightly darker cream */
--bg-gradient:     radial-gradient(ellipse 80% 50% at 20% 0%, rgba(255, 244, 224, 0.8) 0%, transparent 50%),
                   radial-gradient(ellipse 60% 40% at 80% 10%, rgba(244, 228, 212, 0.6) 0%, transparent 50%);

/* Surfaces */
--surface:         rgba(255, 251, 244, 0.7)    /* frosted warm white */
--surface-solid:   #fffbf4                      /* opaque warm white */

/* Text */
--text:            #1a1814        /* warm black */
--text-muted:      #6a5f52        /* warm gray */
--text-light:      #9a8f82        /* light warm gray */

/* Borders */
--border:          rgba(26, 24, 20, 0.08)      /* hairline */
--border-strong:   rgba(26, 24, 20, 0.15)      /* visible */
--border-rule:     rgba(26, 24, 20, 0.25)      /* emphasis */

/* Accent */
--accent:          #b45837        /* muted terracotta */
--accent-hover:    #9d4d30        /* darker terracotta */
--accent-soft:     #e4b894        /* light terracotta */
--accent-muted:    rgba(180, 88, 55, 0.1)      /* subtle terracotta */
```

**Rule:** Everything bends warm. No cold blues or grays.

---

## 3. Typography

### Fonts

| Role | Font | Fallback | Weight |
|------|------|----------|--------|
| Display / Headlines | PP Editorial New | Tiempos Headline, Georgia | 200, 400 |
| Body / UI | Söhne | Inter, system-ui | 300, 400, 500 |

### Scale — Oversized Editorial

```css
--text-xs:      0.75rem      /* 12px */
--text-sm:      0.875rem     /* 14px */
--text-base:    1rem         /* 16px */
--text-lg:      1.125rem     /* 18px */
--text-xl:      1.25rem      /* 20px */
--text-2xl:     1.5rem       /* 24px */
--text-3xl:     2rem         /* 32px */
--text-4xl:     2.5rem       /* 40px */
--text-5xl:     3rem         /* 48px */
--text-6xl:     4rem         /* 64px */
--text-7xl:     5rem         /* 80px */
--text-8xl:     6rem         /* 96px */
--text-9xl:     8rem         /* 128px */
--text-10xl:    10rem        /* 160px */
--text-display: 12rem        /* 192px */
```

### Typography Classes

| Class | Use |
|-------|-----|
| `.display` | Massive headlines, tight leading (0.9), negative tracking |
| `.display-light` | Ultralight display, elegant feel |
| `.display-italic` | Editorial emphasis |
| `.headline-xl/lg/md/sm` | Responsive headline sizes |
| `.body-lg/base/sm` | Body text variants |
| `.label` | Uppercase, tracked, small caps style |
| `.label-sm` | Smaller labels |

### Rules

- Headlines **dominate** — use extremely large type (8xl, 9xl, display)
- Words can act as graphic elements
- Light weights only — avoid anything above 500
- Create contrast between massive headings and restrained body text

---

## 4. Border Radius

```css
--radius-sm:    10px    /* buttons, inputs */
--radius-md:    12px    /* glass-subtle */
--radius-lg:    14px    /* cards, glass, glass-strong */
```

**Rule:** Soft corners everywhere. No sharp 90° edges.

---

## 5. Shadows & Depth

```css
--shadow-sm:    0 2px 8px rgba(180, 88, 55, 0.04)
--shadow-md:    0 4px 24px rgba(180, 88, 55, 0.06)
--shadow-lg:    0 8px 32px rgba(180, 88, 55, 0.08)
--shadow-xl:    0 16px 48px rgba(180, 88, 55, 0.1)

--inner-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.6)
```

**Rule:** Shadows are warm-tinted (terracotta undertone), never neutral gray.

---

## 6. Glass Surfaces

All elevated surfaces use frosted glass with backdrop blur.

| Class | Blur | Saturation | Use |
|-------|------|------------|-----|
| `.glass` | 16px | 150% | Standard panels, cards |
| `.glass-subtle` | 12px | 140% | Lighter elements |
| `.glass-strong` | 24px | 160% | Prominent panels |

**Mobile:** Blur reduced to 8px for performance.

**Includes:**
- `--surface` background
- 1px `--border`
- `--shadow-md`
- `--inner-highlight` (top edge glow)
- `--radius-lg` (14px)

---

## 7. Line-Based Visual System

Use lines to define hierarchy, grouping, and rhythm — not heavy fills or backgrounds.

| Class | Style | Use |
|-------|-------|-----|
| `.line-hairline` | 1px, `--border` | Subtle separation |
| `.line-rule` | 1px, `--border-rule` | Clear division |
| `.line-bold` | 2px, `--text` | Strong emphasis |
| `.line-accent` | 2px, `--accent` | Accent emphasis |

**Border utilities:** `.border-t-hairline`, `.border-b-rule`, `.border-t-bold`, etc.

---

## 8. Components

### Buttons

| Class | Style |
|-------|-------|
| `.btn-primary` | Terracotta fill, cream text, 10px radius |
| `.btn-secondary` | Glass surface, subtle border, 10px radius |
| `.btn-ghost` | Transparent, underline border |

### Cards

| Class | Style |
|-------|-------|
| `.card` | Glass surface, shadow, 14px radius |
| `.card-solid` | Opaque surface, light shadow |
| `.card-outline` | Transparent, border only |

### Inputs

| Class | Style |
|-------|-------|
| `.input` | Glass surface, subtle border, accent focus ring |
| `.input-minimal` | Transparent, bottom border only |

### Links

| Class | Style |
|-------|-------|
| `.link` | Dark text, underline, accent on hover |
| `.link-accent` | Terracotta text, soft underline |
| `.link-subtle` | Muted text, no underline |

---

## 9. Layout

### Containers

| Class | Max Width |
|-------|-----------|
| `.container-narrow` | 680px (reading) |
| `.container-base` | 1000px (app shell) |
| `.container-wide` | 1400px (gallery) |
| `.container-full` | 100% with padding |

### Section Spacing — Dramatic

```css
.section-sm   /* 48px vertical */
.section-md   /* 96px vertical */
.section-lg   /* 128px vertical */
.section-xl   /* 192px vertical */
```

### Spacing Scale

```css
--space-xs:   0.5rem     /* 8px */
--space-sm:   1rem       /* 16px */
--space-md:   1.5rem     /* 24px */
--space-lg:   2rem       /* 32px */
--space-xl:   3rem       /* 48px */
--space-2xl:  4rem       /* 64px */
--space-3xl:  6rem       /* 96px */
--space-4xl:  8rem       /* 128px */
--space-5xl:  12rem      /* 192px */
--space-6xl:  16rem      /* 256px */
```

**Rule:** Whitespace is a primary design element. Let sections breathe.

---

## 10. Do's and Don'ts

### Do

- Let the warm gradient show through every frosted surface
- Use PP Editorial for any display/editorial moment
- Keep weights light (200-500)
- Use oversized typography that dominates
- Create dramatic negative space
- Use lines to separate sections, not cards or backgrounds
- Let every element feel intentional

### Don't

- Use cold blues or grays — everything bends warm
- Use Inter/Söhne for display type (use Editorial)
- Use font weights above 500
- Add heavy shadows or hard borders
- Crowd elements — let them breathe
- Use gradients, neumorphism, or visual clutter
- Add elements that don't serve a purpose

---

## 11. Responsive Behavior

**Mobile adjustments:**
- Gradient simplifies (fewer layers)
- Blur intensity halved (8px) for performance
- Typography scales down gracefully
- Single column layouts
- Generous padding maintained

---

## 12. Agent Prompt Guide

**Bias toward:**
- Warm cream base with radial gradients
- Frosted white surfaces with soft corners
- PP Editorial New for all display typography
- Oversized, dominating headlines
- Light font weights (200-400)
- Muted terracotta accent
- Line-based visual hierarchy
- Dramatic whitespace

**Reject:**
- Cold neutral palettes
- Sans-serif-only hierarchies
- Dark mode as primary
- High-contrast saturated accents
- Sharp corners
- Heavy shadows
- Visual clutter
- Crowded layouts
