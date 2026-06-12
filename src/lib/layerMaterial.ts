// レイヤー共通のマテリアル処理（BodyPart=プリミティブ と ModelLayer=glb で共有）
// - Fresnel縁発光: クロスフェード中(半透明)だけ縁が青白く光るホログラム表現
// - 断面表示: 世界座標z>0（体の前半分）をクリップする固定平面
import { Plane, Vector3 } from 'three'
import type { WebGLProgramParametersWithUniforms } from 'three'

// 断面モードで使う固定クリップ平面（前半分カット）
export const CLIP_PLANES = [new Plane(new Vector3(0, 0, -1), 0)]

// 半透明時(o≈0.5)に最大、完全表示/非表示(o=0/1)でゼロになる発光強度
export function rimStrength(opacity: number): number {
  return 4 * opacity * (1 - opacity) * 1.4
}

/**
 * meshStandardMaterialの onBeforeCompile に渡す注入関数を作る。
 * 注入テキストが全マテリアルで同一なのでGPUプログラムは共有され、
 * uniform(uRim)だけが各マテリアルで独立する。
 */
export function makeRimInjector(rimUniform: { value: number }) {
  return (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uRim = rimUniform
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        'uniform float uRim;\nconst vec3 RIM_COLOR = vec3(0.48, 0.84, 1.0);\nvoid main() {',
      )
      .replace(
        '#include <opaque_fragment>',
        [
          'float rimFresnel = pow( 1.0 - saturate( dot( normalize( vNormal ), normalize( vViewPosition ) ) ), 2.5 );',
          'outgoingLight += RIM_COLOR * rimFresnel * uRim;',
          // 裏面=断面モードで見える内壁。光が届かず真っ黒になるので色で底上げ
          'if ( ! gl_FrontFacing ) outgoingLight += diffuse * 0.45;',
          '#include <opaque_fragment>',
        ].join('\n'),
      )
  }
}
