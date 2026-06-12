// クリック→InfoPanel表示の手動検証スクリプト（headless）
// 実行: node scripts/verify-click.mjs（devサーバーが localhost:5173 で起動している前提）
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

async function clickAndReport(page, label, x, y) {
  await page.mouse.click(x, y)
  await page.waitForTimeout(500)
  const panel = page.locator('.info-panel h2')
  if (await panel.count()) {
    console.log(`[${label}] click(${x},${y}) -> InfoPanel: ${await panel.textContent()}`)
    return true
  }
  console.log(`[${label}] click(${x},${y}) -> InfoPanelなし`)
  return false
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

// depth=0: 皮膚レイヤーの胴体をクリック
await page.goto(`${BASE}/?depth=0`)
await page.waitForTimeout(3000)
const hit0 = await clickAndReport(page, 'depth=0 胴体', 640, 380)

// ×ボタンで閉じる
if (hit0) {
  await page.click('.info-panel .close')
  await page.waitForTimeout(300)
  const stillOpen = await page.locator('.info-panel').count()
  console.log(`[閉じる] ×クリック -> ${stillOpen === 0 ? 'パネルが閉じた' : 'パネルが残っている!'}`)
}

await page.screenshot({ path: '/tmp/be-click-d0.png' })

// depth=1: 内臓（心臓のあたり）をクリック
await page.goto(`${BASE}/?depth=1`)
await page.waitForTimeout(3000)
await clickAndReport(page, 'depth=1 心臓付近', 660, 240)
await page.screenshot({ path: '/tmp/be-click-d1.png' })

await browser.close()
