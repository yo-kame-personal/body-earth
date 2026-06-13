// 生glb(高ポリ)を軽量化＋Draco圧縮して public/models/ に出力する
// 使い方: node scripts/optimize-model.mjs <input.glb> <output-name> [--ratio 0.15]
//   例:  node scripts/optimize-model.mjs assets-src/arthrology.glb skeleton --ratio 0.12
// 依存: @gltf-transform/cli（devDependency）。未導入なら npm i -D した上で実行
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [, , input, name, ...rest] = process.argv

if (!input || !name) {
  console.error('使い方: node scripts/optimize-model.mjs <input.glb> <output-name> [--ratio 0.15]')
  process.exit(1)
}

// simplifyの目標比率（残す割合）。小さいほど軽い。既定0.15（=85%削減）
const ratioIdx = rest.indexOf('--ratio')
const ratio = ratioIdx >= 0 ? Number(rest[ratioIdx + 1]) : 0.15

const inPath = resolve(root, input)
const outDir = resolve(root, 'public/models')
const outPath = resolve(outDir, `${name}.glb`)
mkdirSync(outDir, { recursive: true })

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2)
console.log(`入力: ${input}（${mb(inPath)} MB）`)

// 1) spec/gloss → metal/rough 変換。
//    Z-AnatomyのglbはKHR_materials_pbrSpecularGlossinessを使うが、three r184は
//    この拡張を非対応（マテリアルが正しく解釈されず警告が出る）。先に変換しておく。
const tmpPath = resolve(outDir, `.${name}.metalrough.glb`)
console.log('metal/rough変換中...')
execFileSync(
  'npx',
  ['--yes', '@gltf-transform/cli', 'metalrough', inPath, tmpPath],
  { stdio: 'inherit', cwd: root },
)

// 2) optimize: weld+join+simplify(meshopt)+texture圧縮+draco を一括
execFileSync(
  'npx',
  [
    '--yes',
    '@gltf-transform/cli',
    'optimize',
    tmpPath,
    outPath,
    '--simplify',
    'true',
    '--simplify-error',
    '0.001',
    '--simplify-ratio',
    String(ratio),
    '--compress',
    'draco',
    '--texture-compress',
    'webp',
  ],
  { stdio: 'inherit', cwd: root },
)

rmSync(tmpPath, { force: true })

console.log(`\n出力: public/models/${name}.glb（${mb(outPath)} MB）`)
console.log('※ three.js側は DRACOLoader のデコーダ設定が必要（ModelLayerで対応済み）')
