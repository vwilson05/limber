import { useState, useEffect, useRef, useCallback } from 'react'
import type { Routine } from '../types'
import { getStretchById } from '../data/stretches'
import { useSound } from '../hooks/useSound'
import { useVoiceGuidance } from '../hooks/useVoiceGuidance'

interface Props {
  routine: Routine
  onComplete: () => void
  onExit: () => void
  initialVoiceGuidance?: boolean
  initialFlowMode?: boolean
}

// prep: read instructions, tap "I'm Ready" (manual) or auto-countdown (flow)
// getInPosition: 5-second countdown to get into the stretch
// hold: the actual timed stretch
// rest: transition between stretches
// complete: routine done
type Phase = 'prep' | 'getInPosition' | 'hold' | 'rest' | 'complete'

const GET_IN_POSITION_SECONDS = 5
const FLOW_PREP_SECONDS = 12

export function ActiveRoutine({ routine, onComplete, onExit, initialVoiceGuidance = false, initialFlowMode = false }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentSide, setCurrentSide] = useState<'right' | 'left'>('right')
  const [phase, setPhase] = useState<Phase>('prep')
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentRep, setCurrentRep] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(initialVoiceGuidance)
  const [flowMode] = useState(initialFlowMode)
  // In flow mode, which instruction step is currently highlighted (revealed over time)
  const [flowStep, setFlowStep] = useState(0)

  const { tick, ding, startChime, initAudio, setEnabled } = useSound()
  const voice = useVoiceGuidance()

  // Sync voice enabled state
  useEffect(() => {
    voice.setEnabled(voiceEnabled)
  }, [voiceEnabled])

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

  // Initialize to prep when index changes
  useEffect(() => {
    const { s } = getStretchInfo(currentIndex)
    if (!s) return
    setPhase('prep')
    setCurrentRep(1)
    setCurrentSide(s.sides === 'both' ? 'right' : 'right')
    setIsPaused(false)
    setFlowStep(0)
    // In flow mode, start the prep countdown and play voice immediately
    if (flowMode) {
      setTimeLeft(FLOW_PREP_SECONDS)
      initAudio()
      voice.playStretchGuide(s.id)
    }
  }, [currentIndex, getStretchInfo])

  // Flow mode: advance instruction steps during prep based on time elapsed
  useEffect(() => {
    if (!flowMode || phase !== 'prep') return
    const { s } = getStretchInfo(currentIndex)
    if (!s) return
    const totalSteps = s.instructions.length
    const elapsed = FLOW_PREP_SECONDS - timeLeft
    // Evenly distribute steps across the countdown, leave last 2s for get-ready
    const usableTime = FLOW_PREP_SECONDS - 2
    const stepIndex = Math.min(Math.floor((elapsed / usableTime) * totalSteps), totalSteps - 1)
    setFlowStep(Math.max(0, stepIndex))
  }, [timeLeft, phase, flowMode, currentIndex])

  // Timer — runs during getInPosition, hold, rest, AND prep in flow mode
  useEffect(() => {
    if (isPaused || phase === 'complete') return
    if (phase === 'prep' && !flowMode) return

    const interval = setInterval(() => {
      setTotalElapsed((t) => t + 1)
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Timer done — play ding
          ding()
          setTimeout(() => handleTimerEnd(), 0)
          return 0
        }
        // Tick sound in last 5 seconds of hold phase
        if ((phase === 'hold' || phase === 'getInPosition') && prevTime <= 6) {
          tick()
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, phase, tick, ding])

  // User taps "I'm Ready" on the prep screen
  const handleReady = () => {
    initAudio() // Unlock audio on first user gesture
    setPhase('getInPosition')
    setTimeLeft(GET_IN_POSITION_SECONDS)
  }

  // Start the actual hold after get-in-position countdown
  const startHold = () => {
    const { rs, s } = getStretchInfo(stateRef.current.currentIndex)
    if (!rs || !s) return
    startChime()
    // Play voice guidance for this stretch (first side only, or non-bilateral)
    if (stateRef.current.currentSide === 'right' || s.sides !== 'both') {
      voice.playStretchGuide(s.id)
    }
    setPhase('hold')
    setTimeLeft(rs.holdSeconds)
  }

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    setEnabled(next)
  }

  const toggleVoice = () => {
    const next = !voiceEnabled
    setVoiceEnabled(next)
    if (!next) voice.stop()
  }

  const handleTimerEnd = () => {
    const { currentIndex: idx, currentSide: side, phase: curPhase, currentRep: rep } =
      stateRef.current
    const { rs, s } = getStretchInfo(idx)
    if (!rs || !s) return

    if (curPhase === 'prep') {
      // Flow mode prep countdown done → move to get-in-position
      setPhase('getInPosition')
      setTimeLeft(GET_IN_POSITION_SECONDS)
      return
    }

    if (curPhase === 'getInPosition') {
      // Get-in-position countdown done → start hold
      startHold()
      return
    }

    if (curPhase === 'rest') {
      // Rest done → next stretch prep
      if (idx >= totalStretches - 1) {
        setPhase('complete')
        onComplete()
      } else {
        setCurrentIndex(idx + 1)
      }
      return
    }

    // curPhase === 'hold'
    // If we have reps and more remain
    if (rs.reps && rep < rs.reps) {
      setCurrentRep(rep + 1)
      setTimeLeft(rs.holdSeconds)
      return
    }

    // If bilateral and on first side, switch — show get-in-position for other side
    if (s.sides === 'both' && side === 'right') {
      voice.playSideSwitch(s.id)
      setCurrentSide('left')
      setCurrentRep(1)
      setPhase('getInPosition')
      setTimeLeft(GET_IN_POSITION_SECONDS)
      return
    }

    // Move to rest or next stretch
    if (rs.restSeconds && idx < totalStretches - 1) {
      voice.playRest()
      setPhase('rest')
      setTimeLeft(rs.restSeconds)
    } else if (idx >= totalStretches - 1) {
      voice.playComplete()
      setPhase('complete')
      onComplete()
    } else {
      setCurrentIndex(idx + 1)
    }
  }

  const handleSkip = () => {
    const { rs, s } = getStretchInfo(currentIndex)
    if (!rs) return

    if (phase === 'prep' || phase === 'getInPosition') {
      // Skip this stretch entirely
      if (currentIndex >= totalStretches - 1) {
        setPhase('complete')
        onComplete()
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    } else if (phase === 'rest') {
      if (currentIndex >= totalStretches - 1) {
        setPhase('complete')
        onComplete()
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    } else if (s?.sides === 'both' && currentSide === 'right') {
      // Skip to other side
      setCurrentSide('left')
      setCurrentRep(1)
      setPhase('getInPosition')
      setTimeLeft(GET_IN_POSITION_SECONDS)
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

  // === COMPLETE SCREEN ===
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

  const progress = ((currentIndex) / totalStretches) * 100
  const nextStretch = getStretchById(routine.stretches[currentIndex + 1]?.stretchId)

  return (
    <div className="flex flex-col h-full min-h-[80vh]">
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
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
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {currentIndex + 1} / {totalStretches}
          </span>
          <button
            onClick={toggleVoice}
            className={`${voiceEnabled ? 'text-emerald-500' : 'text-slate-400'} hover:text-slate-600 dark:hover:text-slate-300`}
            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button
            onClick={toggleSound}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.788V15.212a1 1 0 001.342.94l4.87-1.744A1 1 0 0013.4 13.5V10.5a1 1 0 00-.688-.908L7.842 7.848a1 1 0 00-1.342.94z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        </div>
        <button
          onClick={handleSkip}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* === PREP SCREEN === */}
      {phase === 'prep' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3">
            Up Next
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {stretch.name}
          </h2>

          {stretch.sides === 'both' && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 mb-2">
              {currentSide === 'right' ? 'Right Side First' : 'Left Side'}
            </span>
          )}

          <p className="text-sm text-slate-400 mb-6">
            {routineStretch.reps
              ? `${routineStretch.reps} reps × ${routineStretch.holdSeconds}s`
              : `${routineStretch.holdSeconds}s hold`}
            {stretch.sides === 'both' ? ' each side' : ''}
          </p>

          {/* Flow mode: countdown + step-by-step reveal */}
          {flowMode && (
            <div className="text-4xl font-bold text-amber-500 tabular-nums mb-4">
              {timeLeft}
            </div>
          )}

          {/* Instructions */}
          <div className="text-left max-w-md space-y-3 mb-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            {stretch.instructions.map((inst, i) => (
              <div
                key={i}
                className={`flex gap-3 text-sm transition-all duration-300 ${
                  flowMode
                    ? i <= flowStep
                      ? i === flowStep
                        ? 'text-slate-900 dark:text-white font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-300 dark:text-slate-600'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className={`font-bold shrink-0 w-5 text-right ${
                  flowMode && i === flowStep ? 'text-emerald-500' : flowMode && i > flowStep ? 'text-slate-300 dark:text-slate-600' : 'text-emerald-500'
                }`}>
                  {i + 1}
                </span>
                <span>{inst}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mb-6">
            {stretch.targetMuscles.join(' · ')}
          </p>

          {flowMode ? (
            <button
              onClick={handleReady}
              className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Start now
            </button>
          ) : (
            <button
              onClick={handleReady}
              className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-lg py-4 px-12 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all"
            >
              I'm Ready
            </button>
          )}
        </div>
      )}

      {/* === GET IN POSITION COUNTDOWN === */}
      {phase === 'getInPosition' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">
            Get into position
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {stretch.name}
          </h2>

          {stretch.sides === 'both' && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 mb-4">
              {currentSide === 'right' ? 'Right Side' : 'Left Side'}
            </span>
          )}

          <div className="text-8xl font-bold text-amber-500 tabular-nums my-8">
            {timeLeft}
          </div>

          <p className="text-sm text-slate-400">
            Hold starts in {timeLeft} second{timeLeft !== 1 ? 's' : ''}...
          </p>

          {/* Quick skip to start hold immediately */}
          <button
            onClick={() => startHold()}
            className="mt-6 text-sm text-emerald-600 dark:text-emerald-400 font-medium"
          >
            Start now
          </button>
        </div>
      )}

      {/* === HOLD PHASE === */}
      {phase === 'hold' && (
        <>
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
              Hold
            </p>

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
            <div className="text-8xl font-bold text-emerald-500 tabular-nums my-8">{timeLeft}</div>

            {/* Condensed instruction reminder */}
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {stretch.instructions[stretch.instructions.length - 1]}
            </p>
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
        </>
      )}

      {/* === REST / TRANSITION === */}
      {phase === 'rest' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-lg text-slate-400 dark:text-slate-500 mb-2">Rest</p>
          <p className="text-7xl font-bold text-slate-300 dark:text-slate-600 tabular-nums mb-6">
            {timeLeft}
          </p>

          {nextStretch && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 max-w-xs">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Up Next</p>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {nextStretch.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {nextStretch.description}
              </p>
            </div>
          )}

          <button
            onClick={handleSkip}
            className="mt-6 text-sm text-emerald-600 dark:text-emerald-400 font-medium"
          >
            Skip rest
          </button>
        </div>
      )}
    </div>
  )
}
