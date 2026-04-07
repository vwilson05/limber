import { useState } from 'react'
import type { Filters, Routine } from './types'
import { filterRoutines, routines } from './data/routines'
import { FilterBar } from './components/FilterBar'
import { RoutineCard } from './components/RoutineCard'
import { ActiveRoutine } from './components/ActiveRoutine'
import { PainAssessment } from './components/PainAssessment'
import { ProgressView } from './components/ProgressView'
import { RoutineDetail } from './components/RoutineDetail'
import { AskView } from './components/AskView'
import { useProgress } from './hooks/useProgress'

type View = 'home' | 'browse' | 'pain' | 'ask' | 'detail' | 'active' | 'progress'

function App() {
  const [view, setView] = useState<View>('home')
  const [filters, setFilters] = useState<Filters>({
    goal: null,
    sport: null,
    bodyRegion: null,
    level: null,
    duration: null,
  })
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)
  const { progress, completeRoutine, totalCompleted, streak } = useProgress()

  const [previousView, setPreviousView] = useState<View>('home')

  const showRoutineDetail = (routine: Routine) => {
    setActiveRoutine(routine)
    setPreviousView(view)
    setView('detail')
  }

  const beginRoutine = () => {
    setView('active')
  }

  const handleComplete = () => {
    if (activeRoutine) {
      completeRoutine(activeRoutine.id, activeRoutine.durationMinutes * 60)
    }
  }

  const handleExitRoutine = () => {
    setActiveRoutine(null)
    setView('home')
  }

  const filteredRoutines = filterRoutines(filters)

  // Quick picks for home screen
  const painRelief = routines.filter((r) => r.goals.includes('pain-relief')).slice(0, 3)
  const quickRoutines = routines.filter((r) => r.durationMinutes <= 10).slice(0, 3)

  if (view === 'active' && activeRoutine) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-lg mx-auto px-4 py-6">
          <ActiveRoutine
            routine={activeRoutine}
            onComplete={handleComplete}
            onExit={handleExitRoutine}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        {view === 'home' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Limber
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Smart stretching. Real results.
              </p>
            </div>

            {/* Stats bar */}
            {totalCompleted > 0 && (
              <button
                onClick={() => setView('progress')}
                className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-500">{streak}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Streak</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-500">{totalCompleted}</p>
                    <p className="text-[10px] text-slate-400 uppercase">Done</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Ask bar */}
            <button
              onClick={() => setView('ask')}
              className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 mb-6 flex items-center gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left"
            >
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-sm text-slate-400">Tell me what's going on...</span>
            </button>

            {/* Main actions */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                onClick={() => setView('pain')}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 text-left hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-red-600 dark:group-hover:text-red-400">
                  Something Hurts
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Find relief stretches</p>
              </button>

              <button
                onClick={() => setView('browse')}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 text-left hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  Browse Routines
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Filter by goal, sport, area</p>
              </button>
            </div>

            {/* Quick routines */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                Quick Routines
              </h2>
              <div className="space-y-2">
                {quickRoutines.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    onStart={showRoutineDetail}
                    completedCount={
                      progress.completedRoutines.filter((p) => p.routineId === r.id).length
                    }
                  />
                ))}
              </div>
            </div>

            {/* Pain relief picks */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                Pain Relief
              </h2>
              <div className="space-y-2">
                {painRelief.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    onStart={showRoutineDetail}
                    completedCount={
                      progress.completedRoutines.filter((p) => p.routineId === r.id).length
                    }
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {view === 'browse' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setView('home')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Browse Routines</h2>
            </div>

            <FilterBar filters={filters} onChange={setFilters} />

            <div className="mt-4 space-y-2">
              {filteredRoutines.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  No routines match your filters. Try adjusting them.
                </p>
              ) : (
                <>
                  <p className="text-xs text-slate-400 mb-2">
                    {filteredRoutines.length} routine{filteredRoutines.length !== 1 ? 's' : ''}
                  </p>
                  {filteredRoutines.map((r) => (
                    <RoutineCard
                      key={r.id}
                      routine={r}
                      onStart={showRoutineDetail}
                      completedCount={
                        progress.completedRoutines.filter((p) => p.routineId === r.id).length
                      }
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}

        {view === 'ask' && (
          <AskView
            onSelectRoutine={showRoutineDetail}
            onBack={() => setView('home')}
          />
        )}

        {view === 'pain' && (
          <PainAssessment
            onSelectRoutine={showRoutineDetail}
            onBack={() => setView('home')}
          />
        )}

        {view === 'detail' && activeRoutine && (
          <RoutineDetail
            routine={activeRoutine}
            completedCount={
              progress.completedRoutines.filter((p) => p.routineId === activeRoutine.id).length
            }
            onStart={beginRoutine}
            onBack={() => {
              setActiveRoutine(null)
              setView(previousView)
            }}
          />
        )}

        {view === 'progress' && (
          <ProgressView
            progress={progress}
            streak={streak}
            totalCompleted={totalCompleted}
            onBack={() => setView('home')}
          />
        )}
      </div>

      {/* Bottom nav */}
      {view !== 'active' && view !== 'detail' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700">
          <div className="max-w-lg mx-auto flex">
            <button
              onClick={() => setView('home')}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                view === 'home'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            <button
              onClick={() => setView('browse')}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                view === 'browse'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse
            </button>
            <button
              onClick={() => setView('pain')}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                view === 'pain'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Pain
            </button>
            <button
              onClick={() => setView('progress')}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                view === 'progress'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Progress
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
