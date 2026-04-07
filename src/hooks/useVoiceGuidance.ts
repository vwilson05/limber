import { useRef, useCallback } from 'react'

let currentAudio: HTMLAudioElement | null = null

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

function playFile(path: string): HTMLAudioElement | null {
  stopCurrent()
  try {
    const audio = new Audio(path)
    audio.volume = 0.85
    currentAudio = audio
    audio.play().catch(() => {
      // Audio play failed (e.g. no user gesture yet) — silently ignore
    })
    audio.addEventListener('ended', () => {
      if (currentAudio === audio) currentAudio = null
    })
    return audio
  } catch {
    return null
  }
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

  const playSideSwitch = useCallback((stretchId: string) => {
    if (!enabledRef.current) return
    playFile(`/audio/${stretchId}-switch.mp3`)
  }, [])

  const playRest = useCallback(() => {
    if (!enabledRef.current) return
    playFile('/audio/rest.mp3')
  }, [])

  const playComplete = useCallback(() => {
    if (!enabledRef.current) return
    playFile('/audio/complete.mp3')
  }, [])

  const playFiveSeconds = useCallback(() => {
    if (!enabledRef.current) return
    playFile('/audio/five-seconds.mp3')
  }, [])

  const stop = useCallback(() => {
    stopCurrent()
  }, [])

  return {
    setEnabled,
    enabledRef,
    playStretchGuide,
    playSideSwitch,
    playRest,
    playComplete,
    playFiveSeconds,
    stop,
  }
}
