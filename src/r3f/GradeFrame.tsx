import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import gradeFrag from "../glsl/grade.frag?raw";
import { REDUCE } from "../lib/motion";

const VERT = `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`;

function Plate({ reveal }: { reveal: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uReveal: { value: reveal },
      uAnimate: { value: REDUCE ? 0 : 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useFrame((_, dt) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value += REDUCE ? 0 : dt;
    m.uniforms.uRes.value.set(size.width, size.height);
    m.uniforms.uReveal.value += (reveal - m.uniforms.uReveal.value) * Math.min(1, dt * 18);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={gradeFrag} uniforms={uniforms} />
    </mesh>
  );
}

export default function GradeFrame({ reveal }: { reveal: number }) {
  return (
    <div className="grade__layer">
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        frameloop="always"
        camera={{ position: [0, 0, 1] }}
      >
        <Plate reveal={reveal} />
        <EffectComposer enabled={!REDUCE}>
          <Bloom intensity={0.32} luminanceThreshold={0.72} luminanceSmoothing={0.4} mipmapBlur />
          <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.05} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
