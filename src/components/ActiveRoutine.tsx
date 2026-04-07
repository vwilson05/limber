import { useState, useEffect, useRef, useCallback } from 'react'
import type { Routine } from '../types'
import { getStretchById } from '../data/stretches'

interface Props {
  routine: Routine
  onComplete: () => void
  onExit: () => void
}

type Phase = 'stretch' | 'rest' | 'complete'

export function ActiveRoutine({ routine, onComplete, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentSide, setCurrentSide] = useState<'right' | 'left'>('right')
  const [phase, setPhase] = useState<Phase>('stretch')
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentRep, setCurrentRep] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [totalElapsed, setTotalElapsed] = useState(0)

  // Refs to avoid stale closures in the interval
  const stateRef = useRef({ currentIndex, currentSide, phase, currentRep })
  stateRef.current = { currentIndex, currentSide, phase, currentRep }

  const totalStretches = routine.stretches.length

  const getStretchInfo = useCallback(
    (idx: number) => {
      const rs = routine.stretches[idx]
      const s = rs ? getStretchById(rs.stretchId) : null
      return { rs, s }
    },
    [routine.stretches],
  )

  const { rs: routineStretch, s: stretch } = getStretchInfo(currentIndex)

  // Initialize stretch when index changes
  useEffect(() => {
    const { rs, s } = getStretchInfo(currentIndex)
    if (!rs || !s) return
    setPhase('stretch')
    setTimeLeft(rs.holdSeconds)
    setCurrentRep(1)
    setCurrentSide(s.sides === 'both' ? 'right' : 'right')
    setIsPaused(false)
  }, [currentIndex, getStretchInfo])

  // Single interval that ticks every second
  useEffect(() => {
    if (isPaused || phase === 'complete') return

    const interval = setInterval(() => {
      setTotalElapsed((t) => t + 1)
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Timer just hit zero — schedule the transition
          setTimeout(() => handleTimerEnd(), 0)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, phase])

  const handleTimerEnd = () => {
    const { currentIndex: idx, currentSide: side, phase: curPhase, currentRep: rep } =
      stateRef.current
    const { rs, s } = getStretchInfo(idx)
    if (!rs || !s) return

    // If we're in the rest phase, move to next stretch
    if (curPhase === 'rest') {
      if (idx >= totalStretches - 1) {
        setPhase('complete')
        onComplete()
      } else {
        setCurrentIndex(idx + 1)
      }
      return
    }

    // If we have reps and more remain
    if (rs.reps && rep < rs.reps) {
      setCurrentRep(rep + 1)
      setTimeLeft(rs.holdSeconds)
      return
    }

    // If bilateral and on first side, switch
    if (s.sides === 'both' && side === 'right') {
      setCurrentSide('left')
      setCurrentRep(1)
      setTimeLeft(rs.holdSeconds)
      return
    }

    // Move to rest or next stretch
    if (rs.restSeconds && idx < totalStretches - 1) {
      setPhase('rest')
      setTimeLeft(rs.restSeconds)
    } else if (idx >= totalStretches - 1) {
      setPhase('complete')
      onComplete()
    } else {
      setCurrentIndex(idx + 1)
    }
  }

  const handleSkip = () => {
    const { rs, s } = getStretchInfo(currentIndex)
    if (!rs) return

    if (phase === 'rest') {
      if (currentIndex >= totalStretches - 1) {
        setPhase('complete')
        onComplete()
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    } else if (s?.sides === 'both' && currentSide === 'right') {
      setCurrentSide('left')
      setCurrentRep(1)
      setTimeLeft(rs.holdSeconds)
    } else {
      if (rs.restSeconds && currentIndex < totalStretches - 1) {
        setPhase('rest')
        setTimeLeft(rs.restSeconds)
      } else if (currentIndex >= totalStretches - 1) {
        setPhase('complete')
        onComplete()
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (phase === 'complete') {
    const minutes = Math.floor(totalElapsed / 60)
    const seconds = totalElapsed % 60
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Routine Complete</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-1">{routine.name}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
          {minutes}:{seconds.toString().padStart(2, '0')} total
        </p>
        <button
          onClick={onExit}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    )
  }

  if (!stretch || !routineStretch) return null

  const progress = ((currentIndex + 1) / totalStretches) * 100

  return (
    <div className="flex flex-col h-full min-h-[80vh]">
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium"
        >
          Exit
        </button>
        <span className="text-sm text-slate-400">
          {currentIndex + 1} / {totalStretches}
        </span>
        <button
          onClick={handleSkip}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {phase === 'rest' ? (
          <>
            <p className="text-lg text-slate-400 dark:text-slate-500 mb-2">Rest</p>
            <p className="text-6xl font-bold text-slate-300 dark:text-slate-600 tabular-nums">
              {timeLeft}
            </p>
            <p className="text-sm text-slate-400 mt-4">
              Next: {getStretchById(routine.stretches[currentIndex + 1]?.stretchId)?.name}
            </p>
          </>
        ) : (
          <>
            {/* Stretch icon placeholder */}
            <div className="w-32 h-32 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-emerald-300 dark:text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stretch.name}
            </h2>

            {stretch.sides === 'both' && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 mb-3">
                {currentSide === 'right' ? 'Right Side' : 'Left Side'}
              </span>
            )}

            {routineStretch.reps && (
              <p className="text-sm text-slate-400 mb-2">
                Rep {currentRep} of {routineStretch.reps}
              </p>
            )}

            {/* Timer */}
            <div className="text-7xl font-bold text-emerald-500 tabular-nums my-6">{timeLeft}</div>

            {/* Instructions */}
            <div className="text-left max-w-md space-y-2">
              {stretch.instructions.map((inst, i) => (
                <div key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-500 font-bold shrink-0">{i + 1}</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-4">
              {stretch.targetMuscles.join(' · ')}
            </p>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 py-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-colors"
        >
          {isPaused ? (
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
