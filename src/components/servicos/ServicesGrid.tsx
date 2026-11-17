"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { whatsappLink } from "@/lib/contact";
import { revealOnView } from "@/lib/reveal";
import type { Service } from "@/lib/services";
import { ArrowRight } from "../icons";
import ServiceIcon from "../ServiceIcon";
import { keepHyphens } from "@/lib/text";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Cartão de serviço: abre o WhatsApp já falando do serviço; uma luz suave segue o cursor por dentro */
function ServiceCard({ name: title, summary: text, icon }: Service) {
  return (
    <a
      data-sg-card
      href={whatsappLink(`Olá! Quero saber mais sobre ${title}.`)}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-branco/10 bg-[linear-gradient(160deg,rgba(33,16,57,0.35),rgba(14,12,21,0.6)_55%)] p-6 transition-[border-color,box-shadow] duration-500 hover:border-violeta/50 hover:shadow-[0_0_40px_rgba(112,41,217,0.16)] lg:p-7"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(280px circle at var(--x, 50%) var(--y, 50%), rgba(164,91,255,0.14), transparent 70%)" }}
      />
      <div className="relative flex-1">
        <span className="flex size-12 items-center justify-center rounded-xl border border-violeta/40 bg-[linear-gradient(140deg,rgba(112,41,217,0.45),rgba(33,16,57,0.6))] text-lavanda shadow-[0_0_18px_rgba(112,41,217,0.25)] transition-shadow duration-500 group-hover:shadow-[0_0_26px_rgba(164,91,255,0.45)]">
          <ServiceIcon icon={icon} className="size-6" />
        </span>
        <h3 className="mt-5 font-poppins text-lg font-semibold text-branco">{keepHyphens(title)}</h3>
        <p className="mt-1.5 max-w-[30ch] text-[15px] leading-relaxed text-branco/65">{text}</p>
      </div>
      <ArrowRight className="relative size-5 shrink-0 text-roxo-luminoso transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}

export default function ServicesGrid({ services }: { services: Service[] }) {
  const section = useRef<HTMLElement>(null);

  // Entrada: título linha a linha e os cartões subindo em sequência (desfaz ao sair)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
          .fromTo("[data-sg-head]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.12 }, 0)
          .fromTo(
            "[data-sg-card]",
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: { each: 0.08, grid: "auto", from: "start" } },
            0.35,
          );
        if (section.current) revealOnView(tl, section.current, { start: "top 70%", end: "bottom 25%" });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative isolate px-6 py-24 md:px-12 lg:px-[6%] lg:py-28">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[60%] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(112,41,217,0.12),transparent)]"
      />
      <div className="mx-auto max-w-[1600px]">
        <header className="mx-auto max-w-[620px] text-center">
          <p data-sg-head className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]">
            O que fazemos
          </p>
          <h2 data-sg-head className="mt-4 font-poppins text-[clamp(32px,3.2vw,52px)] font-semibold tracking-[-0.02em] text-branco">
            Nossos <span className="text-roxo-luminoso">serviços</span>
          </h2>
          <p data-sg-head className="mt-4 text-base leading-relaxed text-branco/70">
            Soluções completas para transformar a sua ideia em um produto digital eficiente, seguro e preparado para crescer.
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {services.map((s) => (
            <ServiceCard key={s.name} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
