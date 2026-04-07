import { chromium } from 'playwright'

const URL = 'http://localhost:3400'
const DIR = 'tests/screenshots/new-features'
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

  // ============================
  // ASK / NATURAL LANGUAGE SEARCH
  // ============================
  console.log('\n— Ask / Natural Language Search —')
  {
    const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await page.goto(URL)
    await page.waitForTimeout(300)

    await test('1. Home: "Tell me" search bar visible', async () => {
      await page.waitForSelector("text=Tell me what's going on", { timeout: 3000 })
    })

    await page.click("text=Tell me what's going on")
    await page.waitForTimeout(300)

    await test('2. Ask: title shown', async () => {
      await page.waitForSelector('text=What do you need?', { timeout: 3000 })
    })

    await test('3. Ask: input field present', async () => {
      await page.waitForSelector('input[type="text"]', { timeout: 3000 })
    })

    await test('4. Ask: suggestion chips visible', async () => {
      await page.waitForSelector('text=Try saying something like', { timeout: 3000 })
    })

    await test('5. Ask: tapping a suggestion fills input', async () => {
      await page.click('text=My neck hurts from sleeping wrong')
      await page.waitForTimeout(300)
      const val = await page.inputValue('input[type="text"]')
      if (!val.includes('neck')) throw new Error(`Input not filled: ${val}`)
    })

    await test('6. Ask: results appear for neck pain query', async () => {
      await page.waitForSelector('text=/\\d+ match/', { timeout: 3000 })
      await page.waitForSelector('text=Neck Pain Relief', { timeout: 3000 })
    })

    await test('7. Ask: results show match reason', async () => {
      await page.waitForSelector('text=Matched:', { timeout: 3000 })
    })

    await page.screenshot({ path: `${DIR}/ask-neck-results.png`, fullPage: true })

    await test('8. Ask: clear button clears input', async () => {
      const clearBtn = page.locator('input[type="text"] ~ button')
      await clearBtn.click()
      await page.waitForTimeout(200)
      const val = await page.inputValue('input[type="text"]')
      if (val !== '') throw new Error(`Input not cleared: ${val}`)
    })

    await test('9. Ask: "lower back" finds back routines', async () => {
      await page.fill('input[type="text"]', 'my lower back is killing me')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Lower Back Relief', { timeout: 3000 })
    })

    await test('10. Ask: "golf" finds golf routines', async () => {
      await page.fill('input[type="text"]', 'warm up before golf')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Golf Pre-Round', { timeout: 3000 })
    })

    await page.screenshot({ path: `${DIR}/ask-golf-results.png`, fullPage: true })

    await test('11. Ask: "sitting all day" finds desk routines', async () => {
      await page.fill('input[type="text"]', "I've been sitting all day")
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Desk Worker Reset', { timeout: 3000 })
    })

    await test('12. Ask: "quick legs" finds short lower body', async () => {
      await page.fill('input[type="text"]', 'something quick for my legs')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Quick Lower Body', { timeout: 3000 })
    })

    await test('13. Ask: "feel old" finds 40+ routine', async () => {
      await page.fill('input[type="text"]', 'I feel old and creaky')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=40+', { timeout: 3000 })
    })

    await test('14. Ask: "cant touch toes" finds hamstring routine', async () => {
      await page.fill('input[type="text"]', "can't touch my toes")
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Hamstring', { timeout: 3000 })
    })

    await test('15. Ask: "after my run" finds cooldown', async () => {
      await page.fill('input[type="text"]', 'after my run')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=Cooldown', { timeout: 3000 })
    })

    await test('16. Ask: nonsense query shows no results', async () => {
      await page.fill('input[type="text"]', 'xyzzy foobar baz')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=No matches', { timeout: 3000 })
    })

    await test('17. Ask: clicking result goes to detail', async () => {
      await page.fill('input[type="text"]', 'neck hurts')
      await page.waitForTimeout(300)
      await page.click('text=Neck Pain Relief')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=What to Expect', { timeout: 3000 })
    })

    await test('18. Ask: back from detail returns to ask', async () => {
      await page.click('text=Back')
      await page.waitForTimeout(300)
      await page.waitForSelector('text=What do you need?', { timeout: 3000 })
    })

    await test('19. Ask: back from ask returns to home', async () => {
      const backBtn = page.locator('svg').first()
      await backBtn.click()
      await page.waitForTimeout(300)
      await page.waitForSelector('h1:has-text("Limber")', { timeout: 3000 })
    })

    await ctx.close()
  }

  // ============================
  // SOUND / VIBRATION
  // ============================
  console.log('\n— Sound Controls —')
  {
    const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await page.goto(URL)
    await page.waitForTimeout(300)

    await page.click('text=Neck Pain Relief')
    await page.waitForTimeout(300)
    await page.click('text=Start Routine')
    await page.waitForTimeout(300)
    await page.click("text=I'm Ready")
    await page.waitForTimeout(300)
    await page.click('text=Start now')
    await page.waitForTimeout(300)

    await test('20. Sound: sound toggle button visible in header', async () => {
      // The sound toggle is an SVG button in the header area
      const header = page.locator('.flex.items-center.justify-between.mb-6')
      const svgButtons = header.locator('button')
      const count = await svgButtons.count()
      if (count < 3) throw new Error(`Expected 3+ buttons in header, found ${count}`)
    })

    await test('21. Sound: sound toggle is clickable', async () => {
      const soundBtn = page.locator('button[title]')
      await soundBtn.click()
      await page.waitForTimeout(200)
      // Should now show "Enable sounds" title
      await page.waitForSelector('button[title="Enable sounds"]', { timeout: 3000 })
    })

    await test('22. Sound: can re-enable sound', async () => {
      const soundBtn = page.locator('button[title="Enable sounds"]')
      await soundBtn.click()
      await page.waitForTimeout(200)
      await page.waitForSelector('button[title="Mute sounds"]', { timeout: 3000 })
    })

    await page.screenshot({ path: `${DIR}/sound-toggle.png`, fullPage: false })

    await ctx.close()
  }

  await browser.close()

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
