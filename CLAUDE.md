# Limber — Smart Stretching App

## Stack
- React + TypeScript + Tailwind CSS v4
- Vite dev server on port 3400
- Bun as runtime/package manager
- No backend — localStorage for progress tracking

## Dev Commands
- `bun dev` — start dev server
- `bun run build` — production build
- `bun run preview` — preview production build

## Project Structure
- `src/data/stretches.ts` — 30+ stretch definitions with instructions, target muscles, body regions
- `src/data/routines.ts` — 25+ curated routines (pain relief, sport-specific, flexibility, mobility, posture)
- `src/types/index.ts` — TypeScript types for all data models
- `src/components/` — UI components (ActiveRoutine, BodyMap, FilterBar, PainAssessment, ProgressView, RoutineCard)
- `src/hooks/useProgress.ts` — localStorage-based progress tracking with streak calculation

## Future Plans
- SwiftUI iOS port with Apple Watch companion (timer + haptics)
- Stretch illustration assets
- Audio cues during routines
- More routines (parkour, swimming, tennis-specific, etc.)
