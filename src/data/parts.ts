import type { LayerId } from '../lib/depth'

export interface PartInfo {
  name: string
  layer: LayerId
  layerLabel: string
  summary: string
  fact: string
}

// ※ MVP用のダミーデータ。将来はAPIや本格的なデータソースに置き換える
export const PARTS: Record<string, PartInfo> = {
  'skin-head': {
    name: '頭部の皮膚',
    layer: 'skin',
    layerLabel: '皮膚',
    summary: '顔や頭皮を覆う皮膚。表情の動きに追従しながら、外部の刺激から頭部を守っている。',
    fact: 'まぶたの皮膚は約0.6mmと、体の中で特に薄い部位のひとつ。',
  },
  'skin-torso': {
    name: '胴体の皮膚',
    layer: 'skin',
    layerLabel: '皮膚',
    summary: '体幹を覆う皮膚。体温調節・水分保持・外部刺激からの保護を担う。',
    fact: '皮膚は人体最大の臓器で、成人では総面積が約1.6〜1.8㎡になる。',
  },
  'skin-arm': {
    name: '腕の皮膚',
    layer: 'skin',
    layerLabel: '皮膚',
    summary: '腕を覆う皮膚。日光に当たりやすく、紫外線への防御反応が活発な部位。',
    fact: '手のひら側の皮膚には毛が生えず、代わりに隆線（指紋など）が発達している。',
  },
  'skin-leg': {
    name: '脚の皮膚',
    layer: 'skin',
    layerLabel: '皮膚',
    summary: '脚部を覆う皮膚。体重を支える足裏に向かうほど厚く丈夫になる。',
    fact: 'かかとの皮膚は最も厚く、約4mmに達することがある。',
  },
  'muscle-face': {
    name: '表情筋',
    layer: 'muscle',
    layerLabel: '筋肉',
    summary: '顔の細かな表情を作り出す筋肉群。皮膚に直接付着しているのが特徴。',
    fact: '人間の表情は30種類以上の筋肉の組み合わせで作られる。',
  },
  'muscle-chest': {
    name: '大胸筋',
    layer: 'muscle',
    layerLabel: '筋肉',
    summary: '胸部の大きな筋肉。腕を前に押し出す動作の主役。',
    fact: '腕立て伏せやベンチプレスで主に鍛えられるのがこの筋肉。',
  },
  'muscle-abs': {
    name: '腹直筋',
    layer: 'muscle',
    layerLabel: '筋肉',
    summary: 'お腹の前面を縦に走る筋肉。体を前に曲げる動作と内臓の保護を担う。',
    fact: 'いわゆる「シックスパック」は、腱画というスジで区切られた腹直筋の形。',
  },
  'muscle-torso': {
    name: '体幹の筋肉群',
    layer: 'muscle',
    layerLabel: '筋肉',
    summary: '姿勢の維持や呼吸を支える、胴体のインナーマッスルを含む筋肉群。',
    fact: '立っている間、背中側の脊柱起立筋はほぼ休みなく働き続けている。',
  },
  'muscle-arm': {
    name: '上腕二頭筋',
    layer: 'muscle',
    layerLabel: '筋肉',
    summary: '「力こぶ」を作る筋肉。肘を曲げる動作の主役。',
    fact: '名前の通り2つの頭（起始部）を持ち、肩甲骨から始まっている。',
  },
  'muscle-leg': {
    name: '大腿四頭筋',
    layer: 'muscle',
    layerLabel: '筋肉',
    summary: '太ももの前面にある、人体で最も体積の大きい筋肉のひとつ。',
    fact: '立つ・歩く・走る・跳ぶ、すべての基本動作の要となる筋肉。',
  },
  'bone-skull': {
    name: '頭蓋骨',
    layer: 'core',
    layerLabel: '骨格',
    summary: '脳を保護する骨の容器。顔の骨格も形づくる。',
    fact: '1枚の骨ではなく、20個以上の骨が縫合線で組み合わさってできている。',
  },
  'bone-spine': {
    name: '脊椎（背骨）',
    layer: 'core',
    layerLabel: '骨格',
    summary: '椎骨が積み重なってできた体の支柱。脊髄を保護している。',
    fact: 'S字カーブを描くことで、歩行時の衝撃を吸収するバネの役割を持つ。',
  },
  'bone-ribs': {
    name: '肋骨',
    layer: 'core',
    layerLabel: '骨格',
    summary: '心臓や肺をカゴのように囲んで守る骨。呼吸に合わせて動く。',
    fact: '左右12対・合計24本で胸郭を形成している。',
  },
  'bone-pelvis': {
    name: '骨盤',
    layer: 'core',
    layerLabel: '骨格',
    summary: '上半身の重さを受け止め、左右の脚に伝える土台となる骨。',
    fact: '男女で形が大きく異なり、骨から性別を推定できるほど。',
  },
  'bone-arm': {
    name: '腕の骨',
    layer: 'core',
    layerLabel: '骨格',
    summary: '上腕骨と前腕の2本の骨（橈骨・尺骨）からなる。',
    fact: '前腕の2本の骨がねじれるように動くことで、手のひらを返せる。',
  },
  'bone-leg': {
    name: '大腿骨',
    layer: 'core',
    layerLabel: '骨格',
    summary: '人体で最も長く、最も強い骨。股関節と膝をつなぐ。',
    fact: '縦方向には体重の数倍の荷重に耐えられる強度を持つ。',
  },
  'organ-heart': {
    name: '心臓',
    layer: 'core',
    layerLabel: '内臓',
    summary: '全身に血液を送り出すポンプ。1日に約10万回拍動する。',
    fact: '1日に送り出す血液は約7,000リットルにもなる。',
  },
  'organ-lung': {
    name: '肺',
    layer: 'core',
    layerLabel: '内臓',
    summary: '酸素を取り込み二酸化炭素を排出する呼吸の中枢。',
    fact: '左肺は心臓のスペースを空けるため、右肺より少し小さい。',
  },
  'organ-stomach': {
    name: '胃',
    layer: 'core',
    layerLabel: '内臓',
    summary: '食べ物を胃酸と蠕動運動で消化する袋状の臓器。',
    fact: '強酸性の胃酸を出すが、粘液のバリアで自分自身は溶かされない。',
  },
  'organ-liver': {
    name: '肝臓',
    layer: 'core',
    layerLabel: '内臓',
    summary: '栄養の貯蔵・解毒・胆汁の生成などを担う「体内の化学工場」。',
    fact: '500種類以上の化学反応を処理し、再生能力も非常に高い。',
  },
  'organ-gut': {
    name: '腸',
    layer: 'core',
    layerLabel: '内臓',
    summary: '栄養と水分を吸収する消化の最終ステージ。免疫の中心地でもある。',
    fact: '小腸を広げるとテニスコートの半分ほどの表面積になるといわれる。',
  },
}
