"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { revealOnView } from "@/lib/reveal";
import { ChatIcon, CodeIcon, LayersIcon, RocketIcon } from "./icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Ícone de cada etapa, na ordem: conversa, planejamento, desenvolvimento e entrega
const ICONS = [ChatIcon, LayersIcon, CodeIcon, RocketIcon];

type ProcessProps = {
  eyebrow: string;
  title: ReactNode;
  steps: { title: string; text: string }[];
};

/** Etapas do trabalho: acendem uma a uma e a linha vai de uma para a outra, como o projeto avançando */
export default function Process({ eyebrow, title, steps }: ProcessProps) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.8 } })
          .fromTo("[data-pr-box]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, 0)
          .fromTo("[data-pr-head]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.12 }, 0.2)
          .fromTo(
            "[data-pr-divider]",
            { scaleY: 0, transformOrigin: "center top" },
            { scaleY: 1, duration: 0.9, ease: "power2.inOut" },
            0.3,
          );

        // Cada etapa: o ícone acende, o texto sobe e a linha segue até a próxima
        el.querySelectorAll("[data-pr-step]").forEach((step, i) => {
          const at = 0.55 + i * 0.42;
          tl.fromTo(
            step.querySelector("[data-pr-icon]"),
            { autoAlpha: 0, scale: 0.6 },
            { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(2)" },
            at,
          )
            .fromTo(step.querySelector("[data-pr-halo]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, at + 0.1)
            .fromTo(step.querySelectorAll("[data-pr-text]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.08 }, at + 0.15);
          const link = step.querySelector("[data-pr-link]");
          if (link) {
            tl.fromTo(link, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.45, ease: "power1.inOut" }, at + 0.2);
          }
        });

        revealOnView(tl, el, { start: "top 70%", end: "bottom 25%" });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="px-6 py-6 md:px-12 lg:px-[6%] lg:py-8">
      <div
        data-pr-box
        className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 rounded-3xl border border-branco/10 bg-[linear-gradient(160deg,rgba(33,16,57,0.3),rgba(11,10,16,0.85)_45%)] px-5 py-10 sm:px-7 sm:py-12 lg:px-[4.5%] lg:py-14 xl:grid-cols-[minmax(0,0.95fr)_auto_minmax(0,2.8fr)] xl:items-center xl:gap-[3vw]"
      >
        <div>
          <p data-pr-head className="font-poppins text-[12px] font-medium uppercase tracking-[0.3em] text-roxo-luminoso">
            {eyebrow}
          </p>
          <h2
            data-pr-head
            className="mt-4 font-poppins text-[clamp(26px,1.9vw,36px)] font-semibold leading-[1.2] tracking-[-0.015em] text-branco"
          >
            {title}
          </h2>
        </div>

        <span data-pr-divider aria-hidden className="hidden w-px self-stretch bg-branco/10 xl:block" />

        <ol className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {steps.map(({ title, text }, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
            <li key={title} data-pr-step className="relative flex flex-col items-center px-2 text-center">
              {/* Linha até a próxima etapa (do lado do ícone até o ícone seguinte) */}
              {i < steps.length - 1 && (
                <span
                  data-pr-link
                  aria-hidden
                  className="absolute left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] top-7 hidden h-px bg-roxo-luminoso/80 shadow-[0_0_8px_rgba(164,91,255,0.6)] lg:block"
                />
              )}
              <span data-pr-icon className="relative flex size-14 items-center justify-center">
                <span
                  data-pr-halo
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-violeta/30 shadow-[0_0_28px_rgba(112,41,217,0.55)] blur-[2px]"
                />
                <span className="relative flex size-full items-center justify-center rounded-full border border-violeta/70 bg-roxo-escuro/80 text-lavanda">
                  <Icon className="size-6" />
                </span>
              </span>
              <h3 data-pr-text className="mt-4 font-poppins text-[14px] font-medium text-branco sm:mt-5 sm:text-[15px] lg:whitespace-nowrap">
                {String(i + 1).padStart(2, "0")}. {title}
              </h3>
              <p data-pr-text className="mt-2 max-w-[22ch] text-[13px] leading-relaxed text-branco/60 lg:text-sm">
                {text}
              </p>
            </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
