import type { UserProgress } from '../types'
import { getRoutineById } from '../data/routines'

interface Props {
  progress: UserProgress
  streak: number
  totalCompleted: number
  onBack: () => void
}

export function ProgressView({ progress, streak, totalCompleted, onBack }: Props) {
  const last7Days = progress.completedRoutines
    .filter((r) => {
      const d = new Date(r.completedAt)
      const week = new Date(Date.now() - 7 * 86400000)
      return d >= week
    })
    .reverse()

  const totalMinutes = progress.completedRoutines.reduce((sum, r) => sum + r.duration, 0)

  // Body region heat map
  const regionCounts: Record<string, number> = {}
  progress.completedRoutines.forEach((rp) => {
    const routine = getRoutineById(rp.routineId)
    if (routine) {
      routine.bodyRegions.forEach((region) => {
        regionCounts[region] = (regionCounts[region] || 0) + 1
      })
    }
  })

  const sortedRegions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const maxCount = sortedRegions[0]?.[1] || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Progress</h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500">{streak}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500">{totalCompleted}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Routines</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500">{Math.round(totalMinutes / 60)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minutes</p>
        </div>
      </div>

      {/* Body region heat map */}
      {sortedRegions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Areas Worked
          </h3>
          <div className="space-y-2">
            {sortedRegions.map(([region, count]) => (
              <div key={region} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-24 capitalize">
                  {region.replace('-', ' ')}
                </span>
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 dark:bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Recent Activity
        </h3>
        {last7Days.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No activity this week. Start a routine!</p>
        ) : (
          <div className="space-y-2">
            {last7Days.map((rp, i) => {
              const routine = getRoutineById(rp.routineId)
              const date = new Date(rp.completedAt)
              return (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {routine?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {Math.round(rp.duration / 60)}m
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
