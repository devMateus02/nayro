"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { WHATSAPP_URL } from "@/lib/contact";
import { revealOnView } from "@/lib/reveal";
import { ArrowRight } from "./icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Paredes de neon (viewBox 900×620): da mais distante (esquerda, menor) à mais próxima (direita, maior)
const walls = [
  { x: 70, top: 400, bottom: 548, topRight: 300, r: 22 },
  { x: 250, top: 300, bottom: 572, topRight: 190, r: 30 },
  { x: 480, top: 168, bottom: 606, topRight: 0, r: 40 },
];
// Inclinação do piso (a base das paredes desce para a direita, em perspectiva)
const FLOOR_SLOPE = 0.11;

type Wall = (typeof walls)[number];

/** Borda iluminada: lateral esquerda + canto arredondado + topo subindo até a direita */
function wallEdge({ x, top, bottom, topRight, r }: Wall) {
  const slope = (top - topRight) / (900 - x);
  return `M${x} ${bottom} L${x} ${top + r} Q${x} ${top} ${x + r} ${top - slope * r} L900 ${topRight}`;
}

/** Painel de vidro da parede como polígono em % (o canto arredondado é aproximado por pontos) */
function wallGlass({ x, top, bottom, topRight, r }: Wall) {
  const slope = (top - topRight) / (900 - x);
  const p0 = [x, top + r];
  const c = [x, top];
  const p2 = [x + r, top - slope * r];
  const corner = [0.25, 0.5, 0.75].map((t) => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t ** 2 * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t ** 2 * p2[1],
  ]);
  const points = [[x, bottom], p0, ...corner, p2, [900, topRight], [900, bottom + (900 - x) * FLOOR_SLOPE]];
  return `polygon(${points.map(([px, py]) => `${((px / 900) * 100).toFixed(2)}% ${((py / 620) * 100).toFixed(2)}%`).join(", ")})`;
}

/**
 * Cena das paredes de neon. Camadas intercaladas por parede (da mais distante à mais próxima):
 * vidro fosco da parede → linhas dela. Assim o vidro de cada parede desfoca as luzes das paredes de trás.
 */
function NeonWalls() {
  return (
    <div className="relative size-full" aria-hidden>
      {/* Brilho no piso */}
      <svg viewBox="0 0 900 620" fill="none" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id="cta-floor" cx="0.55" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#7029d9" stopOpacity="0.35" />
            <stop offset="1" stopColor="#7029d9" stopOpacity="0" />
          </radialGradient>
          <filter id="cta-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <linearGradient id="cta-edge" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#7029d9" />
            <stop offset="0.35" stopColor="#d9c7ff" />
            <stop offset="1" stopColor="#a45bff" />
          </linearGradient>
          <linearGradient id="cta-reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a45bff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#a45bff" stopOpacity="0" />
          </linearGradient>
          <filter id="cta-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="cta-led" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <ellipse cx="560" cy="600" rx="420" ry="60" fill="url(#cta-floor)" filter="url(#cta-soft)" />
        {/* Luz atrás das paredes: o vidro fosco a desfoca (fora dos painéis ela fica nítida) */}
        <ellipse cx="700" cy="330" rx="230" ry="200" fill="#7029d9" fillOpacity="0.28" filter="url(#cta-soft)" />
        <g stroke="#d9c7ff" strokeLinecap="round">
          <path d="M900 60 L520 620" strokeWidth="2" strokeOpacity="0.55" />
          <path d="M900 170 L640 620" strokeWidth="1.4" strokeOpacity="0.4" />
          <path d="M860 0 L380 620" strokeWidth="1.2" strokeOpacity="0.3" />
          <path d="M900 330 L780 620" strokeWidth="3" strokeOpacity="0.35" />
        </g>
      </svg>

      {walls.map((w, i) => {
        const edge = wallEdge(w);
        return (
          <div key={w.x} data-cta-wall className="absolute inset-0">
            {/* Vidro fosco: desfoca o que está atrás (as paredes mais distantes) */}
            <div
              className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.08),rgba(164,91,255,0.08)_30%,rgba(20,12,36,0.35)_65%,rgba(8,7,13,0.55))] backdrop-blur-xl"
              style={{ clipPath: wallGlass(w) }}
            />
            <svg viewBox="0 0 900 620" fill="none" className="absolute inset-0 size-full">
              {/* Reflexo da borda no piso */}
              <rect x={w.x - 3} y={w.bottom} width="6" height="70" fill="url(#cta-reflect)" filter="url(#cta-glow)" />
              {/* Halo pulsando + traço nítido da borda */}
              <path
                d={edge}
                stroke="#a45bff"
                strokeWidth="10"
                strokeOpacity="0.5"
                filter="url(#cta-glow)"
                className="animate-neon-pulse"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
              <path d={edge} stroke="url(#cta-edge)" strokeWidth="2" strokeLinecap="round" />
              {/* Pontos de LED correndo pela borda em loop (período 12.5 de 100: emenda perfeita) */}
              {[
                { width: 7, color: "#c48dff", opacity: 0.8, filter: "url(#cta-led)" },
                { width: 3, color: "#f7f5fa", opacity: 1, filter: undefined },
              ].map((led) => (
                <path
                  key={led.width}
                  d={edge}
                  pathLength={100}
                  stroke={led.color}
                  strokeOpacity={led.opacity}
                  strokeWidth={led.width}
                  strokeLinecap="round"
                  strokeDasharray="0.01 12.49"
                  filter={led.filter}
                  className="animate-neon-run"
                  style={{ animationDelay: `${-i * 1.7}s` }}
                />
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export default function Cta() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo("[data-cta-wall]", { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 1.2, stagger: 0.15 }, 0)
          .fromTo("[data-cta-text]", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.15);
        if (section.current) revealOnView(tl, section.current);
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="contato"
      className="relative isolate flex items-center overflow-hidden bg-[#0b0a10] px-5 py-24 md:px-8 lg:min-h-svh lg:px-12 lg:py-0"
    >
      {/* Fundo: brilho quente no topo e as paredes de neon à direita */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-[20%] left-[10%] h-[45%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgba(158,97,56,0.18),transparent)] blur-2xl" />
        <div className="absolute right-0 top-1/2 aspect-[900/620] w-[150vw] -translate-y-1/2 opacity-50 sm:w-[90vw] lg:right-[-2%] lg:w-[62vw] lg:opacity-100">
          <NeonWalls />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0a10] via-[#0b0a10]/70 to-transparent lg:via-[#0b0a10]/20" />
        {/* Dissolve a base do piso no fundo */}
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#0b0a10] to-transparent" />
      </div>

      <div className="w-full">
        <p data-cta-text className="font-poppins text-[11px] font-medium uppercase tracking-[0.3em] text-roxo-luminoso lg:text-[clamp(11px,0.8vw,13px)]">
          Vamos conversar
        </p>
        <h2
          data-cta-text
          className="mt-3 max-w-[13ch] font-poppins text-[clamp(30px,3.3vw,60px)] font-semibold leading-[1.05] tracking-[-0.03em] text-branco"
        >
          Sua próxima grande ideia começa com <span className="text-roxo-luminoso">uma conversa.</span>
        </h2>
        <p
          data-cta-text
          className="mt-6 max-w-[40ch] border-l-2 border-roxo-luminoso pl-4 text-[15px] leading-relaxed text-branco/85 lg:text-[clamp(14px,1vw,17px)]"
        >
          Tem um projeto em mente? Vamos entender seus objetivos e encontrar a solução tecnológica ideal para transformar sua ideia em realidade.
        </p>
        <div data-cta-text className="mt-8 flex flex-wrap items-center gap-5 lg:gap-6">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full border-[1.5px] border-roxo-luminoso bg-roxo-escuro/40 px-5 py-2.5 font-poppins text-sm font-medium text-branco shadow-[0_0_24px_rgba(164,91,255,0.35)] transition hover:bg-roxo-escuro/80 hover:shadow-[0_0_36px_rgba(164,91,255,0.55)]"
          >
            Vamos conversar
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
          <span aria-hidden className="hidden h-8 w-px bg-branco/25 sm:block" />
          <p className="text-[13px] leading-relaxed text-branco/70">
            Sem compromisso.
            {" "}<br />
            Conte-nos o que você precisa.
          </p>
        </div>
      </div>
    </section>
  );
}
