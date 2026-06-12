// スライダー→カメラ距離イージングと、ホイール→depth同期の検証
// 実行: node scripts/verify-easing.mjs（devサーバーが localhost:5173 で起動している前提）
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

const label = () => page.locator('.hud-status, body').first().textContent()
const depthText = async () => {
  const t = await page.textContent('body')
  const m = t.match(/深度 (\d+)%/)
  return m ? Number(m[1]) : null
}

// 1) スライダーを0→100に動かし、中間と収束後でdepth表示を比較
await page.goto(`${BASE}/?depth=0`)
await page.waitForTimeout(3000)
const slider = page.locator('input[type="range"]')
await slider.fill('1') // depth=1相当へ
await page.waitForTimeout(250)
const mid = await depthText()
await page.screenshot({ path: '/tmp/be-ease-mid.png' })
await page.waitForTimeout(2000)
const end = await depthText()
await page.screenshot({ path: '/tmp/be-ease-end.png' })
console.log(`[スライダー] 250ms後: 深度${mid}% / 収束後: 深度${end}%`)
console.log(
  mid !== null && end !== null && mid > 0 && mid < 95 && end >= 99
    ? '  -> OK: 中間値を経由して滑らかに収束（イージング動作）'
    : '  -> NG: イージングが効いていない可能性',
)

// 2) ホイールズームでdepthが増えるか（双方向同期の回帰確認）
await page.goto(`${BASE}/?depth=0`)
await page.waitForTimeout(3000)
await page.mouse.move(640, 400)
for (let i = 0; i < 5; i++) {
  await page.mouse.wheel(0, -240)
  await page.waitForTimeout(120)
}
await page.waitForTimeout(1500)
const afterWheel = await depthText()
console.log(`[ホイール] ズームイン後: 深度${afterWheel}%`)
console.log(afterWheel > 5 ? '  -> OK: ホイール→depth同期は維持' : '  -> NG: 同期が壊れている')

await browser.close()
