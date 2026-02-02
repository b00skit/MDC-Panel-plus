## 2024-05-22 - Missing Global TooltipProvider
**Learning:** The application lacks a global `TooltipProvider` in the root layout, requiring individual components to wrap `Tooltip` elements with their own provider. This creates unnecessary boilerplate and potential inconsistencies.
**Action:** When adding tooltips, always ensure they are wrapped in a `TooltipProvider`. Consider proposing a global provider in `layout.tsx` for future refactors.

## 2024-05-23 - FeedbackDialog Accessibility
**Learning:** `FeedbackDialog` used icon-only buttons for positive/negative feedback without `aria-label`, making them inaccessible to screen readers.
**Action:** Added `aria-label` attributes using new i18n keys `positiveLabel` and `negativeLabel`. In future, always verify icon-only buttons in dialogs.
