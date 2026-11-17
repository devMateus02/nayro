"use client";

import { useEffect, useRef } from "react";

const SIZE = 0;

/** Luz branca suave que segue o mouse sobre o fundo da Hero (abaixo dos escurecimentos e do conteúdo) */
export default function HeroLight({ sectionId }: { sectionId: string }) {
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = light.current;
    const section = document.getElementById(sectionId);
    // Só faz sentido com mouse; em telas de toque a luz fica desligada
    if (!el || !section || !window.matchMedia("(pointer: fine)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reduced ? 1 : 0.12;
    let targetX = section.clientWidth / 2;
    let targetY = section.clientHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;

    // Segue o cursor com um leve atraso; o loop para sozinho quando a luz alcança o mouse
    const tick = () => {
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      el.style.transform = `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      el.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [sectionId]);

  return (
    <div
      ref={light}
      aria-hidden
      style={{ width: SIZE, height: SIZE }}
      className="pointer-events-none absolute left-0 top-0 -z-20 rounded-full opacity-0 mix-blend-screen transition-opacity duration-700 will-change-transform bg-[radial-gradient(circle,rgba(255,255,255,0.16)_0%,rgba(247,245,250,0.06)_45%,transparent_78%)]"
    />
  );
}
