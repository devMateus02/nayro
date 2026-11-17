"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { setLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Rolagem suave com Lenis, sincronizada com o GSAP:
 * o Lenis roda no mesmo relógio do GSAP e avisa o ScrollTrigger a cada quadro,
 * então seções fixadas, paralaxe e animações por rolagem acompanham sem descompasso.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Movimento reduzido: mantém a rolagem nativa
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
