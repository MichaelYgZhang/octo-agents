# Sidebar Responsive Width Design

**Date:** 2026-03-26
**Status:** Approved
**Scope:** Left sidebar width responsiveness

## Problem Statement

The left sidebar currently uses a fixed 250px width on desktop screens (>768px). This doesn't scale proportionally with screen size, leading to suboptimal use of screen real estate on different monitor sizes.

## Solution

Convert the sidebar width from fixed pixels to percentage-based, allowing it to scale proportionally with screen width.

### Desktop/Tablet Screens (>768px)

- **Change:** `width: 250px` → `width: 15%`
- **Behavior:** Sidebar scales proportionally with screen width
- **No constraints:** No min-width or max-width constraints

#### Width Examples

- At 1024px screen width: sidebar = ~154px
- At 1440px screen width: sidebar = ~216px
- At 1920px screen width: sidebar = ~288px
- At 2560px screen width: sidebar = ~384px

### Mobile Screens (≤768px)

- **No changes:** Keep existing top header layout
- Current mobile behavior remains unchanged

## Implementation

### File Changes

**File:** `index.html`
**Line:** 13
**Current:**
```css
.sidebar { width: 250px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; }
```

**Updated:**
```css
.sidebar { width: 15%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; }
```

## Benefits

1. **Proportional scaling:** Sidebar width adapts to screen size naturally
2. **Better space utilization:** Content area gets proportionally more space on larger screens
3. **Simpler CSS:** Single percentage value instead of fixed pixels
4. **No breakpoints needed:** Fluid scaling across all desktop/tablet sizes

## Considerations

### Content Area Impact

The content area will now be approximately 85% of screen width (minus padding):
- More space for charts and data visualization on large monitors
- Maintains readability on smaller tablets

### Font Size and Readability

At very small tablet sizes (~769px), sidebar will be ~115px wide. This is narrower than the current 250px, which may affect:
- Menu item text wrapping
- Logo appearance
- Stock selector dropdown

**Mitigation:** If testing reveals readability issues at smaller sizes, we can add a min-width constraint in a follow-up iteration.

## Testing Plan

1. Test at multiple screen widths: 1024px, 1440px, 1920px, 2560px
2. Verify menu items remain readable
3. Check logo and stock selector fit properly
4. Confirm content area displays correctly
5. Verify mobile layout (≤768px) remains unchanged

## Success Criteria

- Sidebar scales proportionally on all screens >768px
- No layout breakage or content overflow
- Menu items remain fully readable
- Stock selector functions correctly
- Mobile behavior unchanged
