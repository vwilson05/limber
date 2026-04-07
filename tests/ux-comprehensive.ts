import { chromium, type Page, type BrowserContext } from 'playwright'

const URL = 'http://localhost:3400'
const DIR = 'tests/screenshots/comprehensive'
const MOBILE = { width: 393, height: 852 }

let passed = 0
let failed = 0
const failures: string[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (e: any) {
    failed++
    failures.push(`${name}: ${e.message.split('\n')[0]}`)
    console.log(`  ✗ ${name} — ${e.message.split('\n')[0]}`)
  }
}

async function run() {
  const browser = await chromium.launch()

  async function freshPage(): Promise<{ context: BrowserContext; page: Page }> {
    const context = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 })
    const page = await context.newPage()
    await page.goto(URL)
    await page.waitForTimeout(300)
    return { context, page }
  }

  // ============================
  // HOME SCREEN
  // ============================
  console.log('\n— Home Screen —')
  {
    const { context, page } = await freshPage()

    await test('1. Home: title "Limber" is visible', async () => {
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await test('2. Home: subtitle is visible', async () => {
      await page.waitForSelector('text=Smart stretching. Real results.', { timeout: 3000 })
    })

    await test('3. Home: "Something Hurts" button exists', async () => {
      await page.waitForSelector('text=Something Hurts', { timeout: 3000 })
    })

    await test('4. Home: "Browse Routines" button exists', async () => {
      await page.waitForSelector('text=Browse Routines', { timeout: 3000 })
    })

    await test('5. Home: Quick Routines section visible', async () => {
      await page.waitForSelector('text=Quick Routines', { timeout: 3000 })
    })

    await test('6. Home: Pain Relief section visible', async () => {
      await page.waitForSelector('text=Pain Relief', { timeout: 3000 })
    })

    await test('7. Home: bottom nav has 4 tabs', async () => {
      const tabs = await page.locator('text=Home >> visible=true').count()
      const browse = await page.locator('text=Browse >> visible=true').count()
      const pain = await page.locator('text=Pain >> visible=true').count()
      const progress = await page.locator('text=Progress >> visible=true').count()
      if (tabs < 1 || browse < 1 || pain < 1 || progress < 1) throw new Error('Missing nav tabs')
    })

    await test('8. Home: routine cards show duration', async () => {
      const durations = await page.locator('text=/\\d+m/').count()
      if (durations < 3) throw new Error(`Only ${durations} duration labels found`)
    })

    await test('9. Home: routine cards show level', async () => {
      // Level is rendered lowercase with CSS capitalize — check raw text
      const levels = await page.locator('span.capitalize').count()
      if (levels < 2) throw new Error(`Only ${levels} level labels found`)
    })

    await test('10. Home: no progress bar shown for fresh user', async () => {
      // The streak/done stats bar should NOT be visible with no completions
      const statsBar = await page.locator('text=Streak').count()
      if (statsBar > 0) throw new Error('Stats bar visible for fresh user')
    })

    await context.close()
  }

  // ============================
  // NAVIGATION
  // ============================
  console.log('\n— Navigation —')
  {
    const { context, page } = await freshPage()

    await test('11. Nav: Browse tab navigates to browse view', async () => {
      // Target the bottom nav tab specifically (flex container at the bottom)
      const navBrowse = page.locator('.fixed.bottom-0 button:has-text("Browse")')
      await navBrowse.click()
      await page.waitForTimeout(200)
      await page.waitForSelector('h2:has-text("Browse Routines")', { timeout: 3000 })
    })

    await test('12. Nav: Pain tab navigates to pain view', async () => {
      const navPain = page.locator('.fixed.bottom-0 button:has-text("Pain")')
      await navPain.click()
      await page.waitForTimeout(200)
      await page.waitForSelector("text=What's bothering you?", { timeout: 3000 })
    })

    await test('13. Nav: Home tab returns to home', async () => {
      const navHome = page.locator('.fixed.bottom-0 button:has-text("Home")')
      await navHome.click()
      await page.waitForTimeout(200)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await test('14. Nav: Progress tab navigates to progress', async () => {
      const navProgress = page.locator('.fixed.bottom-0 button:has-text("Progress")')
      await navProgress.click()
      await page.waitForTimeout(200)
      await page.waitForSelector('text=Your Progress', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // ROUTINE DETAIL
  // ============================
  console.log('\n— Routine Detail —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Neck Pain Relief')
    await page.waitForTimeout(400)

    await test('15. Detail: routine name shown', async () => {
      await page.waitForSelector('h1:has-text("Neck Pain Relief")', { timeout: 3000 })
    })

    await test('16. Detail: description shown', async () => {
      await page.waitForSelector('text=Gentle routine to release neck tension', { timeout: 3000 })
    })

    await test('17. Detail: duration stat shown', async () => {
      await page.waitForSelector('text=Duration', { timeout: 3000 })
    })

    await test('18. Detail: stretches count shown', async () => {
      await page.waitForSelector('text=Stretches', { timeout: 3000 })
    })

    await test('19. Detail: level stat shown', async () => {
      await page.waitForSelector('text=Level', { timeout: 3000 })
    })

    await test('20. Detail: "What to Expect" milestones section', async () => {
      await page.waitForSelector('text=What to Expect', { timeout: 3000 })
    })

    await test('21. Detail: First Session milestone exists', async () => {
      await page.waitForSelector('text=First Session', { timeout: 3000 })
    })

    await test('22. Detail: 2 Months milestone exists', async () => {
      await page.waitForSelector('text=2 Months', { timeout: 3000 })
    })

    await test('23. Detail: stretches list section', async () => {
      await page.waitForSelector('text=Stretches in This Routine', { timeout: 3000 })
    })

    await test('24. Detail: muscles targeted section', async () => {
      await page.waitForSelector('text=Muscles Targeted', { timeout: 3000 })
    })

    await test('25. Detail: Start Routine button visible', async () => {
      await page.waitForSelector('button:has-text("Start Routine")', { timeout: 3000 })
    })

    await test('26. Detail: Start button does NOT overlap content when scrolled', async () => {
      // Scroll to the bottom of the page content
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(300)
      // The h-24 spacer should push content above the fixed button
      const spacer = await page.locator('.h-24').count()
      if (spacer < 1) throw new Error('No spacer div found for Start button')
    })

    await test('27. Detail: Back button returns to previous view', async () => {
      await page.click('text=Back')
      await page.waitForTimeout(300)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // ACTIVE ROUTINE — PREP PHASE
  // ============================
  console.log('\n— Active Routine: Prep Phase —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Neck Pain Relief')
    await page.waitForTimeout(300)
    await page.click('text=Start Routine')
    await page.waitForTimeout(300)

    await test('28. Prep: "Up Next" label shown', async () => {
      await page.waitForSelector('text=Up Next', { timeout: 3000 })
    })

    await test('29. Prep: stretch name shown', async () => {
      await page.waitForSelector('text=Lateral Neck Tilt', { timeout: 3000 })
    })

    await test('30. Prep: instructions card visible', async () => {
      await page.waitForSelector('text=Sit or stand tall', { timeout: 3000 })
    })

    await test('31. Prep: "I\'m Ready" button visible', async () => {
      await page.waitForSelector("button:has-text(\"I'm Ready\")", { timeout: 3000 })
    })

    await test('32. Prep: timer is NOT running', async () => {
      // No countdown numbers should be visible in prep
      const bigNumbers = await page.locator('.text-8xl').count()
      if (bigNumbers > 0) throw new Error('Timer visible during prep phase')
    })

    await test('33. Prep: counter shows "1 / 5"', async () => {
      await page.waitForSelector('text=1 / 5', { timeout: 3000 })
    })

    await test('34. Prep: side indicator shows "Right Side First"', async () => {
      await page.waitForSelector('text=Right Side First', { timeout: 3000 })
    })

    await test('35. Prep: target muscles shown', async () => {
      await page.waitForSelector('text=Upper trapezius', { timeout: 3000 })
    })

    await test('36. Prep: Skip button works to advance', async () => {
      await page.click('text=Skip')
      await page.waitForTimeout(300)
      // Should now be on prep for stretch 2
      await page.waitForSelector('text=2 / 5', { timeout: 3000 })
    })

    await test('37. Prep: Exit button returns to home', async () => {
      await page.click('text=Exit')
      await page.waitForTimeout(300)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // ACTIVE ROUTINE — GET IN POSITION
  // ============================
  console.log('\n— Active Routine: Get In Position —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Neck Pain Relief')
    await page.waitForTimeout(300)
    await page.click('text=Start Routine')
    await page.waitForTimeout(300)
    await page.click("text=I'm Ready")
    await page.waitForTimeout(300)

    await test('38. Position: "Get into position" text shown', async () => {
      await page.waitForSelector('text=Get into position', { timeout: 3000 })
    })

    await test('39. Position: countdown visible (amber colored)', async () => {
      const countdown = page.locator('.text-amber-500')
      const count = await countdown.count()
      if (count < 1) throw new Error('No amber countdown found')
    })

    await test('40. Position: "Start now" skip link available', async () => {
      await page.waitForSelector('text=Start now', { timeout: 3000 })
    })

    await test('41. Position: "Start now" skips to hold phase', async () => {
      await page.click('text=Start now')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Hold', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // ACTIVE ROUTINE — HOLD PHASE
  // ============================
  console.log('\n— Active Routine: Hold Phase —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Neck Pain Relief')
    await page.waitForTimeout(300)
    await page.click('text=Start Routine')
    await page.waitForTimeout(300)
    await page.click("text=I'm Ready")
    await page.waitForTimeout(300)
    await page.click('text=Start now')
    await page.waitForTimeout(300)

    await test('42. Hold: "HOLD" label shown', async () => {
      await page.waitForSelector('text=Hold', { timeout: 3000 })
    })

    await test('43. Hold: stretch name shown', async () => {
      await page.waitForSelector('text=Lateral Neck Tilt', { timeout: 3000 })
    })

    await test('44. Hold: green timer visible', async () => {
      const timer = page.locator('.text-emerald-500.tabular-nums')
      const count = await timer.count()
      if (count < 1) throw new Error('No green timer found')
    })

    await test('45. Hold: timer is counting down', async () => {
      const first = await page.locator('.text-8xl').textContent()
      await page.waitForTimeout(1500)
      const second = await page.locator('.text-8xl').textContent()
      if (first === second) throw new Error(`Timer not counting: ${first} → ${second}`)
    })

    await test('46. Hold: pause button visible', async () => {
      // The center circle button
      const pauseBtn = page.locator('.w-16.h-16')
      if (await pauseBtn.count() < 1) throw new Error('No pause button')
    })

    await test('47. Hold: pause stops the timer', async () => {
      await page.locator('.w-16.h-16').click()
      await page.waitForTimeout(200)
      const first = await page.locator('.text-8xl').textContent()
      await page.waitForTimeout(1500)
      const second = await page.locator('.text-8xl').textContent()
      if (first !== second) throw new Error(`Timer still running while paused: ${first} → ${second}`)
    })

    await test('48. Hold: resume restarts the timer', async () => {
      await page.locator('.w-16.h-16').click() // unpause
      await page.waitForTimeout(200)
      const first = await page.locator('.text-8xl').textContent()
      await page.waitForTimeout(1500)
      const second = await page.locator('.text-8xl').textContent()
      if (first === second) throw new Error(`Timer not resumed: ${first} → ${second}`)
    })

    await test('49. Hold: side indicator visible for bilateral stretch', async () => {
      await page.waitForSelector('text=Right Side', { timeout: 3000 })
    })

    await test('50. Hold: instruction reminder shown', async () => {
      // Last instruction should be visible as a condensed reminder
      await page.waitForSelector('text=deeper stretch', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // ACTIVE ROUTINE — SIDE SWITCHING
  // ============================
  console.log('\n— Active Routine: Side Switching —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Neck Pain Relief')
    await page.waitForTimeout(300)
    await page.click('text=Start Routine')
    await page.waitForTimeout(300)
    await page.click("text=I'm Ready")
    await page.waitForTimeout(300)
    await page.click('text=Start now')
    await page.waitForTimeout(300)

    // Skip right side hold
    await page.click('text=Skip')
    await page.waitForTimeout(300)

    await test('51. Side switch: shows get-in-position for Left Side', async () => {
      await page.waitForSelector('text=Left Side', { timeout: 3000 })
    })

    await test('52. Side switch: shows get-into-position countdown', async () => {
      await page.waitForSelector('text=Get into position', { timeout: 3000 })
    })

    // Skip through left side to get to rest
    await page.click('text=Start now')
    await page.waitForTimeout(300)
    await page.click('text=Skip')
    await page.waitForTimeout(300)

    await test('53. After both sides: transitions to rest or next prep', async () => {
      // Should be in rest phase showing next stretch, or in prep for next stretch
      const hasRest = await page.locator('text=Rest').count()
      const hasUpNext = await page.locator('text=Up Next').count()
      if (hasRest < 1 && hasUpNext < 1) throw new Error('Neither rest nor next prep shown')
    })

    await context.close()
  }

  // ============================
  // REST / TRANSITION
  // ============================
  console.log('\n— Rest / Transition —')
  {
    const { context, page } = await freshPage()

    // Use Desk Worker Reset — first stretch is chin-tuck (no sides), easier to test rest
    await page.click('text=Browse')
    await page.waitForTimeout(200)
    await page.click('text=Desk Worker Reset')
    await page.waitForTimeout(300)
    await page.click('text=Start Routine')
    await page.waitForTimeout(300)
    // Prep for chin tuck
    await page.click("text=I'm Ready")
    await page.waitForTimeout(300)
    await page.click('text=Start now')
    await page.waitForTimeout(300)
    // Skip the hold
    await page.click('text=Skip')
    await page.waitForTimeout(500)

    await test('54. Rest: "Rest" label shown', async () => {
      await page.waitForSelector('text=Rest', { timeout: 3000 })
    })

    await test('55. Rest: countdown timer visible', async () => {
      const timer = page.locator('.text-7xl')
      if (await timer.count() < 1) throw new Error('No rest timer')
    })

    await test('56. Rest: next stretch preview shown', async () => {
      await page.waitForSelector('text=Up Next', { timeout: 3000 })
    })

    await test('57. Rest: "Skip rest" button available', async () => {
      await page.waitForSelector('text=Skip rest', { timeout: 3000 })
    })

    await test('58. Rest: skip rest advances to next prep', async () => {
      await page.click('text=Skip rest')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Up Next', { timeout: 3000 })
      await page.waitForSelector('text=2 / 5', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // PAIN ASSESSMENT
  // ============================
  console.log('\n— Pain Assessment —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Something Hurts')
    await page.waitForTimeout(300)

    await test('59. Pain: title shown', async () => {
      await page.waitForSelector("text=What's bothering you?", { timeout: 3000 })
    })

    await test('60. Pain: body map has all regions', async () => {
      const regions = ['Neck', 'Shoulders', 'Chest', 'Upper Back', 'Lower Back', 'Hips', 'Glutes', 'Quads', 'Hamstrings', 'Calves', 'Ankles', 'Wrists']
      for (const r of regions) {
        const count = await page.locator(`button:has-text("${r}")`).count()
        if (count < 1) throw new Error(`Missing body region: ${r}`)
      }
    })

    await test('61. Pain: no routines shown before selecting a region', async () => {
      const routines = await page.locator('text=Pain Relief Routines').count()
      if (routines > 0) throw new Error('Routines shown before region selection')
    })

    await page.click('button:has-text("Lower Back")')
    await page.waitForTimeout(300)

    await test('62. Pain: selecting a region highlights it', async () => {
      const selected = page.locator('button:has-text("Lower Back").bg-emerald-500')
      if (await selected.count() < 1) throw new Error('Region not highlighted')
    })

    await test('63. Pain: slider appears after region selection', async () => {
      await page.waitForSelector('input[type="range"]', { timeout: 3000 })
    })

    await test('64. Pain: pain level description shown', async () => {
      await page.waitForSelector('text=Standard routine', { timeout: 3000 })
    })

    await test('65. Pain: matching routines shown for lower back', async () => {
      await page.waitForSelector('text=Lower Back Relief', { timeout: 3000 })
    })

    await test('66. Pain: level 1 shows "Deep" adapted routines', async () => {
      await page.locator('input[type="range"]').fill('1')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=/Deep/', { timeout: 3000 })
    })

    await test('67. Pain: level 1 description says longer holds', async () => {
      await page.waitForSelector('text=Longer holds, deeper stretches', { timeout: 3000 })
    })

    await test('68. Pain: level 5 shows "Extra Gentle" adapted routines', async () => {
      await page.locator('input[type="range"]').fill('5')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=/Extra Gentle/', { timeout: 3000 })
    })

    await test('69. Pain: level 5 shows medical disclaimer', async () => {
      await page.waitForSelector('text=healthcare professional', { timeout: 3000 })
    })

    await test('70. Pain: level 5 description says very gentle', async () => {
      await page.waitForSelector('text=Very gentle', { timeout: 3000 })
    })

    await test('71. Pain: level 4 shows "Gentle" adapted routines', async () => {
      await page.locator('input[type="range"]').fill('4')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=/Gentle/', { timeout: 3000 })
    })

    await test('72. Pain: routine cards show stretch count and duration', async () => {
      const info = await page.locator('text=/\\d+ stretches/').count()
      if (info < 1) throw new Error('No stretch count in routine cards')
    })

    await test('73. Pain: clicking routine goes to detail', async () => {
      await page.locator('input[type="range"]').fill('3')
      await page.waitForTimeout(200)
      await page.click('text=Lower Back Relief')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=What to Expect', { timeout: 3000 })
    })

    await test('74. Pain: back from pain assessment returns to home', async () => {
      await page.click('text=Back')
      await page.waitForTimeout(200)
      // Back from detail → pain view
      await page.waitForSelector("text=What's bothering you?", { timeout: 3000 })
      // Now test the back button from pain view
      const backBtns = page.locator('svg').first()
      await backBtns.click()
      await page.waitForTimeout(200)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // BROWSE & FILTERS
  // ============================
  console.log('\n— Browse & Filters —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Browse Routines')
    await page.waitForTimeout(300)

    await test('75. Browse: all filter dropdowns present', async () => {
      const selects = await page.locator('select').count()
      if (selects < 5) throw new Error(`Only ${selects} filter dropdowns, expected 5`)
    })

    await test('76. Browse: shows routine count', async () => {
      await page.waitForSelector('text=/\\d+ routines?/', { timeout: 3000 })
    })

    await test('77. Browse: Goal filter works', async () => {
      await page.selectOption('select >> nth=0', 'pain-relief')
      await page.waitForTimeout(200)
      const cards = await page.locator('text=pain relief').count()
      if (cards < 1) throw new Error('No pain relief routines after filter')
    })

    await test('78. Browse: Activity filter works', async () => {
      await page.selectOption('select >> nth=0', '') // clear goal
      await page.selectOption('select >> nth=1', 'golf')
      await page.waitForTimeout(200)
      // Should show golf-specific routines
      await page.waitForSelector('text=Golf Pre-Round', { timeout: 3000 })
    })

    await test('79. Browse: Body Area filter works', async () => {
      await page.selectOption('select >> nth=1', '') // clear sport
      await page.selectOption('select >> nth=2', 'hips')
      await page.waitForTimeout(200)
      const count = await page.locator('text=/\\d+ routines?/').textContent()
      if (!count) throw new Error('No count shown')
    })

    await test('80. Browse: Level filter works', async () => {
      await page.selectOption('select >> nth=2', '') // clear body region
      await page.selectOption('select >> nth=3', 'intermediate')
      await page.waitForTimeout(200)
      const count = await page.locator('text=/\\d+ routines?/').textContent()
      if (!count) throw new Error('No count shown')
    })

    await test('81. Browse: Duration filter works', async () => {
      await page.selectOption('select >> nth=3', '') // clear level
      await page.selectOption('select >> nth=4', '5')
      await page.waitForTimeout(200)
      await page.waitForSelector('text=/5m/', { timeout: 3000 })
    })

    await test('82. Browse: "Clear all filters" resets', async () => {
      await page.click('text=Clear all filters')
      await page.waitForTimeout(200)
      const count = await page.locator('text=/\\d+ routines?/').textContent()
      const num = parseInt(count || '0')
      if (num < 15) throw new Error(`Only ${num} routines after clearing, expected 15+`)
    })

    await test('83. Browse: combining filters narrows results', async () => {
      await page.selectOption('select >> nth=0', 'warmup')
      await page.selectOption('select >> nth=1', 'golf')
      await page.waitForTimeout(200)
      const count = await page.locator('text=/\\d+ routines?/').textContent()
      const num = parseInt(count || '0')
      if (num > 3) throw new Error(`Too many results for warmup+golf: ${num}`)
    })

    await test('84. Browse: impossible filter combo shows empty state', async () => {
      await page.selectOption('select >> nth=0', 'pain-relief')
      await page.selectOption('select >> nth=1', 'parkour')
      await page.waitForTimeout(200)
      await page.waitForSelector('text=No routines match', { timeout: 3000 })
    })

    await test('85. Browse: back button returns to home', async () => {
      const backBtn = page.locator('svg').first()
      await backBtn.click()
      await page.waitForTimeout(200)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // PROGRESS
  // ============================
  console.log('\n— Progress —')
  {
    const { context, page } = await freshPage()

    await page.click('button:has-text("Progress") >> visible=true')
    await page.waitForTimeout(300)

    await test('86. Progress: title shown', async () => {
      await page.waitForSelector('text=Your Progress', { timeout: 3000 })
    })

    await test('87. Progress: stats cards shown (streak, routines, minutes)', async () => {
      await page.waitForSelector('text=Day Streak', { timeout: 3000 })
      await page.waitForSelector('text=Routines', { timeout: 3000 })
      await page.waitForSelector('text=Minutes', { timeout: 3000 })
    })

    await test('88. Progress: fresh user shows 0 stats', async () => {
      const zeros = await page.locator('p.text-emerald-500:has-text("0")').count()
      if (zeros < 3) throw new Error(`Expected 3 zero stats, found ${zeros}`)
    })

    await test('89. Progress: empty activity message shown', async () => {
      await page.waitForSelector('text=No activity this week', { timeout: 3000 })
    })

    await test('90. Progress: back button works', async () => {
      const backBtn = page.locator('svg').first()
      await backBtn.click()
      await page.waitForTimeout(200)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await context.close()
  }

  // ============================
  // FULL ROUTINE COMPLETION
  // ============================
  console.log('\n— Full Routine Completion —')
  {
    const { context, page } = await freshPage()

    // Use Quick Upper Body Release — only 3 stretches, fastest to complete
    await page.click('text=Browse')
    await page.waitForTimeout(200)
    await page.selectOption('select >> nth=4', '5') // 5 min duration
    await page.waitForTimeout(200)
    await page.click('text=Quick Upper Body Release')
    await page.waitForTimeout(300)
    await page.click('text=Start Routine')
    await page.waitForTimeout(300)

    // Speed through all stretches
    for (let i = 0; i < 20; i++) {
      // Try to find and click through phases
      const ready = await page.locator("button:has-text(\"I'm Ready\")").count()
      if (ready > 0) {
        await page.click("text=I'm Ready")
        await page.waitForTimeout(200)
        await page.click('text=Start now')
        await page.waitForTimeout(200)
        await page.click('text=Skip')
        await page.waitForTimeout(200)
        continue
      }
      const skipRest = await page.locator('text=Skip rest').count()
      if (skipRest > 0) {
        await page.click('text=Skip rest')
        await page.waitForTimeout(200)
        continue
      }
      const getInPos = await page.locator('text=Start now').count()
      if (getInPos > 0) {
        await page.click('text=Start now')
        await page.waitForTimeout(200)
        const skip = await page.locator('text=Skip >> visible=true').first()
        if (await skip.count() > 0) {
          await skip.click()
          await page.waitForTimeout(200)
        }
        continue
      }
      const complete = await page.locator('text=Routine Complete').count()
      if (complete > 0) break
      // Fallback: try skip
      const skip = await page.locator('button:has-text("Skip")').count()
      if (skip > 0) {
        await page.locator('button:has-text("Skip")').first().click()
        await page.waitForTimeout(200)
      }
    }

    await test('91. Complete: "Routine Complete" shown', async () => {
      await page.waitForSelector('text=Routine Complete', { timeout: 5000 })
    })

    await test('92. Complete: total time shown', async () => {
      await page.waitForSelector('text=/\\d+:\\d+ total/', { timeout: 3000 })
    })

    await test('93. Complete: Done button visible', async () => {
      await page.waitForSelector('button:has-text("Done")', { timeout: 3000 })
    })

    await test('94. Complete: Done returns to home', async () => {
      await page.click('text=Done')
      await page.waitForTimeout(300)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await test('95. Complete: progress stats bar now visible on home', async () => {
      // After completing a routine, the stats bar should show
      await page.waitForSelector('text=/Done/i', { timeout: 3000 })
    })

    await test('96. Complete: progress page shows completed routine', async () => {
      await page.click('button:has-text("Progress") >> visible=true')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Quick Upper Body Release', { timeout: 3000 })
    })

    await test('97. Complete: streak is at least 1', async () => {
      const streak = await page.locator('p.text-emerald-500:has-text("1")').count()
      if (streak < 1) throw new Error('Streak not showing 1')
    })

    await context.close()
  }

  // ============================
  // DETAIL FROM PAIN ASSESSMENT
  // ============================
  console.log('\n— Pain → Detail → Active Flow —')
  {
    const { context, page } = await freshPage()

    await page.click('text=Something Hurts')
    await page.waitForTimeout(200)
    await page.click('button:has-text("Shoulders")')
    await page.waitForTimeout(200)

    await test('98. Pain→Detail: clicking pain routine goes to detail', async () => {
      await page.click('text=Shoulder Pain Relief')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=What to Expect', { timeout: 3000 })
    })

    await test('99. Pain→Detail: back from detail returns to pain view', async () => {
      await page.click('text=Back')
      await page.waitForTimeout(300)
      await page.waitForSelector("text=What's bothering you?", { timeout: 3000 })
    })

    await test('100. Pain→Detail→Active: full flow works', async () => {
      await page.click('button:has-text("Shoulders")')
      await page.waitForTimeout(200)
      await page.click('text=Shoulder Pain Relief')
      await page.waitForTimeout(300)
      await page.click('text=Start Routine')
      await page.waitForTimeout(300)
      await page.waitForSelector("text=I'm Ready", { timeout: 3000 })
    })

    await context.close()
  }

  await browser.close()

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`)
  if (failures.length > 0) {
    console.log('\nFailures:')
    failures.forEach((f) => console.log(`  ✗ ${f}`))
  }
  console.log('='.repeat(50))

  process.exit(failed > 0 ? 1 : 0)
}

run().catch(console.error)
