import { chromium } from 'playwright'

const URL = 'http://localhost:3400'
const DIR = 'tests/screenshots'
const MOBILE = { width: 393, height: 852 }

async function run() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: MOBILE,
    deviceScaleFactor: 3,
  })
  const page = await context.newPage()

  // 1. Home screen
  await page.goto(URL)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${DIR}/01-home.png`, fullPage: true })
  console.log('✓ Home screen')

  // 2. Click first routine card to test detail page
  await page.click('text=Neck Pain Relief')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${DIR}/02-detail-top.png`, fullPage: false })
  console.log('✓ Routine detail (viewport)')

  // 3. Scroll detail page — check Start button no longer overlaps text
  await page.screenshot({ path: `${DIR}/03-detail-full.png`, fullPage: true })
  console.log('✓ Routine detail (full page)')

  // 4. Scroll to bottom — button should have solid bg
  await page.evaluate(() => window.scrollTo(0, 9999))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${DIR}/04-detail-bottom.png`, fullPage: false })
  console.log('✓ Routine detail (scrolled to bottom)')

  // 5. Click Start Routine → should see PREP screen, not timer
  await page.click('text=Start Routine')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${DIR}/05-prep-screen.png`, fullPage: false })
  console.log('✓ Prep screen (read instructions)')

  // 6. Scroll prep screen to see full instructions + I'm Ready button
  await page.screenshot({ path: `${DIR}/06-prep-full.png`, fullPage: true })
  console.log('✓ Prep screen (full)')

  // 7. Click "I'm Ready" → get into position countdown
  await page.click("text=I'm Ready")
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${DIR}/07-get-in-position.png`, fullPage: false })
  console.log('✓ Get into position countdown')

  // 8. Wait for hold phase to start
  await page.waitForTimeout(5500)
  await page.screenshot({ path: `${DIR}/08-hold-phase.png`, fullPage: false })
  console.log('✓ Hold phase (timer running)')

  // 9. Skip to rest phase
  await page.click('text=Skip')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${DIR}/09-rest-phase.png`, fullPage: false })
  console.log('✓ Rest/transition phase')

  // 10. Skip rest → should show prep for next stretch
  await page.click('text=Skip rest')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${DIR}/10-next-prep.png`, fullPage: false })
  console.log('✓ Next stretch prep screen')

  // 11. Pain assessment with slider
  await page.click('text=Exit')
  await page.waitForTimeout(300)
  await page.click('text=Something Hurts')
  await page.waitForTimeout(300)
  await page.click('text=Neck')
  await page.waitForTimeout(300)
  const slider = page.locator('input[type="range"]')
  await slider.fill('5')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${DIR}/11-pain-5.png`, fullPage: true })
  console.log('✓ Pain level 5')

  await slider.fill('1')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${DIR}/12-pain-1.png`, fullPage: true })
  console.log('✓ Pain level 1')

  // 12. Browse with filter
  await page.goto(URL)
  await page.waitForTimeout(300)
  await page.click('text=Browse')
  await page.waitForTimeout(300)
  await page.selectOption('select >> nth=1', 'golf')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${DIR}/13-browse-golf.png`, fullPage: true })
  console.log('✓ Browse golf filter')

  await browser.close()
  console.log('\nAll screenshots saved to tests/screenshots/')
}

run().catch(console.error)
