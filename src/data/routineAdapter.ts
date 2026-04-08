import type { Routine, RoutineStretch, Level, Duration } from '../types'
import { getStretchById } from './stretches'

/**
 * Adapt any routine to a target duration and level.
 * Instead of 9 hardcoded versions per routine, we generate on the fly.
 */

// How each level affects the routine
const levelConfig: Record<Level, {
  holdMultiplier: number
  restMultiplier: number
  includeIntermediate: boolean
  includeAdvanced: boolean
}> = {
  beginner: {
    holdMultiplier: 0.8,
    restMultiplier: 1.4,
    includeIntermediate: false,
    includeAdvanced: false,
  },
  intermediate: {
    holdMultiplier: 1.0,
    restMultiplier: 1.0,
    includeIntermediate: true,
    includeAdvanced: false,
  },
  advanced: {
    holdMultiplier: 1.4,
    restMultiplier: 0.6,
    includeIntermediate: true,
    includeAdvanced: true,
  },
}

function estimateRoutineDuration(stretches: RoutineStretch[]): number {
  let totalSeconds = 0
  for (const rs of stretches) {
    const s = getStretchById(rs.stretchId)
    if (!s) continue
    const sides = s.sides === 'both' ? 2 : 1
    const stretchTime = rs.reps
      ? rs.reps * rs.holdSeconds * sides
      : rs.holdSeconds * sides
    totalSeconds += stretchTime + (rs.restSeconds || 0)
  }
  return totalSeconds
}

function roundDuration(seconds: number): Duration {
  const mins = seconds / 60
  if (mins <= 7) return 5
  if (mins <= 12) return 10
  if (mins <= 17) return 15
  return 20
}

export function adaptRoutine(
  base: Routine,
  targetDuration: Duration,
  targetLevel: Level,
): Routine {
  const config = levelConfig[targetLevel]
  const baseDuration = base.durationMinutes
  const durationRatio = targetDuration / baseDuration

  // Start with all stretches, apply level filter
  let stretches = base.stretches.filter((rs) => {
    const s = getStretchById(rs.stretchId)
    if (!s) return false
    if (s.level === 'advanced' && !config.includeAdvanced) return false
    if (s.level === 'intermediate' && !config.includeIntermediate) return false
    return true
  })

  // If level filter removed too many, keep them all (better to have easier stretches than none)
  if (stretches.length < 2) stretches = [...base.stretches]

  // Apply level multipliers to hold times and rest
  stretches = stretches.map((rs): RoutineStretch => ({
    ...rs,
    holdSeconds: Math.max(10, Math.round(rs.holdSeconds * config.holdMultiplier)),
    reps: rs.reps ? Math.max(3, Math.round(rs.reps * config.holdMultiplier)) : undefined,
    restSeconds: rs.restSeconds
      ? Math.max(3, Math.round(rs.restSeconds * config.restMultiplier))
      : undefined,
  }))

  // Adjust for target duration
  if (durationRatio < 0.7) {
    // Shorter: remove stretches from the middle to keep the opener and closer
    const targetCount = Math.max(2, Math.ceil(stretches.length * durationRatio))
    if (stretches.length > targetCount) {
      // Keep first, last, and evenly pick from the middle
      const first = stretches[0]
      const last = stretches[stretches.length - 1]
      const middle = stretches.slice(1, -1)
      const pickCount = targetCount - 2
      const picked: RoutineStretch[] = []
      for (let i = 0; i < pickCount; i++) {
        const idx = Math.round((i / pickCount) * (middle.length - 1))
        picked.push(middle[idx])
      }
      stretches = [first, ...picked, last]
    }
  } else if (durationRatio > 1.3) {
    // Longer: extend hold times proportionally
    const extraRatio = durationRatio / 1.0
    stretches = stretches.map((rs): RoutineStretch => ({
      ...rs,
      holdSeconds: Math.round(rs.holdSeconds * Math.min(extraRatio, 2.0)),
      reps: rs.reps ? Math.round(rs.reps * Math.min(extraRatio, 1.5)) : undefined,
    }))
  }

  // Verify the estimated duration and fine-tune if needed
  let estSeconds = estimateRoutineDuration(stretches)
  const targetSeconds = targetDuration * 60
  const tolerance = targetSeconds * 0.25

  // If too long, trim hold times proportionally
  if (estSeconds > targetSeconds + tolerance) {
    const shrink = targetSeconds / estSeconds
    stretches = stretches.map((rs): RoutineStretch => ({
      ...rs,
      holdSeconds: Math.max(10, Math.round(rs.holdSeconds * shrink)),
      reps: rs.reps ? Math.max(3, Math.round(rs.reps * shrink)) : undefined,
    }))
    estSeconds = estimateRoutineDuration(stretches)
  }

  // If too short, extend holds
  if (estSeconds < targetSeconds - tolerance && estSeconds > 0) {
    const grow = targetSeconds / estSeconds
    stretches = stretches.map((rs): RoutineStretch => ({
      ...rs,
      holdSeconds: Math.round(rs.holdSeconds * Math.min(grow, 2.5)),
      reps: rs.reps ? Math.round(rs.reps * Math.min(grow, 2.0)) : undefined,
    }))
    estSeconds = estimateRoutineDuration(stretches)
  }

  const actualDuration = roundDuration(estSeconds)

  // Build adapted name suffix
  const durationChanged = actualDuration !== baseDuration
  const levelChanged = targetLevel !== base.level
  let suffix = ''
  if (durationChanged || levelChanged) {
    const parts: string[] = []
    if (durationChanged) parts.push(`${actualDuration}m`)
    if (levelChanged) parts.push(targetLevel)
    suffix = ` (${parts.join(', ')})`
  }

  return {
    ...base,
    name: base.name + suffix,
    level: targetLevel,
    durationMinutes: actualDuration,
    stretches,
    description: base.description,
  }
}
