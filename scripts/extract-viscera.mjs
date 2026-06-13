// splanchnology(骨格＋内臓の累積モデル)から、arthrology(骨格)と共通のメッシュを
// 除去して「内臓のみ」のglbを書き出す。Z-Anatomyの累積レイヤー構造への対処。
// （内臓学モデルには位置参照用に骨格が同梱されており、そのままだと骨格レイヤーを
//   フェードアウトしても骨が残ってしまうため取り除く）
// 使い方: node scripts/extract-viscera.mjs
//   → assets-src/viscera-only.glb を生成 → optimize-model.mjs で viscera.glb 化する
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { prune } from '@gltf-transform/functions'

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)

// メッシュの指紋: 頂点数 + バウンディングボックス（同一ジオメトリなら一致する）
function fingerprint(prim) {
  const pos = prim.getAttribute('POSITION')
  const n = pos.getCount()
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  const v = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    pos.getElement(i, v)
    for (let j = 0; j < 3; j++) {
      if (v[j] < min[j]) min[j] = v[j]
      if (v[j] > max[j]) max[j] = v[j]
    }
  }
  const r = (x) => x.toFixed(3)
  return `${n}|${min.map(r).join(',')}|${max.map(r).join(',')}`
}

const skel = await io.read('assets-src/arthrology.glb')
const skelPrints = new Set()
for (const mesh of skel.getRoot().listMeshes())
  for (const prim of mesh.listPrimitives()) skelPrints.add(fingerprint(prim))
console.log('骨格メッシュ指紋数:', skelPrints.size)

const visc = await io.read('assets-src/splanchnology.glb')
let removed = 0
let kept = 0
for (const mesh of visc.getRoot().listMeshes()) {
  for (const prim of [...mesh.listPrimitives()]) {
    if (skelPrints.has(fingerprint(prim))) {
      mesh.removePrimitive(prim)
      prim.dispose()
      removed++
    } else {
      kept++
    }
  }
}
console.log(`除去(骨格と共通): ${removed} / 残し(内臓のみ): ${kept}`)

// 空になったメッシュ・未使用ノードを掃除（optimizeのinstance失敗を防ぐ）
await visc.transform(prune())

await io.write('assets-src/viscera-only.glb', visc)
console.log('書き出し: assets-src/viscera-only.glb')
