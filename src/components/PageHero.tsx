"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { whatsappLink } from "@/lib/contact";
import { onLoaderDone } from "@/lib/loader";
import { PROJECTS_PAGE } from "@/lib/nav";
import { revealOnView } from "@/lib/reveal";
import { ArrowRight } from "./icons";
import NavLink from "./NavLink";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Onde a foto fica no topo
const PHOTO_LAYOUT = {
  // Toda a altura, da faixa esquerda do texto até a direita
  full: "inset-x-0 -top-[10%] bottom-0 lg:left-[24%]",
  // Só no alto à direita, sumindo embaixo (acima da faixa de cartões)
  top: "inset-x-0 -top-[6%] bottom-[26%] lg:left-[26%] [mask-image:linear-gradient(to_bottom,#000_60%,transparent)] lg:[mask-image:linear-gradient(to_bottom,#000_60%,transparent),linear-gradient(to_right,transparent,#000_30%)] lg:[mask-composite:intersect]",
};

type PageHeroProps = {
  eyebrow: string;
  /** Linhas do título (cada uma entra separada) */
  lines: ReactNode[];
  text: string;
  image: string;
  /** Enquadramento da foto (object-position) */
  imagePosition?: string;
  photoLayout?: keyof typeof PHOTO_LAYOUT;
  /**
   * Faixa embaixo do topo (diferenciais, cartões...).
   * Elementos com data-sh="feature" sobem em sequência e um com data-sh="rule" se desenha.
   */
  children?: ReactNode;
};

/** Topo das páginas internas: foto à direita, chamada e botões à esquerda e uma faixa embaixo */
export default function PageHero({
  eyebrow,
  lines,
  text,
  image,
  imagePosition = "62% center",
  photoLayout = "full",
  children,
}: PageHeroProps) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (context) => {
        // Paralaxe: a foto desce mais devagar que a página ao rolar
        gsap.to("[data-sh-photo]", {
          yPercent: 10,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });

        // Começa quando a tela de load se abre (na hora, se ela já abriu)
        return onLoaderDone(() =>
          context.add(() => {
            // Foto: aproximação lenta, uma vez, como uma câmera entrando no ambiente
            gsap.fromTo("[data-sh='zoom']", { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 2.6, ease: "expo.out" });

            // Textos e faixa de baixo: fazem ao entrar no topo e desfazem ao sair dele
            const tl = gsap
              .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
              .fromTo("[data-sh='eyebrow']", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
              .fromTo(
                "[data-sh='line']",
                { autoAlpha: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
                { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.12 },
                0.25,
              )
              .fromTo("[data-sh='text']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.65)
              .fromTo("[data-sh='cta']", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.8);
            // Faixa de baixo: só o que existir nela
            const rule = el.querySelectorAll("[data-sh='rule']");
            if (rule.length) {
              tl.fromTo(
                rule,
                { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" },
                { autoAlpha: 1, scaleX: 1, duration: 1.4, ease: "power2.inOut" },
                0.9,
              );
            }
            const features = el.querySelectorAll("[data-sh='feature']");
            if (features.length) {
              tl.fromTo(features, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 1);
            }
            revealOnView(tl, el, { start: "top 60%", end: "bottom 30%" });
          }),
        );
      });

      // Movimento reduzido: mostra tudo de uma vez
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-sh]", { autoAlpha: 1 });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative isolate flex min-h-svh flex-col overflow-hidden bg-preto">
      {/* Foto: ocupa a direita no desktop e o fundo inteiro no celular */}
      <div data-sh-photo aria-hidden className={`absolute -z-20 ${PHOTO_LAYOUT[photoLayout]}`}>
        <div data-sh="zoom" data-intro className="relative size-full">
          <Image
            src={image}
            alt=""
            fill
            preload
            sizes="(min-width: 1024px) 76vw, 100vw"
            className="object-cover"
            style={{ objectPosition: imagePosition }}
          />
        </div>
      </div>
      {/* Escurece a foto para o texto: da esquerda para a direita, e embaixo para a faixa */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 max-lg:bg-preto/70 lg:bg-[linear-gradient(90deg,#08070d_0%,#08070d_24%,rgba(8,7,13,0.82)_38%,rgba(8,7,13,0.25)_62%,rgba(8,7,13,0.05)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(8,7,13,0.7)_0%,transparent_22%,transparent_58%,#08070d_96%)]"
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-center px-6 pb-16 pt-36 md:px-12 lg:px-[6%] lg:pt-32">
        <div className="max-w-[min(100%,620px)]">
          <p
            data-sh="eyebrow"
            data-intro
            className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]"
          >
            {eyebrow}
          </p>
          <h1 className="mt-5 font-poppins text-[clamp(36px,4.3vw,72px)] font-semibold leading-[1.08] tracking-[-0.025em] text-branco">
            {lines.map((line, i) => (
              <span key={i} data-sh="line" data-intro className="block">
                {line}
                {/* Espaço entre as linhas: sem ele, robôs de busca e IAs leem as palavras grudadas */}
                {i < lines.length - 1 && " "}
              </span>
            ))}
          </h1>
          <p
            data-sh="text"
            data-intro
            className="mt-6 max-w-[40ch] text-base leading-relaxed text-branco/80 lg:text-[clamp(16px,1.15vw,20px)]"
          >
            {text}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              data-sh="cta"
              data-intro
              href={whatsappLink("Olá! Quero solicitar um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-violeta px-6 py-3 font-poppins text-[14px] font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] hover:shadow-[0_0_34px_rgba(164,91,255,0.55)]"
            >
              Solicitar orçamento
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <NavLink
              data-sh="cta"
              data-intro
              href={PROJECTS_PAGE}
              className="inline-flex items-center rounded-full border border-branco/40 px-6 py-3 font-poppins text-[14px] font-medium text-branco transition hover:border-roxo-luminoso hover:bg-roxo-escuro/40"
            >
              Ver projetos
            </NavLink>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}
