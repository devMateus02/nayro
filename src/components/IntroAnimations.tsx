"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { jumpToY } from "@/lib/lenis";
import { onLoaderDone } from "@/lib/loader";
import { findVisible } from "@/lib/nav";
import { revealOnView } from "@/lib/reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const q = (name: string) => `[data-intro="${name}"]`;
const HERO_TEXTS = ["eyebrow", "title", "divider", "text", "cta", "scroll"].map(q).join(", ");

/**
 * Animações de entrada da Hero (a navbar anima a si mesma).
 * Os elementos marcados com data-intro começam ocultos no CSS e são revelados aqui.
 */
export default function IntroAnimations() {
  useGSAP(() => {
    // Chegando de outra página com #seção (ex.: /#projetos): vai direto até ela quando o site abrir.
    // Espera um quadro para as seções fixadas (pin) e o Lenis já estarem montados.
    const stopHash = onLoaderDone(() => {
      const target = location.hash && findVisible(location.hash);
      if (!target) return;
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        jumpToY(target.getBoundingClientRect().top + window.scrollY);
      });
    });

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      // Tudo começa quando a tela de load se abre (criado dentro do contexto, para ser desfeito junto)
      return onLoaderDone(() => context.add(() => play()));
    });

    function play() {
      // Símbolo N: surge uma vez com um leve zoom (segue na tela; viaja até os serviços).
      // Ao final, devolve transform ao CSS
      gsap.fromTo(
        q("logo"),
        { autoAlpha: 0, scale: 0.92 },
        { autoAlpha: 1, scale: 1, duration: 1.6, ease: "expo.out", delay: 0.2, clearProps: "transform" },
      );

      // Textos da Hero: bloco da esquerda e depois o da direita (stagger segue a ordem no HTML).
      // Fazem ao entrar na Hero e desfazem ao sair dela.
      const texts = gsap
        .timeline({
          defaults: { ease: "power3.out", duration: 0.9 },
          onComplete: () => {
            gsap.set(HERO_TEXTS, { clearProps: "transform,clipPath,transformOrigin" });
          },
        })
        .fromTo(q("eyebrow"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.35 }, 0.2)
        .fromTo(
          q("title"),
          { autoAlpha: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.35 },
          0.3,
        )
        .fromTo(
          q("divider"),
          { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" },
          { autoAlpha: 1, scaleX: 1, duration: 0.8, ease: "power2.inOut", stagger: 0.35 },
          0.65,
        )
        .fromTo(q("text"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.35 }, 0.75)
        .fromTo(q("cta"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.2)
        .fromTo(q("scroll"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.35);

      const hero = document.querySelector("#inicio");
      if (hero) revealOnView(texts, hero);
      else texts.play();
    }

    // Movimento reduzido: mostra tudo de uma vez
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-intro]", { autoAlpha: 1 });
    });

    return stopHash;
  });

  return null;
}
