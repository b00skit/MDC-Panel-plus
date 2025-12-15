## 2024-05-22 - Missing Global TooltipProvider
**Learning:** The application lacks a global `TooltipProvider` in the root layout, requiring individual components to wrap `Tooltip` elements with their own provider. This creates unnecessary boilerplate and potential inconsistencies.
**Action:** When adding tooltips, always ensure they are wrapped in a `TooltipProvider`. Consider proposing a global provider in `layout.tsx` for future refactors.
