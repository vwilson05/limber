import type { Routine } from '../types'

const goalColors: Record<string, string> = {
  flexibility: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  mobility: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'pain-relief': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  recovery: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  posture: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  warmup: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  cooldown: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
}

interface Props {
  routine: Routine
  onStart: (routine: Routine) => void
  completedCount?: number
}

export function RoutineCard({ routine, onStart, completedCount = 0 }: Props) {
  return (
    <button
      onClick={() => onStart(routine)}
      className="w-full text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {routine.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{routine.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {routine.durationMinutes}m
          </span>
          <span className="text-xs text-slate-400 capitalize">{routine.level}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {routine.goals.map((goal) => (
          <span
            key={goal}
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${goalColors[goal] || 'bg-slate-100 text-slate-600'}`}
          >
            {goal.replace('-', ' ')}
          </span>
        ))}
        {routine.sports
          .filter((s) => s !== 'general')
          .map((sport) => (
            <span
              key={sport}
              className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              {sport.replace('-', ' ')}
            </span>
          ))}
      </div>

      {completedCount > 0 && (
        <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Completed {completedCount} time{completedCount !== 1 ? 's' : ''}
        </div>
      )}
    </button>
  )
}
