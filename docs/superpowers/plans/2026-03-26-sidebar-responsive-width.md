# Sidebar Responsive Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the left sidebar from fixed 250px width to responsive 15% width for proportional scaling on desktop screens.

**Architecture:** Simple CSS modification to change sidebar width from fixed pixels to percentage-based, allowing fluid scaling across all desktop/tablet screen sizes while maintaining existing mobile behavior.

**Tech Stack:** HTML, CSS (inline styles)

---

## File Structure

**Modified Files:**
- `index.html:13` - Change `.sidebar` width from `250px` to `15%`

**Test Files:**
- Manual browser testing (no automated tests for this CSS-only change)

---

## Task 1: Update Sidebar Width CSS

**Files:**
- Modify: `index.html:13`

- [ ] **Step 1: Open index.html and locate the sidebar CSS**

The `.sidebar` class is defined on line 13 within the `<style>` tag in the `<head>` section.

Current code:
```css
.sidebar { width: 250px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; }
```

- [ ] **Step 2: Update the width property**

Change `width: 250px` to `width: 15%`

Updated code:
```css
.sidebar { width: 15%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; }
```

- [ ] **Step 3: Save the file**

Save `index.html` with the updated CSS.

- [ ] **Step 4: Verify the change was applied correctly**

Run: `grep -n "width: 15%" index.html`
Expected: Output showing line 13 contains the new width value

---

## Task 2: Manual Testing at Multiple Screen Widths

**Files:**
- Test: Open `index.html` in a web browser

- [ ] **Step 1: Open the application in a browser**

Open `index.html` in Chrome, Firefox, or Safari.

- [ ] **Step 2: Test at 1024px screen width**

Open browser DevTools (F12), toggle device toolbar, set width to 1024px.

**Verification checklist:**
- [ ] Sidebar displays at approximately 154px wide
- [ ] Menu items are fully visible and readable
- [ ] Logo appears correctly
- [ ] Stock selector dropdown fits properly
- [ ] No text wrapping issues

- [ ] **Step 3: Test at 1440px screen width**

Set browser width to 1440px.

**Verification checklist:**
- [ ] Sidebar displays at approximately 216px wide
- [ ] All elements display correctly
- [ ] Content area has more space

- [ ] **Step 4: Test at 1920px screen width**

Set browser width to 1920px.

**Verification checklist:**
- [ ] Sidebar displays at approximately 288px wide
- [ ] All elements display correctly
- [ ] Layout looks balanced

- [ ] **Step 5: Test at 2560px screen width (if monitor available)**

Set browser width to 2560px (or test with browser zoom if monitor doesn't support this resolution).

**Verification checklist:**
- [ ] Sidebar displays at approximately 384px wide
- [ ] All elements display correctly
- [ ] No layout issues

- [ ] **Step 6: Test mobile behavior (≤768px)**

Set browser width to 768px and below.

**Verification checklist:**
- [ ] Sidebar transforms to top header layout (existing behavior)
- [ ] No changes to mobile layout
- [ ] Navigation items display horizontally
- [ ] Stock selector displays correctly

- [ ] **Step 7: Test responsive transition**

Resize browser window from 1920px down to 769px and back up.

**Verification checklist:**
- [ ] Sidebar width changes smoothly
- [ ] No layout breakage during resize
- [ ] Content area adjusts proportionally

---

## Task 3: Commit the Changes

**Files:**
- Commit: `index.html`

- [ ] **Step 1: Review the changes**

Run: `git diff index.html`
Expected: Shows the CSS width change from `250px` to `15%`

- [ ] **Step 2: Stage the modified file**

Run: `git add index.html`

- [ ] **Step 3: Commit with descriptive message**

Run:
```bash
git commit -m "feat: change sidebar width from fixed 250px to responsive 15%

- Converts sidebar from fixed width to percentage-based
- Enables proportional scaling on desktop/tablet screens (>768px)
- Mobile layout unchanged (top header at ≤768px)
- Widths at common resolutions:
  - 1024px: ~154px
  - 1440px: ~216px
  - 1920px: ~288px
  - 2560px: ~384px"
```

Expected: Commit created successfully

- [ ] **Step 4: Verify commit**

Run: `git log -1 --oneline`
Expected: Shows the new commit with the message

---

## Success Criteria

All of the following must be true for the implementation to be considered complete:

- [ ] Sidebar uses `width: 15%` instead of `width: 250px`
- [ ] Sidebar scales proportionally on all screens >768px
- [ ] No layout breakage or content overflow at any tested screen width
- [ ] Menu items remain fully readable at all widths
- [ ] Logo displays correctly at all widths
- [ ] Stock selector functions properly at all widths
- [ ] Mobile behavior (≤768px) remains unchanged
- [ ] Changes committed to git with descriptive commit message

## Notes

- This is a CSS-only change; no JavaScript modifications required
- No min-width or max-width constraints added (per spec)
- If testing reveals readability issues at smaller tablet sizes (~769px), a follow-up iteration may add `min-width` constraints
- The change applies to both `index.html` in root and potentially `frontend/index.html` if it exists
