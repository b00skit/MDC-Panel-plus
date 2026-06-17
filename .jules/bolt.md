## 2025-12-14 - [Zustand Full-Store Subscription Anti-Pattern]
**Learning:** Several large form components (`ArrestReportForm`, `AdvancedArrestReportForm`) were subscribing to the entire `useSettingsStore` state instead of selecting specific slices. This causes unnecessary re-renders whenever *any* setting changes (e.g., toggling dark mode or changing hidden factions), impacting performance on heavy pages.
**Action:** Always use selectors with Zustand hooks (e.g., `useSettingsStore(state => state.value)`) to ensure components only re-render when their specific dependencies change.
