/**
 * Generate voice guidance audio files for all stretches using ElevenLabs.
 * Run once: bun scripts/generate-voice.ts
 *
 * Generates one MP3 per stretch with:
 * - Stretch name announcement
 * - Step-by-step instructions spoken calmly
 * - Side switch cue (for bilateral stretches)
 * - "Hold here" prompt
 */

import { stretches } from '../src/data/stretches'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const API_KEY = process.env.ELEVENLABS_API_KEY!
const VOICE_ID = 'SAz9YHcvj6GT2YYXdXww' // River - Relaxed, Neutral, Informative
const MODEL = 'eleven_multilingual_v2'
const OUTPUT_DIR = 'public/audio'

if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY env var')
  process.exit(1)
}

async function generateAudio(text: string, filename: string): Promise<void> {
  const outPath = `${OUTPUT_DIR}/${filename}`
  if (existsSync(outPath)) {
    console.log(`  ⏭ ${filename} (already exists)`)
    return
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs API error for ${filename}: ${res.status} ${err}`)
  }

  const buffer = await res.arrayBuffer()
  await Bun.write(outPath, buffer)
  console.log(`  ✓ ${filename} (${Math.round(buffer.byteLength / 1024)}KB)`)
}

function buildStretchScript(stretch: typeof stretches[0]): string {
  const lines: string[] = []
  lines.push(`${stretch.name}.`)
  lines.push('')

  stretch.instructions.forEach((inst, i) => {
    lines.push(inst)
    // Add a brief pause after each instruction
    if (i < stretch.instructions.length - 1) lines.push('')
  })

  lines.push('')
  lines.push('Hold here. Breathe slowly and deeply.')

  return lines.join(' ')
}

function buildSideSwitchScript(stretch: typeof stretches[0]): string {
  return `Now switch to the other side. ${stretch.instructions[1] ? stretch.instructions[1].replace('right', 'left').replace('Right', 'Left') : 'Mirror the position on the other side.'} Hold here.`
}

function buildRestScript(): string {
  return 'Rest. Take a breath. Get ready for the next stretch.'
}

function buildCompleteScript(): string {
  return 'Great work. Routine complete. Take a moment to notice how your body feels.'
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  console.log(`Generating voice guidance for ${stretches.length} stretches...\n`)

  let totalChars = 0

  // Generate per-stretch audio
  for (const stretch of stretches) {
    const script = buildStretchScript(stretch)
    totalChars += script.length
    await generateAudio(script, `${stretch.id}.mp3`)

    // Generate side-switch audio for bilateral stretches
    if (stretch.sides === 'both') {
      const switchScript = buildSideSwitchScript(stretch)
      totalChars += switchScript.length
      await generateAudio(switchScript, `${stretch.id}-switch.mp3`)
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300))
  }

  // Generate utility audio
  const restScript = buildRestScript()
  totalChars += restScript.length
  await generateAudio(restScript, 'rest.mp3')

  const completeScript = buildCompleteScript()
  totalChars += completeScript.length
  await generateAudio(completeScript, 'complete.mp3')

  // Generate countdown cues
  await generateAudio('Five seconds remaining.', 'five-seconds.mp3')
  totalChars += 25

  console.log(`\nDone! Total characters sent: ${totalChars}`)
  console.log(`Files saved to ${OUTPUT_DIR}/`)
}

main().catch(console.error)
