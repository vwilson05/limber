export type BodyRegion =
  | 'neck'
  | 'shoulders'
  | 'upper-back'
  | 'lower-back'
  | 'chest'
  | 'hips'
  | 'glutes'
  | 'hamstrings'
  | 'quads'
  | 'calves'
  | 'ankles'
  | 'wrists'
  | 'full-body'

export type Goal =
  | 'flexibility'
  | 'mobility'
  | 'pain-relief'
  | 'recovery'
  | 'posture'
  | 'warmup'
  | 'cooldown'

export type Sport =
  | 'golf'
  | 'running'
  | 'basketball'
  | 'climbing'
  | 'parkour'
  | 'bowling'
  | 'cycling'
  | 'swimming'
  | 'tennis'
  | 'weightlifting'
  | 'desk-work'
  | 'general'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type Duration = 5 | 10 | 15 | 20

export interface Stretch {
  id: string
  name: string
  description: string
  instructions: string[]
  targetMuscles: string[]
  bodyRegions: BodyRegion[]
  holdSeconds: number
  reps?: number
  sides?: 'both' | 'none'
  level: Level
  imageKey: string
}

export interface RoutineMilestone {
  sessions: number
  label: string
  benefit: string
}

export interface Routine {
  id: string
  name: string
  description: string
  goals: Goal[]
  sports: Sport[]
  bodyRegions: BodyRegion[]
  level: Level
  durationMinutes: Duration
  stretches: RoutineStretch[]
  tags: string[]
  milestones: RoutineMilestone[]
}

export interface RoutineStretch {
  stretchId: string
  holdSeconds: number
  reps?: number
  restSeconds?: number
}

export interface PainEntry {
  bodyRegion: BodyRegion
  painLevel: number // 1-5
}

export interface RoutineProgress {
  routineId: string
  completedAt: string
  duration: number
}

export interface UserProgress {
  completedRoutines: RoutineProgress[]
  streak: number
  lastActiveDate: string | null
}

export interface Filters {
  goal: Goal | null
  sport: Sport | null
  bodyRegion: BodyRegion | null
  level: Level | null
  duration: Duration | null
}
