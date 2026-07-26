# Formula 1 Inspired Design System

> AI-first design specification inspired by the visual language of
> Formula1.com.

## 1. Design Philosophy

Build interfaces that feel: - Fast - Premium - Technical - Minimal -
Data-dense - Confident - High-performance

The UI should never feel playful, soft, or decorative.

## 2. Brand Personality

Keywords:

-   Precision
-   Performance
-   Engineering
-   Motorsport
-   Confidence
-   Speed
-   Contrast
-   Clarity

## 3. Color System

### Primary

``` css
--color-primary: #E10600;
--color-primary-hover: #FF241D;
```

### Background

``` css
--bg-0: #000000;
--bg-1: #0F0F10;
--bg-2: #171717;
--bg-3: #202020;
```

### Text

``` css
--text-primary: #FFFFFF;
--text-secondary: #CFCFCF;
--text-muted: #8D8D8D;
```

### Border

``` css
--border: #2A2A2A;
```

## 4. Typography

The original Formula 1 font is proprietary.

Recommended free stack:

    Headings:
    Titillium Web

    Alternative:
    Barlow Condensed

    Body:
    Inter

    Monospace:
    JetBrains Mono

### Heading Rules

-   Uppercase for primary page titles.
-   Font weight: 700--800.
-   Slight letter spacing (0.02--0.04em).

### Scale

  Token       Size
  --------- ------
  Display     56px
  H1          48px
  H2          36px
  H3          28px
  H4          22px
  Body        16px
  Small       14px
  Caption     12px

## 5. Border Radius

``` text
Buttons: 6px
Inputs: 6px
Cards: 8px
Images: 8px
Maximum: 10px
```

## 6. Spacing

Use an 8px spacing system.

    4
    8
    16
    24
    32
    40
    48
    64
    80
    96

## 7. Layout

Container: 1320px

Maximum width: 1440px

Grid: 12 columns

Gap: 24px

## 8. Buttons

Primary: - Solid F1 red - White text - Bold - 6px radius

Secondary: - Dark background - White border - White text

Ghost: - Transparent - No border

Hover: - Brightness +10% - Transition 180ms ease-out

## 9. Cards

Background: #111111

Border: 1px solid #262626

No large shadows.

## 10. Forms

Dark inputs.

Focus state: Primary red border.

## 11. Tables

Compact.

48px row height.

Thin separators.

## 12. Motion

Duration: 150--250ms

Timing: ease-out

Allowed: - opacity - translateY(-2px) - color - background -
border-color

Avoid elastic animations.

## 13. Imagery

Use high-quality motorsport photography.

Prefer 16:9.

Large hero images.

## 14. Icons

Simple outline icons.

18--24px.

Consistent stroke width.

## 15. Accessibility

Minimum contrast ratio: 4.5:1

Always visible focus states.

Keyboard navigation required.

## 16. AI Implementation Rules

When generating UI:

-   Prefer dark theme.
-   Use red only as the primary accent.
-   Avoid gradients as a dominant visual element.
-   Avoid glassmorphism.
-   Avoid neumorphism.
-   Avoid oversized rounded corners.
-   Keep layouts clean and structured.
-   Use strong typography.
-   Maintain generous whitespace.
-   Prefer information density over decoration.

## 17. CSS Tokens

``` css
:root {
  --color-primary:#E10600;
  --bg-primary:#000;
  --bg-secondary:#111;
  --text-primary:#fff;
  --text-secondary:#cfcfcf;
  --border:#2a2a2a;
  --radius-sm:6px;
  --radius-md:8px;
  --space:8px;
}
```

## 18. Final Design Goal

Every generated interface should resemble a premium motorsport product:
fast, elegant, engineering-driven, highly readable, and visually
disciplined.
