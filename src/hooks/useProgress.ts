import { useState, useEffect } from 'react'
import type { UserProgress, RoutineProgress } from '../types'

const STORAGE_KEY = 'limber-progress'

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { completedRoutines: [], streak: 0, lastActiveDate: null }
}

function calculateStreak(progress: UserProgress): number {
  if (progress.completedRoutines.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const uniqueDates = [
    ...new Set(progress.completedRoutines.map((r) => r.completedAt.split('T')[0])),
  ].sort().reverse()

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1])
    const curr = new Date(uniqueDates[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const completeRoutine = (routineId: string, duration: number) => {
    const entry: RoutineProgress = {
      routineId,
      completedAt: new Date().toISOString(),
      duration,
    }
    setProgress((prev) => {
      const updated = {
        ...prev,
        completedRoutines: [...prev.completedRoutines, entry],
        lastActiveDate: new Date().toISOString(),
      }
      updated.streak = calculateStreak(updated)
      return updated
    })
  }

  const totalCompleted = progress.completedRoutines.length
  const streak = calculateStreak(progress)

  return { progress, completeRoutine, totalCompleted, streak }
}
