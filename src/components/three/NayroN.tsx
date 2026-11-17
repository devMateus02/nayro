"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { isLightDevice } from "@/lib/device";
import { bakeMesh } from "./bakeGeometry";
import type { NMotionRef } from "./nMotion";

// Celular: versão leve do mesmo N (38 mil triângulos em vez de 127 mil, texturas de 1024px, 0,5 MB)
const N_MODEL_URL = isLightDevice() ? "/models/nayro-n-mobile.glb" : "/models/nayro-n.glb";
// Tamanho (maior dimensão) com que o N aparece na cena
const TARGET_SIZE = 2.6;

// Ruído simplex 3D (Ashima Arts / Stefan Gustavson, licença MIT)
const NOISE_GLSL = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

type Uniforms = {
  uTime: { value: number };
  uHover: { value: number };
  uReveal: { value: number };
  uPointer: { value: THREE.Vector2 };
};

// Rotação que coloca o N de frente para a câmera (o arquivo vem virado de lado)
const FRONT_ROTATION_Y = -Math.PI / 2;

// Fluxo de luz + fluido no hover, aplicado sobre o material original do modelo
function applyLightFlow(material: THREE.MeshStandardMaterial, uniforms: Uniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        uniform float uHover;
        uniform vec2 uPointer;
        varying vec3 vP;
        ${NOISE_GLSL}`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        // Fluido só na região do cursor; sem hover o ruído nem é calculado
        if (uHover > 0.011) {
          float t = uTime;
          vec3 p = position;
          float d = distance(p.xy, uPointer);
          float falloff = exp(-d * d * 9.0) * uHover;
          if (falloff > 0.002) {
            vec3 q = p * 2.4;
            vec3 disp = 0.025 * vec3(
              snoise(q + vec3(t * 0.6, 0.0, 0.0)),
              snoise(q + vec3(0.0, t * 0.6, 7.3)),
              snoise(q + vec3(3.1, 0.0, t * 0.6))
            );
            disp.z += sin(d * 14.0 - t * 5.0) * 0.02;
            transformed += disp * falloff;
          }
        }
        vP = position;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        uniform float uHover;
        uniform float uReveal;
        uniform vec2 uPointer;
        varying vec3 vP;
        ${NOISE_GLSL}`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        // Entrada: o N é revelado por uma frente de luz da esquerda para a direita
        if (uReveal < 1.0) {
          float front = mix(-1.8, 2.0, uReveal) + snoise(vP * 3.0 + uTime * 0.5) * 0.12;
          if (vP.x + vP.y * 0.25 > front) discard;
        }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          float t = uTime;
          vec3 violet = vec3(0.44, 0.16, 0.85);
          vec3 lavender = vec3(0.85, 0.75, 1.0);
          float n = snoise(vP * 1.6 + vec3(0.0, 0.0, t * 0.25));

          // Feixe principal varrendo o N para lá e para cá
          float sweepX = sin(t * 0.7) * 1.5;
          float sweep = exp(-pow((vP.x + vP.y * 0.35 + n * 0.15 - sweepX) * 2.6, 2.0));

          // Filetes de luz correndo ao longo da fita
          float speed = 1.4;
          float threads = pow(0.5 + 0.5 * sin(vP.x * 5.0 - vP.y * 3.5 + n * 3.0 - t * speed), 10.0);
          float threads2 = pow(0.5 + 0.5 * sin(vP.x * -3.2 - vP.y * 6.0 + n * 2.0 + t * speed * 0.8), 14.0);

          // Brilho de borda (fresnel)
          float fr = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.4);

          // Halo de luz sob o cursor no hover
          float dp = distance(vP.xy, uPointer);
          float glowPtr = exp(-dp * dp * 9.0) * uHover;

          // Só luz somada por cima, em tons de violeta: as cores originais ficam intactas
          vec3 light = mix(violet, lavender, sweep) * sweep * 0.3
            + violet * (threads * 0.14 + threads2 * 0.1)
            + violet * fr * 0.22
            + lavender * glowPtr * 0.18;

          // Borda incandescente da frente de revelação (só durante a entrada)
          if (uReveal < 1.0) {
            float front = mix(-1.8, 2.0, uReveal) + snoise(vP * 3.0 + uTime * 0.5) * 0.12;
            float edge = smoothstep(0.35, 0.0, front - (vP.x + vP.y * 0.25)) * (1.0 - smoothstep(0.85, 1.0, uReveal));
            light += lavender * edge * 1.2;
          }

          totalEmissiveRadiance += light;
        }`,
      );
  };
  material.customProgramCacheKey = () => "nayro-light-flow";
  material.needsUpdate = true;
}

export function NayroN({ reducedMotion, motion, onReady }: { reducedMotion: boolean; motion?: NMotionRef; onReady?: () => void }) {
  const { scene } = useGLTF(N_MODEL_URL, false, true);
  const { gl, camera, scene: stage } = useThree();
  const [compiled, setCompiled] = useState(false);
  const group = useRef<THREE.Group>(null);
  const modelGroup = useRef<THREE.Group>(null);
  const hoverTarget = useRef(0);
  const pointerTarget = useRef(new THREE.Vector2(99, 99));

  // Coloca o N de frente, centralizado e no tamanho da cena, direto na geometria:
  // assim o espaço do objeto é o espaço da tela e os efeitos ficam alinhados
  const model = useMemo(() => {
    const root = scene.clone(true);
    const uniforms: Uniforms = {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uReveal: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
    };
    let size = new THREE.Vector3(1, 1, 1);

    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const box = bakeMesh(mesh, { rotationY: FRONT_ROTATION_Y, size: TARGET_SIZE });
      size = box.getSize(new THREE.Vector3());

      const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
      mat.envMapIntensity = 1;
      applyLightFlow(mat, uniforms);
      mesh.material = mat;
    });

    root.userData.uniforms = uniforms;
    const hitArea: [number, number] = [size.x * 1.1, size.y * 1.1];
    return { root, hitArea };
  }, [scene]);

  // Compila os shaders em segundo plano antes de mostrar o N: a página não trava enquanto a GPU prepara o material
  useEffect(() => {
    let alive = true;
    gl.compileAsync(model.root, camera, stage)
      .catch(() => {})
      .finally(() => {
        if (!alive) return;
        setCompiled(true);
        onReady?.();
      });
    return () => {
      alive = false;
    };
  }, [gl, camera, stage, model, onReady]);

  useFrame((state, delta) => {
    if (!compiled) return;
    const t = state.clock.elapsedTime;
    const uniforms = modelGroup.current?.children[0]?.userData.uniforms as Uniforms | undefined;
    if (!uniforms) return;
    // Movimento reduzido: sem entrada animada e com a luz parada
    if (reducedMotion) {
      uniforms.uReveal.value = 1;
      return;
    }
    uniforms.uTime.value = t;
    uniforms.uReveal.value = Math.min(1, uniforms.uReveal.value + delta / 2.2);
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hoverTarget.current, 3.5, delta);
    uniforms.uPointer.value.lerp(pointerTarget.current, 1 - Math.exp(-6 * delta));

    // De frente na Hero (só flutua); gira levemente ao viajar para a seção de serviços
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.8) * 0.05;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, motion?.current.rotationY ?? 0, 6, delta);
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const local = e.object.worldToLocal(e.point.clone());
    pointerTarget.current.set(local.x, local.y);
  };

  return (
    <group ref={group}>
      <group ref={modelGroup}>{compiled && <primitive object={model.root} />}</group>
      {/* Área de hover leve: evita raycast nas centenas de milhares de triângulos do modelo */}
      <mesh
        onPointerOver={(e) => {
          hoverTarget.current = 1;
          onMove(e);
          document.body.style.cursor = "pointer";
        }}
        onPointerMove={onMove}
        onPointerOut={() => {
          hoverTarget.current = 0;
          pointerTarget.current.set(99, 99);
          document.body.style.cursor = "";
        }}
      >
        <planeGeometry args={model.hitArea} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

useGLTF.preload(N_MODEL_URL, false, true);
