"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { INSTAGRAM_LABEL, INSTAGRAM_URL, PHONE_LABEL, WHATSAPP_URL } from "@/lib/contact";
import { onLoaderDone } from "@/lib/loader";
import { revealOnView } from "@/lib/reveal";
import { ArrowUpRight, ChatIcon } from "../icons";
import ContactForm from "./ContactForm";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

const channels = [
  { label: "WhatsApp", value: PHONE_LABEL, href: WHATSAPP_URL, external: true, icon: ChatIcon },
  { label: "Instagram", value: INSTAGRAM_LABEL, href: INSTAGRAM_URL, external: true, icon: InstagramIcon },
];

/** Contato: chamada e canais diretos à esquerda, formulário à direita */
export default function ContactSection() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (context) =>
        // Começa quando a tela de load se abre (na hora, se ela já abriu)
        onLoaderDone(() =>
          context.add(() => {
            const tl = gsap
              .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
              .fromTo("[data-ct='bg']", { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 2.2, ease: "expo.out" }, 0)
              .fromTo("[data-ct='eyebrow']", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
              .fromTo(
                "[data-ct='line']",
                { autoAlpha: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
                { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.12 },
                0.25,
              )
              .fromTo("[data-ct='text']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.6)
              .fromTo("[data-ct='channel']", { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.1 }, 0.75)
              .fromTo(
                "[data-ct='card']",
                { autoAlpha: 0, y: 60, rotateX: 8, transformPerspective: 1200 },
                { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.4, ease: "expo.out" },
                0.35,
              )
              .fromTo("[data-cf-field]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.7);
            revealOnView(tl, el, { start: "top 60%", end: "bottom 25%" });
          }),
        ),
      );

      // Movimento reduzido: mostra tudo de uma vez
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-ct]", { autoAlpha: 1 });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative isolate overflow-hidden px-6 pb-20 pt-36 md:px-12 lg:px-[6%] lg:pb-28 lg:pt-40">
      {/* Fundo: o ambiente roxo da marca, bem escurecido, com um brilho atrás do formulário */}
      <div data-ct="bg" data-intro aria-hidden className="absolute inset-0 -z-10">
        <Image src="/images/hero-bg.webp" alt="" fill preload sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,7,13,0.75),rgba(8,7,13,0.55)_40%,#08070d_95%)]" />
        <div className="absolute right-[2%] top-[18%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(112,41,217,0.3),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-[5vw]">
        <div>
          <p data-ct="eyebrow" data-intro className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]">
            Contato
          </p>
          <h1 className="mt-5 font-poppins text-[clamp(30px,9vw,44px)] lg:text-[clamp(36px,3.8vw,64px)] font-semibold leading-[1.08] tracking-[-0.025em] text-branco">
            <span data-ct="line" data-intro className="block">
              Vamos falar sobre{" "}
            </span>
            <span data-ct="line" data-intro className="block text-roxo-luminoso">
              o seu projeto?
            </span>
          </h1>
          <p data-ct="text" data-intro className="mt-6 max-w-[42ch] text-base leading-relaxed text-branco/75 lg:text-[clamp(16px,1.15vw,19px)]">
            Conte um pouco sobre a sua ideia. A gente responde com os próximos passos e uma proposta sem compromisso.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:max-w-[420px]">
            {channels.map(({ label, value, href, external, icon: Icon }) => (
              <li key={label} data-ct="channel" data-intro>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-3 rounded-2xl min-[360px]:gap-4 border border-branco/10 bg-[#0e0c15]/70 p-4 backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-violeta/45 hover:shadow-[0_0_30px_rgba(112,41,217,0.18)]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 border border-violeta/40 bg-[linear-gradient(140deg,rgba(112,41,217,0.45),rgba(33,16,57,0.6))] text-lavanda">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-poppins text-[12px] uppercase tracking-[0.2em] text-branco/50">{label}</span>{" "}
                    {/* Celular pequeno: se o @ do Instagram não couber, quebra depois do "@", nunca no meio de uma palavra */}
                    <span className="block font-poppins text-[14px] font-medium text-branco [overflow-wrap:anywhere] min-[360px]:text-[15px]">
                      {value.includes("@") ? (
                        <>
                          {value.split("@")[0]}@<wbr />
                          {value.split("@")[1]}
                        </>
                      ) : (
                        value
                      )}
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-roxo-luminoso transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div
          data-ct="card"
          data-intro
          className="relative rounded-3xl border border-branco/10 bg-[#0e0c15]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(112,41,217,0.12)] backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <h2 className="font-poppins text-xl font-semibold text-branco lg:text-2xl">Envie uma mensagem</h2>
          <p className="mt-1.5 text-[14px] text-branco/60">Leva menos de dois minutos.</p>
          <div className="mt-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
