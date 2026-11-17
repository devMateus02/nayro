"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef, useState } from "react";
import { revealOnView } from "@/lib/reveal";
import HeroWater from "./HeroWater";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const reasons = [
  {
    title: "Soluções sob medida",
    text: "Cada projeto é pensado de acordo com os objetivos e a realidade do seu negócio.",
  },
  {
    title: "Tecnologia com propósito",
    text: "Utilizamos a tecnologia para resolver problemas reais e criar oportunidades.",
  },
  {
    title: "Foco em performance",
    text: "Desenvolvemos experiências digitais rápidas, seguras e eficientes.",
  },
  {
    title: "Parceria de verdade",
    text: "Acompanhamos o seu projeto de ponta a ponta, com transparência e compromisso.",
  },
];

// Placa (imagem) de cada diferencial, na mesma ordem da lista
const plates = [
  "/images/solucaoSobeMedida.webp",
  "/images/tecnologiaComProposito.webp",
  "/images/performace.webp",
  "/images/parceria.webp",
];
// Tamanho do cartão do hover (16:9, mesma proporção das placas)
const THUMB_W = 224;
const THUMB_H = 126;

/**
 * Lista de diferenciais: número ao lado do título, descrição escondida.
 * No hover (ou toque) a descrição desliza para baixo do título e um cartão pequeno segue o cursor.
 */
function ReasonsList() {
  const list = useRef<HTMLOListElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [shown, setShown] = useState(0);

  useGSAP(
    () => {
      if (!thumb.current) return;
      follow.current = {
        x: gsap.quickTo(thumb.current, "x", { duration: 0.55, ease: "power3" }),
        y: gsap.quickTo(thumb.current, "y", { duration: 0.55, ease: "power3" }),
      };
    },
    { scope: list },
  );

  const openItem = (i: number) => {
    setOpen(i);
    setShown(i);
  };

  return (
    <ol
      ref={list}
      className="relative"
      onMouseLeave={() => setOpen(null)}
      onMouseMove={(e) => {
        const r = list.current?.getBoundingClientRect();
        if (!r || !follow.current) return;
        // Fica no espaço livre à direita da linha (antes do "+") para não cobrir o texto;
        // acompanha o cursor na vertical e só um pouco na horizontal (paralaxe)
        follow.current.x(r.width - THUMB_W - 36 + (e.clientX - r.left - r.width / 2) * 0.08);
        follow.current.y(e.clientY - r.top - THUMB_H / 2);
      }}
    >
      {/* Cartão que segue o cursor (só com mouse) */}
      <div
        ref={thumb}
        aria-hidden
        style={{ width: THUMB_W, height: THUMB_H }}
        className={`pointer-events-none absolute left-0 top-0 z-10 hidden transition-[opacity,scale] duration-300 ease-out [@media(pointer:fine)]:block ${
          open !== null ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        <div className="relative size-full -rotate-6 overflow-hidden rounded-2xl border border-branco/15 shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_30px_rgba(112,41,217,0.25)]">
          {plates.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes={`${THUMB_W * 2}px`}
              className={`object-cover transition-opacity duration-300 ${shown === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>

      {reasons.map((r, i) => {
        const isOpen = open === i;
        return (
          <li key={r.title} data-why-item className="relative" onMouseEnter={() => openItem(i)}>
            <button
              type="button"
              onClick={() => openItem(i)}
              onFocus={() => openItem(i)}
              aria-expanded={isOpen}
              className="grid w-full grid-cols-[3rem_1fr_auto] items-baseline py-6 text-left lg:grid-cols-[4.5rem_1fr_auto] lg:py-[3.4vh]"
            >
              <span className="font-poppins text-lg font-medium text-roxo-luminoso lg:text-[clamp(17px,1.4vw,24px)]">
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              <span
                className={`font-poppins text-lg font-semibold uppercase tracking-wide transition-colors lg:text-[clamp(16px,1.35vw,24px)] ${
                  isOpen ? "text-branco" : "text-branco/85"
                }`}
              >
                {r.title}
              </span>
              <span
                aria-hidden
                className={`text-xl leading-none text-roxo-luminoso transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            {/* Descrição: abre deslizando por baixo do título */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[34ch] pb-6 pl-12 text-[15px] leading-relaxed text-branco/75 lg:pb-[3vh] lg:pl-[4.5rem] lg:text-[clamp(14px,1.1vw,18px)]">
                  {r.text}
                </p>
              </div>
            </div>
            <span data-why-rule aria-hidden className="block h-px w-full bg-branco/40" />
          </li>
        );
      })}
    </ol>
  );
}

/** Cantoneira do selo (canto em L) */
function Corner({ className }: { className: string }) {
  return <span aria-hidden className={`absolute size-3.5 border-branco/70 ${className}`} />;
}

export default function WhyNayro() {
  const section = useRef<HTMLElement>(null);

  // Entrada: títulos se revelam linha a linha; diferenciais sobem com as linhas se desenhando
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(
            "[data-why-line]",
            { autoAlpha: 0, y: 50, clipPath: "inset(0% 0% 100% 0%)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1, ease: "expo.out", stagger: 0.12 },
            0,
          )
          .fromTo("[data-why-intro]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0.45)
          .fromTo("[data-why-item]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.3)
          .fromTo(
            "[data-why-rule]",
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1, ease: "power2.inOut", stagger: 0.12 },
            0.45,
          );
        if (section.current) revealOnView(tl, section.current);
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="sobre"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-[#0b0a10] px-6 py-24 md:px-12 lg:h-svh lg:px-[5.5%] lg:py-0"
    >
      {/* Fundo de reserva (sem WebGL ou com movimento reduzido): as mesmas manchas de luz, paradas */}
      <div
        aria-hidden
        className="absolute inset-0 -z-40 bg-[radial-gradient(40%_45%_at_12%_82%,rgba(112,41,217,0.32),transparent),radial-gradient(30%_30%_at_22%_8%,rgba(158,97,56,0.14),transparent),radial-gradient(30%_35%_at_86%_80%,rgba(153,87,56,0.16),transparent)]"
      />
      {/* Manchas de luz animadas (LED) + água que reage ao mouse */}
      <HeroWater
        sectionId="sobre"
        variant="leds"
        className="pointer-events-none absolute inset-0 -z-30 size-full opacity-0 transition-opacity duration-700"
      />

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1fr] lg:items-center lg:gap-[4vw]">
        {/* Coluna esquerda: título, texto e selo */}
        <div>
          <h2 className="font-poppins text-[clamp(34px,11vw,56px)] font-extrabold lg:text-[clamp(44px,5.2vw,96px)] uppercase leading-[0.95] tracking-[-0.02em]">
            <span data-why-line className="block text-transparent [-webkit-text-stroke:2px_#f7f5fa]">
              Por que{" "}
            </span>
            <span data-why-line className="block text-branco">
              Escolher a{" "}
            </span>
            <span
              data-why-line
              className="block text-transparent drop-shadow-[0_0_14px_rgba(164,91,255,0.45)] [-webkit-text-stroke:2px_#c48dff]"
            >
              Nayro
            </span>
          </h2>

          <p
            data-why-intro
            className="mt-8 max-w-[34ch] border-l-2 border-roxo-luminoso pl-5 text-base leading-relaxed text-branco/85 lg:mt-10 lg:text-[clamp(15px,1.25vw,21px)]"
          >
            Mais do que desenvolvimento, entregamos soluções digitais que geram resultado e impulsionam o seu negócio.
          </p>

          <div
            data-why-intro
            className="relative mt-10 inline-flex items-center gap-2.5 whitespace-nowrap px-5 py-3.5 font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-branco sm:gap-4 sm:px-8 sm:py-4 sm:text-[11px] sm:tracking-[0.25em] lg:mt-[7vh] lg:gap-5 lg:px-11 lg:text-[clamp(11px,0.85vw,14px)]"
          >
            <Corner className="left-0 top-0 border-l border-t" />
            <Corner className="right-0 top-0 border-r border-t" />
            <Corner className="bottom-0 left-0 border-b border-l" />
            <Corner className="bottom-0 right-0 border-b border-r" />
            Tecnologia <span className="text-roxo-luminoso">/</span> Estratégia <span className="text-roxo-luminoso">/</span> Resultado
          </div>
        </div>

        {/* Coluna direita: diferenciais numerados */}
        <ReasonsList />
      </div>
    </section>
  );
}
