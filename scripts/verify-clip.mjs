// 断面表示モードの検証: ?clip=1での描画とトグルボタン、回転時の断面
// 実行: node scripts/verify-clip.mjs（devサーバーが localhost:5173 で起動している前提）
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173/body-earth'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

// 1) clip=1 正面（前半分がクリップされ内部が見える）
await page.goto(`${BASE}/?depth=0.5&clip=1`)
await page.waitForTimeout(3000)
await page.screenshot({ path: '/tmp/be-clip-front.png' })
console.log(`[ボタン表示] ${await page.locator('.clip-toggle').textContent()}`)

// 2) ドラッグで回り込んで断面を斜め横から見る
await page.mouse.move(440, 400)
await page.mouse.down()
for (let i = 1; i <= 40; i++) {
  await page.mouse.move(440 + i * 16, 400, { steps: 1 })
  await page.waitForTimeout(16)
}
await page.mouse.up()
await page.waitForTimeout(1200)
await page.screenshot({ path: '/tmp/be-clip-side.png' })

// 3) トグルボタンでOFFに戻す→通常描画
await page.click('.clip-toggle')
await page.waitForTimeout(800)
console.log(`[トグル後] ${await page.locator('.clip-toggle').textContent()}`)
await page.screenshot({ path: '/tmp/be-clip-off.png' })

await browser.close()
console.log('スクショ: /tmp/be-clip-front.png, /tmp/be-clip-side.png, /tmp/be-clip-off.png')
