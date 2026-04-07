import { useState, useMemo } from 'react'
import type { BodyRegion, Routine, RoutineStretch, Duration } from '../types'
import { BodyMap } from './BodyMap'
import { routines } from '../data/routines'
import { getStretchById } from '../data/stretches'

const painLabels: Record<number, { label: string; color: string; desc: string }> = {
  1: { label: 'Mild tightness', color: 'text-emerald-500', desc: 'Longer holds, deeper stretches — push your range' },
  2: { label: 'Moderate tightness', color: 'text-emerald-500', desc: 'Extended holds with some deeper stretches mixed in' },
  3: { label: 'Noticeable pain', color: 'text-amber-500', desc: 'Standard routine — balanced holds and rest periods' },
  4: { label: 'Strong pain', color: 'text-orange-500', desc: 'Shorter holds, extra rest, gentle stretches only' },
  5: { label: 'Severe pain', color: 'text-red-500', desc: 'Very gentle — short holds, beginner-only, maximum rest' },
}

function adaptRoutineForPain(routine: Routine, painLevel: number): Routine {
  const adapted = { ...routine, stretches: [...routine.stretches] }

  if (painLevel <= 2) {
    // Low pain: longer holds, can include intermediate stretches, less rest
    adapted.stretches = adapted.stretches.map((rs): RoutineStretch => {
      const holdMultiplier = painLevel === 1 ? 1.5 : 1.25
      return {
        ...rs,
        holdSeconds: Math.round(rs.holdSeconds * holdMultiplier),
        reps: rs.reps ? Math.round(rs.reps * (painLevel === 1 ? 1.3 : 1.15)) : undefined,
        restSeconds: rs.restSeconds ? Math.max(3, Math.round(rs.restSeconds * 0.6)) : undefined,
      }
    })
    const totalSeconds = adapted.stretches.reduce((sum, rs) => {
      const s = getStretchById(rs.stretchId)
      const stretchTime = rs.reps
        ? rs.reps * rs.holdSeconds * (s?.sides === 'both' ? 2 : 1)
        : rs.holdSeconds * (s?.sides === 'both' ? 2 : 1)
      return sum + stretchTime + (rs.restSeconds || 0)
    }, 0)
    adapted.durationMinutes = (Math.ceil(totalSeconds / 60 / 5) * 5) as Duration
    adapted.name = `${routine.name} — Deep`
    adapted.description = `Extended version: longer holds and deeper stretches for mild tightness.`
  } else if (painLevel === 4) {
    // High pain: shorter holds, beginner only, more rest
    adapted.stretches = adapted.stretches
      .filter((rs) => {
        const s = getStretchById(rs.stretchId)
        return s && s.level === 'beginner'
      })
      .map((rs): RoutineStretch => ({
        ...rs,
        holdSeconds: Math.round(rs.holdSeconds * 0.65),
        reps: rs.reps ? Math.max(3, Math.round(rs.reps * 0.6)) : undefined,
        restSeconds: Math.max(8, (rs.restSeconds || 5) * 1.5),
      }))
    const totalSeconds = adapted.stretches.reduce((sum, rs) => {
      const s = getStretchById(rs.stretchId)
      const stretchTime = rs.reps
        ? rs.reps * rs.holdSeconds * (s?.sides === 'both' ? 2 : 1)
        : rs.holdSeconds * (s?.sides === 'both' ? 2 : 1)
      return sum + stretchTime + (rs.restSeconds || 0)
    }, 0)
    adapted.durationMinutes = (Math.ceil(totalSeconds / 60 / 5) * 5) as Duration
    adapted.name = `${routine.name} — Gentle`
    adapted.description = `Lighter version: shorter holds, extra rest, beginner stretches only.`
  } else if (painLevel === 5) {
    // Severe pain: minimal, very short holds, max rest, fewest stretches
    adapted.stretches = adapted.stretches
      .filter((rs) => {
        const s = getStretchById(rs.stretchId)
        return s && s.level === 'beginner'
      })
      .slice(0, Math.max(3, Math.ceil(adapted.stretches.length * 0.5)))
      .map((rs): RoutineStretch => ({
        ...rs,
        holdSeconds: Math.round(rs.holdSeconds * 0.5),
        reps: rs.reps ? Math.max(3, Math.round(rs.reps * 0.4)) : undefined,
        restSeconds: Math.max(10, (rs.restSeconds || 5) * 2),
      }))
    const totalSeconds = adapted.stretches.reduce((sum, rs) => {
      const s = getStretchById(rs.stretchId)
      const stretchTime = rs.reps
        ? rs.reps * rs.holdSeconds * (s?.sides === 'both' ? 2 : 1)
        : rs.holdSeconds * (s?.sides === 'both' ? 2 : 1)
      return sum + stretchTime + (rs.restSeconds || 0)
    }, 0)
    adapted.durationMinutes = (Math.ceil(totalSeconds / 60 / 5) * 5) as Duration
    adapted.name = `${routine.name} — Extra Gentle`
    adapted.description = `Minimal version: very short holds, fewer stretches, maximum rest between each.`
  }
  // painLevel === 3: no changes, use routine as-is

  // Update milestones to reflect the adapted intensity
  if (painLevel <= 2) {
    adapted.milestones = routine.milestones.map((m, i) => {
      if (i === 0) return { ...m, benefit: m.benefit + ' Deep holds accelerate tissue adaptation.' }
      return m
    })
  } else if (painLevel >= 4) {
    adapted.milestones = routine.milestones.map((m, i) => {
      if (i === 0) return { ...m, benefit: 'Gentle relief without aggravating the area. Listen to your body.' }
      return m
    })
  }

  return adapted
}

interface Props {
  onSelectRoutine: (routine: Routine) => void
  onBack: () => void
}

export function PainAssessment({ onSelectRoutine, onBack }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null)
  const [painLevel, setPainLevel] = useState(3)

  const matchingRoutines = useMemo(() => {
    if (!selectedRegion) return []
    return routines
      .filter(
        (r) =>
          r.bodyRegions.includes(selectedRegion) &&
          r.goals.includes('pain-relief'),
      )
      .map((r) => adaptRoutineForPain(r, painLevel))
  }, [selectedRegion, painLevel])

  const relatedRoutines = useMemo(() => {
    if (!selectedRegion) return []
    return routines
      .filter(
        (r) =>
          r.bodyRegions.includes(selectedRegion) &&
          !r.goals.includes('pain-relief') &&
          (r.goals.includes('mobility') || r.goals.includes('flexibility')),
      )
      .map((r) => (painLevel >= 4 ? adaptRoutineForPain(r, painLevel) : r))
  }, [selectedRegion, painLevel])

  const info = painLabels[painLevel]

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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          What's bothering you?
        </h2>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Tap the area where you're feeling pain or tightness.
      </p>

      <BodyMap selected={selectedRegion} onSelect={setSelectedRegion} />

      {selectedRegion && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Pain level:{' '}
              <span className={`font-bold ${info.color}`}>
                {painLevel}/5 — {info.label}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Mild tightness</span>
              <span>Significant pain</span>
            </div>
          </div>

          {/* Explain what pain level does */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400">
            {info.desc}
          </div>

          {painLevel >= 4 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
              For severe or persistent pain, consider consulting a healthcare professional. These stretches are for general relief only.
            </div>
          )}

          {matchingRoutines.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Pain Relief Routines
              </h3>
              <div className="space-y-2">
                {matchingRoutines.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectRoutine(r)}
                    className="w-full text-left bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {r.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
                        <div className="flex gap-2 mt-1.5 text-xs text-slate-400">
                          <span>{r.stretches.length} stretches</span>
                          <span>·</span>
                          <span>~{r.durationMinutes}m</span>
                        </div>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 ml-3">
                        {r.durationMinutes}m
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {relatedRoutines.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Also Try
              </h3>
              <div className="space-y-2">
                {relatedRoutines.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectRoutine(r)}
                    className="w-full text-left bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {r.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 ml-3">
                        {r.durationMinutes}m
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingRoutines.length === 0 && relatedRoutines.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No specific routines for this area yet. Try the full body routines.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
