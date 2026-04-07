import { useRef, useCallback } from 'react'

// Web Audio API — no external files needed
let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTick() {
  const ctx = getAudioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 880
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.1)
}

function playDing() {
  const ctx = getAudioCtx()

  // Two-tone chime
  const freqs = [523.25, 659.25] // C5, E5
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    const start = ctx.currentTime + i * 0.15
    gain.gain.setValueAtTime(0.25, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
    osc.start(start)
    osc.stop(start + 0.5)
  })
}

function playStartChime() {
  const ctx = getAudioCtx()
  // Rising three-tone: C5, E5, G5
  const freqs = [523.25, 659.25, 783.99]
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    const start = ctx.currentTime + i * 0.12
    gain.gain.setValueAtTime(0.2, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
    osc.start(start)
    osc.stop(start + 0.4)
  })
}

function vibrate(pattern: number | number[]) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export function useSound() {
  const enabledRef = useRef(true)

  const initAudio = useCallback(() => {
    // Must be called from a user gesture to unlock audio on mobile
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
  }, [])

  const tick = useCallback(() => {
    if (!enabledRef.current) return
    playTick()
    vibrate(50)
  }, [])

  const ding = useCallback(() => {
    if (!enabledRef.current) return
    playDing()
    vibrate([100, 50, 100])
  }, [])

  const startChime = useCallback(() => {
    if (!enabledRef.current) return
    playStartChime()
    vibrate(100)
  }, [])

  const setEnabled = useCallback((val: boolean) => {
    enabledRef.current = val
  }, [])

  return { tick, ding, startChime, initAudio, setEnabled, enabledRef }
}
