import { useRef, useCallback } from 'react'

let currentAudio: HTMLAudioElement | null = null

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused && !currentAudio.ended
}

function playFile(path: string, interrupt = true): HTMLAudioElement | null {
  if (!interrupt && isPlaying()) return currentAudio
  stopCurrent()
  try {
    const audio = new Audio(path)
    audio.volume = 0.85
    currentAudio = audio
    audio.play().catch(() => {
      // Audio play failed (e.g. no user gesture yet) — silently ignore
      currentAudio = null
    })
    audio.addEventListener('ended', () => {
      if (currentAudio === audio) currentAudio = null
    })
    return audio
  } catch {
    return null
  }
}

// Queue: play after current audio finishes
function playAfterCurrent(path: string) {
  if (!isPlaying()) {
    playFile(path)
    return
  }
  const prev = currentAudio!
  const onEnd = () => {
    prev.removeEventListener('ended', onEnd)
    playFile(path)
  }
  prev.addEventListener('ended', onEnd)
}

export function useVoiceGuidance() {
  const enabledRef = useRef(false)

  const setEnabled = useCallback((val: boolean) => {
    enabledRef.current = val
    if (!val) stopCurrent()
  }, [])

  const playStretchGuide = useCallback((stretchId: string) => {
    if (!enabledRef.current) return
    playFile(`/audio/${stretchId}.mp3`)
  }, [])

  // Play only if nothing else is currently playing — don't interrupt
  const playStretchGuideIfIdle = useCallback((stretchId: string) => {
    if (!enabledRef.current) return
    playFile(`/audio/${stretchId}.mp3`, false)
  }, [])

  const playSideSwitch = useCallback((stretchId: string) => {
    if (!enabledRef.current) return
    // Queue after current audio so instructions finish first
    playAfterCurrent(`/audio/${stretchId}-switch.mp3`)
  }, [])

  const playRest = useCallback(() => {
    if (!enabledRef.current) return
    playAfterCurrent('/audio/rest.mp3')
  }, [])

  const playComplete = useCallback(() => {
    if (!enabledRef.current) return
    playAfterCurrent('/audio/complete.mp3')
  }, [])

  const playFiveSeconds = useCallback(() => {
    if (!enabledRef.current) return
    // Only announce 5 seconds if nothing else is playing
    if (!isPlaying()) playFile('/audio/five-seconds.mp3')
  }, [])

  const stop = useCallback(() => {
    stopCurrent()
  }, [])

  return {
    setEnabled,
    enabledRef,
    playStretchGuide,
    playStretchGuideIfIdle,
    playSideSwitch,
    playRest,
    playComplete,
    playFiveSeconds,
    stop,
  }
}
