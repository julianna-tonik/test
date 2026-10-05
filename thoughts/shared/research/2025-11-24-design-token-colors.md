---
date: 2025-11-24T17:38:38+01:00
researcher: AI Research Assistant
git_commit: 0df2f1c5fbb0742a500d9b1d17d40381078f5f33
branch: main
repository: offers
topic: "Design token colors - Research proper usage for color tokens in Tailwind code with CSS variables"
tags: [research, codebase, design-tokens, tailwind, css-variables, color-system]
status: complete
last_updated: 2025-11-24
last_updated_by: AI Research Assistant
---

## Research Question

Research proper usage for color tokens in the Tailwind code. Currently there are instances of direct value usages in square brackets. I want to use colors based in CSS vars.

## Summary

The codebase has 70+ instances of hardcoded color values using Tailwind's arbitrary value syntax (e.g., `bg-[#212121]`, `text-[#EFEFEF]`) instead of leveraging the existing CSS variable system. The project uses Tailwind CSS v4 with a sophisticated dual color system (OKLCH-based semantic tokens and "Vibe Cleaner" hex-based tokens), but components bypass this system entirely. A complete migration to CSS variable-based tokens would improve maintainability, enable theming, and ensure consistency across the design system.

## Detailed Findings

### Current Color System Architecture

#### Dual Token System in `src/app/globals.css`

**Modern OKLCH System (lines 5-43):**
- Uses perceptually uniform OKLCH color space
- Semantic tokens like `--background`, `--foreground`, `--primary`
- Example: `--background: oklch(0.2478 0 0)` (dark background)

**Vibe Cleaner Design Tokens (lines 45-50):**
- `--off-black: #212121` - Primary dark color
- `--off-white: #efefef` - Primary light color  
- `--off-white-light: #888888` - Secondary/muted gray
- `--dark-grey: #383838` - Medium gray for backgrounds/borders

#### Tailwind v4 Integration

The project uses Tailwind CSS v4's `@theme inline` directive (lines 53-106) to map CSS variables to utility classes:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... other mappings */
}
```

However, the Vibe Cleaner tokens are **not** mapped in this section, creating a disconnect between defined variables and usable utilities.

### Hardcoded Color Usage Analysis

#### 70+ Instances Found Across Components

**Most Frequently Used Colors:**
- `#EFEFEF` (light gray/white) - 32 instances
- `#888888` (medium gray) - 18 instances  
- `#212121` (dark gray/black) - 12 instances
- `#383838` (dark gray) - 7 instances

**Usage Patterns:**
- Text colors: `text-[#EFEFEF]`, `text-[#888888]`
- Background colors: `bg-[#212121]`, `bg-[#383838]`
- Border colors: `border-[#383838]`, `border-[#888888]`
- Gradients: `from-[#212121]`, `via-[rgba(33,33,33,0)]`, `to-[#212121]`

**Affected Files:**
- All offer section components (`hero-section.tsx`, `pricing-section.tsx`, etc.)
- UI components (`button.tsx`, `separator.tsx`)
- Main page (`page.tsx`)

### Color Mapping to Existing Variables

| Hardcoded Value | CSS Variable | Intended Usage |
|---------------|-------------|----------------|
| `#EFEFEF` | `--off-white` | Primary text, button hover states |
| `#888888` | `--off-white-light` | Secondary text, borders, muted content |
| `#212121` | `--off-black` | Backgrounds, button text, icon backgrounds |
| `#383838` | `--dark-grey` | Button backgrounds, borders, dividers |

## Code References

### Key Files

- `src/app/globals.css:4-51` - CSS variable definitions
- `src/app/globals.css:45-50` - Vibe Cleaner Design Tokens
- `src/app/globals.css:53-106` - @theme inline configuration
- `src/components/ui/offers/button.tsx:32-42` - Button component with hardcoded colors
- `src/components/offers/pricing-section.tsx:52-160` - Multiple hardcoded color instances

### Example Issues

**Button Component (`src/components/ui/offers/button.tsx`):**
```tsx
// Current (problematic)
const baseClasses = "bg-[#383838] hover:bg-[#EFEFEF] text-[#212121]"
const iconClasses = "bg-[#212121] group-hover:text-[#212121]"

// Should be (with proper token mapping)
const baseClasses = "bg-button-bg hover:bg-button-bg-hover text-button-text"
const iconClasses = "bg-button-icon-bg group-hover:text-button-text"
```

**Missing Token Mapping in `globals.css`:**
```css
/* Missing from @theme inline section */
--color-off-black: var(--off-black);
--color-off-white: var(--off-white);
--color-off-white-light: var(--off-white-light);
--color-dark-grey: var(--dark-grey);
```

## Architecture Insights

### Current System Strengths
1. **Modern Tailwind v4 Setup**: Using latest CSS-first configuration
2. **Dual Color System**: Both OKLCH (modern) and hex (legacy) tokens defined
3. **Sophisticated Shadow System**: Computed shadow utilities with customizable parameters
4. **Consistent Font Usage**: IBM Plex Mono and Neue Montreal throughout

### Critical Issues
1. **Bypassed Variable System**: Components use arbitrary values instead of defined tokens
2. **Incomplete Token Mapping**: Vibe Cleaner tokens not exposed as Tailwind utilities
3. **No Semantic Layer**: Missing semantic tokens that reference primitive colors
4. **Maintenance Burden**: 70+ hardcoded values make color changes difficult

### Design Token Pattern Gaps
- No primitive → semantic token hierarchy
- Missing opacity modifiers for tokens
- No dark mode variants defined
- SVG elements use hardcoded fill/stroke values

## Historical Context (from thoughts/)

No relevant historical documents found in the thoughts/ directory regarding color token implementation or design system decisions.

## Related Research

No existing research documents found on this topic in the repository.

## Open Questions

1. **Migration Strategy**: Should we migrate to the OKLCH system or enhance the existing hex-based Vibe Cleaner tokens?
2. **Semantic Token Naming**: What naming convention should be used for semantic tokens (e.g., `color-primary` vs `color-button-bg`)?
3. **Component-Specific Tokens**: Should we create component-specific tokens or use generic semantic tokens?
4. **SVG Color Handling**: How should SVG fill and stroke colors be handled with the token system?
5. **Gradient Support**: How to handle gradient stops with CSS variables in Tailwind v4?

## Recommendations

### Immediate Actions

1. **Map Existing Vibe Cleaner Tokens**:
   ```css
   @theme inline {
     --color-off-black: var(--off-black);
     --color-off-white: var(--off-white);
     --color-off-white-light: var(--off-white-light);
     --color-dark-grey: var(--dark-grey);
   }
   ```

2. **Create Semantic Token Layer**:
   ```css
   :root {
     --color-text-primary: var(--off-white);
     --color-text-secondary: var(--off-white-light);
     --color-text-muted: var(--off-white-light);
     --color-surface-primary: var(--off-black);
     --color-surface-secondary: var(--dark-grey);
     --color-border-default: var(--dark-grey);
     --color-border-subtle: var(--off-white-light);
   }
   ```

3. **Phase 1 Migration**: Replace hardcoded values with semantic tokens in high-traffic components (Button, Hero, Pricing sections).

### Long-term Strategy

1. **Establish Token Hierarchy**: Primitive → Semantic → Component tokens
2. **Implement Opacity Modifiers**: Use `/50`, `/[0.3]` syntax with tokens
3. **Add Dark Mode Support**: Define theme-specific token values
4. **Create Migration Tools**: Scripts to find and replace hardcoded values
5. **Documentation**: Establish token usage guidelines and naming conventions

### Implementation Priority

**High Priority:**
- Map Vibe Cleaner tokens to Tailwind utilities
- Replace button component hardcoded colors
- Update hero section colors

**Medium Priority:**
- Migrate all offer section components
- Implement semantic token layer
- Add opacity modifier support

**Low Priority:**
- SVG color token integration
- Gradient token system
- Advanced color functions (color-mix, --alpha)