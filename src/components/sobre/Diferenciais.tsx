"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { DIFFERENTIALS } from "@/lib/content";
import { revealOnView } from "@/lib/reveal";
import { BoltIcon, HeadsetIcon, LayersIcon, RocketIcon, ShieldCheckIcon, UsersIcon } from "../icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ICONS = [RocketIcon, UsersIcon, LayersIcon, BoltIcon, HeadsetIcon, ShieldCheckIcon];
const items = DIFFERENTIALS.map((item, i) => ({ ...item, icon: ICONS[i] }));

// Duas fileiras de três, separadas por uma linha
const rows = [items.slice(0, 3), items.slice(3)];

/** Diferenciais: chamada à esquerda e seis diferenciais em duas fileiras à direita */
export default function Diferenciais() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
          .fromTo("[data-df-head]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.12 }, 0)
          .fromTo(
            "[data-df-rule]",
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1.2, ease: "power2.inOut" },
            0.3,
          )
          .fromTo("[data-df-divider]", { scaleY: 0, transformOrigin: "center top" }, { scaleY: 1, duration: 0.8, stagger: 0.08 }, 0.35)
          .fromTo("[data-df-item]", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.09 }, 0.3)
          .fromTo(
            "[data-df-icon]",
            { scale: 0.5, rotate: -12 },
            { scale: 1, rotate: 0, duration: 0.8, ease: "back.out(2.2)", stagger: 0.09 },
            0.35,
          );
        if (section.current) revealOnView(tl, section.current, { start: "top 70%", end: "bottom 25%" });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="px-6 py-16 md:px-12 lg:px-[6%] lg:py-20">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,2fr)] xl:items-center xl:gap-[4vw]">
        <div>
          <p data-df-head className="font-poppins text-[12px] font-medium uppercase tracking-[0.3em] text-roxo-luminoso">
            Por que escolher a NAYRO?
          </p>
          <h2 data-df-head className="mt-4 font-poppins text-[clamp(30px,2.5vw,46px)] font-semibold tracking-[-0.02em] text-branco">
            Nossos <span className="text-roxo-luminoso">diferenciais</span>
          </h2>
          <p data-df-head className="mt-5 max-w-[38ch] text-base leading-relaxed text-branco/75">
            Mais do que entregar um projeto, buscamos construir soluções duradouras e evolutivas para o seu negócio.
          </p>
        </div>

        <div>
          {rows.map((row, r) => (
            <div key={r}>
              {r > 0 && <span data-df-rule aria-hidden className="my-8 block h-px bg-branco/10 lg:my-10" />}
              <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-0">
                {row.map(({ title, text, icon: Icon }, i) => (
                  <li key={title} data-df-item className="group relative lg:px-[2.2vw] lg:first:pl-0">
                    {i > 0 && (
                      <span data-df-divider aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-branco/10 lg:block" />
                    )}
                    <span data-df-icon className="inline-block">
                      <Icon className="size-8 text-roxo-luminoso transition-[filter] duration-500 group-hover:drop-shadow-[0_0_10px_rgba(164,91,255,0.75)]" />
                    </span>
                    <h3 className="mt-4 font-poppins text-[17px] font-semibold text-branco">{title}</h3>
                    <p className="mt-2 max-w-[28ch] text-[14px] leading-relaxed text-branco/65">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
