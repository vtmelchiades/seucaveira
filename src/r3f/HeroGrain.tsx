import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { damp2 } from "maath/easing";
import grainFrag from "../glsl/grain.frag?raw";
import { REDUCE } from "../lib/motion";

const VERT = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

function Field({ grain }: { grain: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const target = useRef(new THREE.Vector2(0.5, 0.5));
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uGrain: { value: grain },
    }),
    [grain],
  );

  useFrame((_, dt) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value += REDUCE ? 0 : dt;
    m.uniforms.uRes.value.set(size.width, size.height);
    const pt = readPointer();
    target.current.set(pt.mx, pt.my);
    damp2(mouse.current, target.current, 0.12, dt);
    m.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
    m.uniforms.uScroll.value = readPointer().scroll;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={grainFrag}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

function readPointer() {
  const y = window.scrollY || 0;
  const vh = Math.max(1, window.innerHeight);
  return {
    mx: window.__pointer?.x ?? 0.5,
    my: window.__pointer?.y ?? 0.5,
    scroll: Math.min(1, y / (vh * 1.05)),
  };
}

declare global {
  interface Window {
    __pointer?: { x: number; y: number };
  }
}

/** Fixed full-viewport grain field behind everything (hero band). */
export default function HeroGrain() {
  return (
    <Canvas
      gl={{ antialias: false, powerPreference: "low-power", failIfMajorPerformanceCaveat: false }}
      dpr={[1, 1.5]}
      frameloop="always"
      camera={{ position: [0, 0, 1] }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#0a0a0a"), 1);
      }}
    >
      <Field grain={1} />
      <EffectComposer enabled={!REDUCE}>
        <Vignette eskil={false} offset={0.28} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
}
