"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { NayroN, useReducedMotion } from "./NayroN";
import type { NMotionRef } from "./nMotion";

/** Avisa quando o modelo terminou de carregar (fica dentro do mesmo Suspense) */
function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

export default function LogoN3D({ onReady, motion }: { onReady?: () => void; motion?: NMotionRef }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(1.5);
  const reducedMotion = useReducedMotion();

  // Pausa a renderização quando a Hero sai da tela
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const frameloop = !visible ? "never" : reducedMotion ? "demand" : "always";

  return (
    <div ref={wrapper} className="size-full">
      <Canvas
        dpr={dpr}
        frameloop={frameloop}
        camera={{ position: [0, 0, 5.4], fov: 35 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        {/* Baixa a resolução em aparelhos que não sustentam a taxa de quadros */}
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        {/* Luz neutra: preserva as cores originais da textura do modelo */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 5]} intensity={1.6} />
        <directionalLight position={[-3, -1, 3]} intensity={0.6} />
        <Suspense fallback={null}>
          <NayroN reducedMotion={reducedMotion} motion={motion} />
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={2} color="#ffffff" position={[-4, 1, 3]} scale={[3, 8, 1]} />
            <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[4, 2, 2]} scale={[2, 6, 1]} />
            <Lightformer form="ring" intensity={1} color="#ffffff" position={[0, -3, 3]} scale={4} />
            <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 5, -2]} scale={[8, 2, 1]} />
          </Environment>
          <Ready onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
