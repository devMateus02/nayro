"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import LogoN from "./LogoN";
import type { NMotion } from "./three/nMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Giro do N quando chega à seção de serviços (vista 3/4, como na referência)
const SERVICES_ROTATION = -0.35;

/**
 * O símbolo N é uma camada fixa única que viaja entre dois "encaixes":
 * [data-n-slot="hero"] (centro da Hero) e [data-n-slot="servicos"] (direita da seção de serviços).
 * A posição acompanha os encaixes em tempo real e é interpolada pela rolagem entre as seções.
 */
export default function FloatingN() {
  const layer = useRef<HTMLDivElement>(null);
  const motion = useRef<NMotion>({ rotationY: 0 });

  useGSAP(() => {
    const el = layer.current;
    const heroSlot = document.querySelector<HTMLElement>('[data-n-slot="hero"]');
    const servicesSlot = document.querySelector<HTMLElement>('[data-n-slot="servicos"]');
    if (!el || !heroSlot || !servicesSlot) return;

    // A camada tem tamanho fixo (o maior encaixe) e é escalada: assim o canvas não é redimensionado ao rolar
    let base = 1;
    const square = (r: DOMRect) => Math.min(r.width, r.height);
    const measure = () => {
      base = Math.max(square(heroSlot.getBoundingClientRect()), square(servicesSlot.getBoundingClientRect()), 1);
      el.style.width = `${base}px`;
      el.style.height = `${base}px`;
    };
    measure();

    const ease = gsap.parseEase("power2.inOut");
    let progress = 0;
    const trigger = ScrollTrigger.create({
      trigger: "#servicos",
      start: "top bottom",
      end: "top top",
      onUpdate: (self) => {
        progress = self.progress;
      },
      onRefresh: (self) => {
        progress = self.progress;
        measure();
      },
    });

    const place = () => {
      const a = heroSlot.getBoundingClientRect();
      const b = servicesSlot.getBoundingClientRect();
      const e = ease(progress);
      const size = gsap.utils.interpolate(square(a), square(b), e);
      const cx = gsap.utils.interpolate(a.left + a.width / 2, b.left + b.width / 2, e);
      const cy = gsap.utils.interpolate(a.top + a.height / 2, b.top + b.height / 2, e);
      el.style.transform = `translate3d(${cx - size / 2}px, ${cy - size / 2}px, 0) scale(${size / base})`;
      motion.current.rotationY = SERVICES_ROTATION * e;
    };
    gsap.ticker.add(place);

    return () => {
      gsap.ticker.remove(place);
      trigger.kill();
    };
  });

  return (
    <div
      ref={layer}
      className="pointer-events-auto fixed left-0 top-0 z-10 origin-top-left will-change-transform"
      style={{ width: 0, height: 0 }}
    >
      <div data-intro="logo" className="size-full">
        <LogoN motion={motion} />
      </div>
    </div>
  );
}
