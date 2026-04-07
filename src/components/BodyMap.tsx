import type { BodyRegion } from '../types'

const bodyParts: { region: BodyRegion; label: string; x: number; y: number }[] = [
  { region: 'neck', label: 'Neck', x: 50, y: 8 },
  { region: 'shoulders', label: 'Shoulders', x: 50, y: 15 },
  { region: 'chest', label: 'Chest', x: 50, y: 22 },
  { region: 'upper-back', label: 'Upper Back', x: 50, y: 28 },
  { region: 'lower-back', label: 'Lower Back', x: 50, y: 38 },
  { region: 'wrists', label: 'Wrists', x: 18, y: 42 },
  { region: 'hips', label: 'Hips', x: 50, y: 48 },
  { region: 'glutes', label: 'Glutes', x: 50, y: 55 },
  { region: 'quads', label: 'Quads', x: 38, y: 65 },
  { region: 'hamstrings', label: 'Hamstrings', x: 62, y: 65 },
  { region: 'calves', label: 'Calves', x: 50, y: 80 },
  { region: 'ankles', label: 'Ankles', x: 50, y: 92 },
]

interface Props {
  selected: BodyRegion | null
  onSelect: (region: BodyRegion) => void
}

export function BodyMap({ selected, onSelect }: Props) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-[1/2.2]">
      {/* Simple body silhouette using CSS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24">
          {/* Head */}
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto" />
          {/* Torso */}
          <div className="w-20 h-28 bg-slate-200 dark:bg-slate-700 mx-auto mt-1 rounded-t-lg rounded-b-sm" />
          {/* Legs */}
          <div className="flex gap-2 justify-center mt-0.5">
            <div className="w-8 h-36 bg-slate-200 dark:bg-slate-700 rounded-b-lg" />
            <div className="w-8 h-36 bg-slate-200 dark:bg-slate-700 rounded-b-lg" />
          </div>
          {/* Arms */}
          <div className="absolute top-14 -left-6 w-6 h-28 bg-slate-200 dark:bg-slate-700 rounded-lg rotate-3" />
          <div className="absolute top-14 -right-6 w-6 h-28 bg-slate-200 dark:bg-slate-700 rounded-lg -rotate-3" />
        </div>
      </div>

      {/* Tap targets */}
      {bodyParts.map((part) => (
        <button
          key={part.region}
          onClick={() => onSelect(part.region)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-xs font-medium transition-all
            ${
              selected === part.region
                ? 'bg-emerald-500 text-white scale-110 shadow-lg'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-sm border border-slate-200 dark:border-slate-600'
            }`}
          style={{ left: `${part.x}%`, top: `${part.y}%` }}
        >
          {part.label}
        </button>
      ))}
    </div>
  )
}
