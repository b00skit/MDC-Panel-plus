## 2024-05-23 - Zustand Store Optimization
**Learning:** Consuming Zustand stores with object literals (e.g., `useStore(state => ({ ... }))`) causes unnecessary re-renders on *every* store update because the selector returns a new object reference.
**Action:** Always use `useShallow` from `zustand/react/shallow` when selecting multiple state properties, or use atomic selectors. This codebase uses Zustand v4.5.4+ so `useShallow` is available.
