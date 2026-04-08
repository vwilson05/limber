import { useMemo } from 'react'
import { routines } from '../data/routines'
import type { Routine } from '../types'

interface SearchResult {
  routine: Routine
  score: number
  reason: string
}

// Keyword → body region / goal / sport mappings
const bodyKeywords: Record<string, string[]> = {
  neck: ['neck'],
  head: ['neck'],
  headache: ['neck'],
  shoulder: ['shoulders'],
  shoulders: ['shoulders'],
  trap: ['shoulders', 'neck'],
  traps: ['shoulders', 'neck'],
  'upper back': ['upper-back'],
  'mid back': ['upper-back'],
  thoracic: ['upper-back'],
  'lower back': ['lower-back'],
  'low back': ['lower-back'],
  lumbar: ['lower-back'],
  back: ['upper-back', 'lower-back'],
  spine: ['upper-back', 'lower-back'],
  chest: ['chest'],
  pec: ['chest'],
  pecs: ['chest'],
  hip: ['hips'],
  hips: ['hips'],
  'hip flexor': ['hips'],
  'hip flexors': ['hips'],
  glute: ['glutes'],
  glutes: ['glutes'],
  butt: ['glutes'],
  piriformis: ['glutes', 'hips'],
  hamstring: ['hamstrings'],
  hamstrings: ['hamstrings'],
  'back of leg': ['hamstrings'],
  quad: ['quads'],
  quads: ['quads'],
  thigh: ['quads', 'hamstrings'],
  knee: ['quads', 'hamstrings'],
  calf: ['calves'],
  calves: ['calves'],
  shin: ['calves'],
  ankle: ['ankles'],
  ankles: ['ankles'],
  foot: ['ankles'],
  feet: ['ankles'],
  wrist: ['wrists'],
  wrists: ['wrists'],
  hand: ['wrists'],
  forearm: ['wrists'],
  arm: ['shoulders', 'wrists'],
  leg: ['quads', 'hamstrings', 'calves'],
  legs: ['quads', 'hamstrings', 'calves'],
}

const goalKeywords: Record<string, string[]> = {
  pain: ['pain-relief'],
  hurt: ['pain-relief'],
  hurts: ['pain-relief'],
  hurting: ['pain-relief'],
  sore: ['pain-relief'],
  soreness: ['pain-relief'],
  ache: ['pain-relief'],
  aching: ['pain-relief'],
  tight: ['pain-relief', 'flexibility'],
  tightness: ['pain-relief', 'flexibility'],
  stiff: ['pain-relief', 'mobility'],
  stiffness: ['pain-relief', 'mobility'],
  relief: ['pain-relief'],
  flexible: ['flexibility'],
  flexibility: ['flexibility'],
  stretch: ['flexibility'],
  stretching: ['flexibility'],
  'range of motion': ['flexibility', 'mobility'],
  mobile: ['mobility'],
  mobility: ['mobility'],
  loosen: ['mobility'],
  'loosen up': ['mobility'],
  warmup: ['warmup'],
  'warm up': ['warmup'],
  'warm-up': ['warmup'],
  'before workout': ['warmup'],
  'before game': ['warmup'],
  'pre-game': ['warmup'],
  cooldown: ['cooldown'],
  'cool down': ['cooldown'],
  'after workout': ['cooldown', 'recovery'],
  recover: ['recovery'],
  recovery: ['recovery'],
  posture: ['posture'],
  slouch: ['posture'],
  slouching: ['posture'],
  'rounded shoulders': ['posture'],
  'forward head': ['posture'],
  morning: ['mobility'],
  'wake up': ['mobility'],
  office: ['posture', 'pain-relief'],
  desk: ['posture', 'pain-relief'],
  sitting: ['posture', 'pain-relief'],
  computer: ['posture', 'pain-relief'],
  sleep: ['recovery'],
  'cant sleep': ['recovery'],
  "can't sleep": ['recovery'],
  insomnia: ['recovery'],
  bedtime: ['recovery'],
  'before bed': ['recovery'],
  'wind down': ['recovery'],
  night: ['recovery'],
  nighttime: ['recovery'],
  relax: ['recovery'],
  relaxation: ['recovery'],
  calm: ['recovery'],
  calming: ['recovery'],
  restless: ['recovery'],
}

const sportKeywords: Record<string, string[]> = {
  golf: ['golf'],
  swing: ['golf'],
  run: ['running'],
  running: ['running'],
  runner: ['running'],
  jog: ['running'],
  jogging: ['running'],
  basketball: ['basketball'],
  climb: ['climbing'],
  climbing: ['climbing'],
  boulder: ['climbing'],
  bouldering: ['climbing'],
  lift: ['weightlifting'],
  lifting: ['weightlifting'],
  weightlifting: ['weightlifting'],
  weights: ['weightlifting'],
  gym: ['weightlifting'],
  squat: ['weightlifting'],
  deadlift: ['weightlifting'],
  cycle: ['cycling'],
  cycling: ['cycling'],
  bike: ['cycling'],
  swim: ['swimming'],
  swimming: ['swimming'],
  tennis: ['tennis'],
  parkour: ['parkour'],
  bowl: ['bowling'],
  bowling: ['bowling'],
}

const durationKeywords: Record<string, number> = {
  quick: 5,
  fast: 5,
  short: 5,
  '5 min': 5,
  '5 minute': 5,
  '10 min': 10,
  '10 minute': 10,
  '15 min': 15,
  '15 minute': 15,
  '20 min': 20,
  '20 minute': 20,
  long: 20,
  thorough: 20,
  full: 20,
}

const levelKeywords: Record<string, string> = {
  beginner: 'beginner',
  easy: 'beginner',
  gentle: 'beginner',
  simple: 'beginner',
  intermediate: 'intermediate',
  moderate: 'intermediate',
  advanced: 'advanced',
  hard: 'advanced',
  intense: 'advanced',
  deep: 'intermediate',
}

const contextPhrases: Record<string, { goals: string[]; bodyRegions: string[] }> = {
  'cant touch my toes': { goals: ['flexibility'], bodyRegions: ['hamstrings', 'lower-back'] },
  "can't touch my toes": { goals: ['flexibility'], bodyRegions: ['hamstrings', 'lower-back'] },
  'slept wrong': { goals: ['pain-relief'], bodyRegions: ['neck', 'upper-back'] },
  'woke up stiff': { goals: ['pain-relief', 'mobility'], bodyRegions: [] },
  'been sitting all day': { goals: ['posture', 'pain-relief'], bodyRegions: ['hips', 'lower-back'] },
  'sat all day': { goals: ['posture', 'pain-relief'], bodyRegions: ['hips', 'lower-back'] },
  'about to play': { goals: ['warmup'], bodyRegions: [] },
  'about to go': { goals: ['warmup'], bodyRegions: [] },
  'just finished': { goals: ['recovery', 'cooldown'], bodyRegions: [] },
  'after my': { goals: ['recovery', 'cooldown'], bodyRegions: [] },
  'getting old': { goals: ['mobility'], bodyRegions: ['hips', 'upper-back', 'shoulders'] },
  'feel old': { goals: ['mobility'], bodyRegions: ['hips', 'upper-back', 'shoulders'] },
  'over 40': { goals: ['mobility'], bodyRegions: ['hips', 'upper-back', 'shoulders'] },
  'whole body': { goals: ['flexibility', 'mobility'], bodyRegions: ['full-body'] },
  'full body': { goals: ['flexibility', 'mobility'], bodyRegions: ['full-body'] },
  'everything hurts': { goals: ['pain-relief', 'recovery'], bodyRegions: ['full-body'] },
  'before bed': { goals: ['recovery'], bodyRegions: [] },
  'go to sleep': { goals: ['recovery'], bodyRegions: [] },
  'going to bed': { goals: ['recovery'], bodyRegions: [] },
  'cant sleep': { goals: ['recovery'], bodyRegions: [] },
  "can't sleep": { goals: ['recovery'], bodyRegions: [] },
  'wind down': { goals: ['recovery'], bodyRegions: [] },
  'winding down': { goals: ['recovery'], bodyRegions: [] },
  'before sleep': { goals: ['recovery'], bodyRegions: [] },
}

export function searchRoutines(query: string): SearchResult[] {
  if (!query.trim()) return []

  const lower = query.toLowerCase().trim()
  const scores = new Map<string, { score: number; reasons: Set<string> }>()

  function addScore(routineId: string, points: number, reason: string) {
    const existing = scores.get(routineId) || { score: 0, reasons: new Set<string>() }
    existing.score += points
    existing.reasons.add(reason)
    scores.set(routineId, existing)
  }

  // Check context phrases first (highest priority, most specific)
  for (const [phrase, match] of Object.entries(contextPhrases)) {
    if (lower.includes(phrase)) {
      routines.forEach((r) => {
        match.goals.forEach((g) => {
          if (r.goals.includes(g as any)) addScore(r.id, 15, phrase)
        })
        match.bodyRegions.forEach((br) => {
          if (r.bodyRegions.includes(br as any)) addScore(r.id, 15, phrase)
        })
      })
    }
  }

  // Check body region keywords
  for (const [keyword, regions] of Object.entries(bodyKeywords)) {
    if (lower.includes(keyword)) {
      routines.forEach((r) => {
        regions.forEach((region) => {
          if (r.bodyRegions.includes(region as any)) {
            addScore(r.id, 10, `targets ${keyword}`)
          }
        })
      })
    }
  }

  // Check goal keywords
  for (const [keyword, goals] of Object.entries(goalKeywords)) {
    if (lower.includes(keyword)) {
      routines.forEach((r) => {
        goals.forEach((goal) => {
          if (r.goals.includes(goal as any)) {
            addScore(r.id, 8, keyword)
          }
        })
      })
    }
  }

  // Check sport keywords
  for (const [keyword, sports] of Object.entries(sportKeywords)) {
    if (lower.includes(keyword)) {
      routines.forEach((r) => {
        sports.forEach((sport) => {
          if (r.sports.includes(sport as any)) {
            addScore(r.id, 12, `for ${keyword}`)
          }
        })
      })
    }
  }

  // Check duration keywords
  for (const [keyword, mins] of Object.entries(durationKeywords)) {
    if (lower.includes(keyword)) {
      routines.forEach((r) => {
        if (r.durationMinutes === mins) {
          addScore(r.id, 5, `${mins} min`)
        } else if (Math.abs(r.durationMinutes - mins) <= 5) {
          addScore(r.id, 2, `~${mins} min`)
        }
      })
    }
  }

  // Check level keywords
  for (const [keyword, level] of Object.entries(levelKeywords)) {
    if (lower.includes(keyword)) {
      routines.forEach((r) => {
        if (r.level === level) {
          addScore(r.id, 4, keyword)
        }
      })
    }
  }

  // Direct name/tag matching
  routines.forEach((r) => {
    if (r.name.toLowerCase().includes(lower)) {
      addScore(r.id, 20, 'name match')
    }
    r.tags.forEach((tag) => {
      if (lower.includes(tag)) {
        addScore(r.id, 3, tag)
      }
    })
  })

  // Build results
  const results: SearchResult[] = []
  scores.forEach((data, routineId) => {
    const routine = routines.find((r) => r.id === routineId)
    if (routine && data.score > 0) {
      results.push({
        routine,
        score: data.score,
        reason: [...data.reasons].slice(0, 3).join(', '),
      })
    }
  })

  return results.sort((a, b) => b.score - a.score).slice(0, 8)
}

export function useNaturalSearch(query: string): SearchResult[] {
  return useMemo(() => searchRoutines(query), [query])
}
