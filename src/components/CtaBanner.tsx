"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { whatsappLink } from "@/lib/contact";
import { revealOnView } from "@/lib/reveal";
import { ArrowRight } from "./icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CtaBannerProps = {
  eyebrow: string;
  title: ReactNode;
  text: string;
  image?: string;
  imagePosition?: string;
  /** cover: a foto cobre o cartão todo; side: só o lado direito, sumindo para a esquerda (fotos menores) */
  imageLayout?: "cover" | "side";
};

/** Chamada para contato: foto à direita (por padrão, o notebook com o N aceso), convite à esquerda */
export default function CtaBanner({
  eyebrow,
  title,
  text,
  image = "/images/cardservice.webp",
  imagePosition = "75% center",
  imageLayout = "cover",
}: CtaBannerProps) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // A foto se afasta devagar enquanto o cartão atravessa a tela
        gsap.fromTo(
          "[data-cb-photo]",
          { scale: 1.14, xPercent: 3 },
          { scale: 1, xPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );

        const tl = gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
          .fromTo(
            "[data-cb-box]",
            { autoAlpha: 0, clipPath: "inset(8% 4% 8% 4% round 24px)" },
            { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.3, ease: "expo.out" },
            0,
          )
          .fromTo("[data-cb-text]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.3);
        revealOnView(tl, el, { start: "top 75%", end: "bottom 20%" });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} id="contato" className="px-6 py-6 md:px-12 lg:px-[6%] lg:py-8">
      <div
        data-cb-box
        className="relative isolate mx-auto flex min-h-[340px] bg-[linear-gradient(110deg,#211039,#130a20_60%)] max-w-[1600px] items-center overflow-hidden rounded-3xl border border-violeta/30 shadow-[0_0_60px_rgba(112,41,217,0.15)]"
      >
        <div
          data-cb-photo
          aria-hidden
          className={`absolute -z-20 ${
            imageLayout === "side"
              ? "inset-y-0 right-0 w-full md:w-[62%] md:[mask-image:linear-gradient(to_right,transparent,#000_32%)]"
              : "inset-0"
          }`}
        >
          <Image src={image} alt="" fill sizes="(min-width: 1600px) 1500px, 100vw" className="object-cover" style={{ objectPosition: imagePosition }} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(33,16,57,0.96)_0%,rgba(33,16,57,0.85)_30%,rgba(33,16,57,0.35)_58%,transparent_80%)] max-lg:bg-roxo-escuro/75"
        />

        <div className="px-7 py-14 md:px-12 lg:px-[9%]">
          <p data-cb-text className="font-poppins text-[12px] font-medium uppercase tracking-[0.3em] text-lavanda/80">
            {eyebrow}
          </p>
          <h2
            data-cb-text
            className="mt-4 font-poppins text-[clamp(30px,2.8vw,48px)] font-semibold leading-[1.12] tracking-[-0.02em] text-branco"
          >
            {title}
          </h2>
          <p data-cb-text className="mt-4 max-w-[46ch] text-base leading-relaxed text-branco/80">
            {text}
          </p>
          <a
            data-cb-text
            href={whatsappLink("Olá! Quero solicitar um orçamento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-violeta px-6 py-3 font-poppins text-[14px] font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] hover:shadow-[0_0_34px_rgba(164,91,255,0.55)]"
          >
            Solicitar orçamento
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
