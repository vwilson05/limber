import { useState, useMemo } from 'react'
import type { Routine, Level, Duration } from '../types'
import { getStretchById } from '../data/stretches'
import { adaptRoutine } from '../data/routineAdapter'

const goalColors: Record<string, string> = {
  flexibility: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  mobility: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'pain-relief': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  recovery: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  posture: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  warmup: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  cooldown: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
}

const milestoneIcons = [
  <svg key="1" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  <svg key="2" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
  <svg key="3" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>,
  <svg key="4" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" /></svg>,
]

const durations: Duration[] = [5, 10, 15, 20]
const levels: Level[] = ['beginner', 'intermediate', 'advanced']

interface Props {
  routine: Routine
  completedCount: number
  voiceGuidance: boolean
  onVoiceGuidanceChange: (val: boolean) => void
  flowMode: boolean
  onFlowModeChange: (val: boolean) => void
  onStart: (adapted: Routine) => void
  onBack: () => void
}

export function RoutineDetail({ routine, completedCount, voiceGuidance, onVoiceGuidanceChange, flowMode, onFlowModeChange, onStart, onBack }: Props) {
  const [selectedDuration, setSelectedDuration] = useState<Duration>(routine.durationMinutes)
  const [selectedLevel, setSelectedLevel] = useState<Level>(routine.level)

  const isCustomized = selectedDuration !== routine.durationMinutes || selectedLevel !== routine.level

  const adaptedRoutine = useMemo(() => {
    if (!isCustomized) return routine
    return adaptRoutine(routine, selectedDuration, selectedLevel)
  }, [routine, selectedDuration, selectedLevel, isCustomized])

  const allMuscles = new Set<string>()
  adaptedRoutine.stretches.forEach((rs) => {
    const s = getStretchById(rs.stretchId)
    s?.targetMuscles.forEach((m) => allMuscles.add(m))
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-4 inline-flex items-center gap-1 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{routine.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{routine.description}</p>

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
      </div>

      {/* Duration selector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">Duration</p>
        <div className="flex gap-2">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedDuration === d
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      {/* Level selector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">Level</p>
        <div className="flex gap-2">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLevel(l)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                selectedLevel === l
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Adapted stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <p className="text-xl font-bold text-emerald-500">{adaptedRoutine.durationMinutes}m</p>
          <p className="text-[10px] text-slate-400 uppercase mt-0.5">Duration</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <p className="text-xl font-bold text-emerald-500">{adaptedRoutine.stretches.length}</p>
          <p className="text-[10px] text-slate-400 uppercase mt-0.5">Stretches</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
          <p className="text-xl font-bold text-emerald-500 capitalize">{adaptedRoutine.level}</p>
          <p className="text-[10px] text-slate-400 uppercase mt-0.5">Level</p>
        </div>
      </div>

      {/* Milestones — the key feature */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
          What to Expect
        </h2>
        <div className="space-y-4">
          {routine.milestones.map((milestone, i) => {
            const isReached = completedCount >= milestone.sessions
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isReached
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isReached ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      milestoneIcons[i] || milestoneIcons[0]
                    )}
                  </div>
                  {i < routine.milestones.length - 1 && (
                    <div className={`w-px flex-1 mt-1 ${isReached ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {milestone.label}
                    </p>
                    <span className="text-xs text-slate-400">
                      {milestone.sessions === 1 ? '' : `${milestone.sessions} sessions`}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {milestone.benefit}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stretches list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
          Stretches in This Routine
        </h2>
        <div className="space-y-3">
          {adaptedRoutine.stretches.map((rs, i) => {
            const s = getStretchById(rs.stretchId)
            if (!s) return null
            return (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-bold text-slate-300 dark:text-slate-600 w-5 text-right shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {s.name}
                    {s.sides === 'both' && (
                      <span className="text-xs text-slate-400 ml-1">(each side)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {rs.reps ? `${rs.reps} reps × ${rs.holdSeconds}s` : `${rs.holdSeconds}s hold`}
                    {' · '}
                    {s.targetMuscles.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Muscles targeted */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
          Muscles Targeted
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {[...allMuscles].map((muscle) => (
            <span
              key={muscle}
              className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              {muscle}
            </span>
          ))}
        </div>
      </div>

      {/* Completed count */}
      {completedCount > 0 && (
        <p className="text-sm text-center text-emerald-600 dark:text-emerald-400 font-medium">
          You've completed this routine {completedCount} time{completedCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Spacer so content isn't hidden behind fixed button */}
      <div className="h-44" />

      {/* START button — fixed at bottom with solid background */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 pt-3 pb-4">
        <div className="max-w-lg mx-auto">
          {/* Mode toggles */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => onFlowModeChange(!flowMode)}
              className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border ${flowMode ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${flowMode ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Flow</span>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${flowMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} relative`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${flowMode ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </div>
            </button>

            <button
              onClick={() => onVoiceGuidanceChange(!voiceGuidance)}
              className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border ${voiceGuidance ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${voiceGuidance ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Voice</span>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${voiceGuidance ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} relative`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${voiceGuidance ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </div>
            </button>
          </div>

          <button
            onClick={() => onStart(adaptedRoutine)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
          >
            Start Routine
          </button>
        </div>
      </div>
    </div>
  )
}
