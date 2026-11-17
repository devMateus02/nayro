"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { revealOnView } from "@/lib/reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STORY_IMAGE = "/images/sobre-historia.webp";

/** A nossa história: foto à esquerda (abre como uma cortina) e o texto à direita */
export default function Historia() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Paralaxe leve da foto dentro da moldura
        gsap.fromTo(
          "[data-hs-photo]",
          { yPercent: -6 },
          { yPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );

        const tl = gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
          .fromTo(
            "[data-hs-frame]",
            { clipPath: "inset(0% 100% 0% 0% round 24px)" },
            { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.4, ease: "expo.inOut" },
            0,
          )
          .fromTo("[data-hs-zoom]", { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0.2)
          .fromTo("[data-hs-eyebrow]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0 }, 0.4)
          .fromTo(
            "[data-hs-line]",
            { autoAlpha: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.12 },
            0.5,
          )
          .fromTo("[data-hs-text]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0 }, 0.85);
        revealOnView(tl, el, { start: "top 70%", end: "bottom 25%" });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="px-6 py-20 md:px-12 lg:px-[6%] lg:py-28">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-[5vw]">
        <div
          data-hs-frame
          className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-violeta/40 shadow-[0_0_60px_rgba(112,41,217,0.18)]"
        >
          <div data-hs-photo className="absolute -inset-y-[8%] inset-x-0">
            <div data-hs-zoom className="relative size-full">
              <Image
                src={STORY_IMAGE}
                alt="Monitor com código em um escritório iluminado em roxo"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div>
          <p data-hs-eyebrow className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]">
            A nossa história
          </p>
          <h2 className="mt-4 font-poppins text-[clamp(32px,3.2vw,56px)] font-semibold leading-[1.1] tracking-[-0.02em] text-branco">
            <span data-hs-line className="block">
              Mais que tecnologia,{" "}
            </span>
            <span data-hs-line className="block text-roxo-luminoso">
              soluções para pessoas.
            </span>
          </h2>
          <p data-hs-text className="mt-7 max-w-[52ch] text-base leading-relaxed text-branco/75 lg:text-[clamp(16px,1.15vw,19px)]">
            A NAYRO nasceu da paixão por tecnologia e do desejo de ajudar negócios a crescerem no digital. Acreditamos que cada projeto é
            único, e por isso unimos estratégia, design e desenvolvimento para criar soluções funcionais, modernas e alinhadas aos objetivos
            de cada cliente.
          </p>
        </div>
      </div>
    </section>
  );
}
