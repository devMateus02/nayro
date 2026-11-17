"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useId, useRef, useState } from "react";
import { WHATSAPP_URL } from "@/lib/contact";
import { FAQ } from "@/lib/content";
import { revealOnView } from "@/lib/reveal";
import { ArrowRight, ChatIcon, PlusIcon } from "../icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const questions = FAQ;

const columns = [questions.slice(0, 3), questions.slice(3)];

export default function Faq() {
  const section = useRef<HTMLElement>(null);
  const id = useId();
  const [open, setOpen] = useState<string | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.8 } })
          .fromTo("[data-fq-head]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0)
          // Uma coluna e depois a outra, de cima para baixo
          .fromTo("[data-fq-item]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.07 }, 0.25);
        if (section.current) revealOnView(tl, section.current, { start: "top 75%", end: "bottom 15%" });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="px-6 pb-28 pt-20 md:px-12 lg:px-[6%] lg:pb-32">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-fq-head className="font-poppins text-[12px] font-medium uppercase tracking-[0.3em] text-roxo-luminoso">
              Dúvidas frequentes
            </p>
            <h2 data-fq-head className="mt-3 font-poppins text-[clamp(30px,2.8vw,48px)] font-semibold tracking-[-0.02em] text-branco">
              Perguntas <span className="text-roxo-luminoso">frequentes</span>
            </h2>
          </div>
          <p data-fq-head className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-branco/70">
            Ainda tem dúvidas?
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-medium text-lavanda underline decoration-lavanda/40 underline-offset-4 transition-colors hover:text-branco hover:decoration-branco/60"
            >
              <ChatIcon className="size-4 text-roxo-luminoso" />
              Fale conosco
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-8">
          {columns.map((items, c) => (
            <ul key={c} className="flex flex-col gap-4">
              {items.map(({ q, a }) => {
                const isOpen = open === q;
                const panel = `${id}-${questions.findIndex((x) => x.q === q)}`;
                return (
                  <li
                    key={q}
                    data-fq-item
                    className={`rounded-xl border bg-[#0e0c15]/70 transition-[border-color,box-shadow] duration-500 ${
                      isOpen ? "border-violeta/50 shadow-[0_0_30px_rgba(112,41,217,0.14)]" : "border-branco/10 hover:border-branco/25"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : q)}
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left font-poppins text-[15px] text-branco lg:px-6"
                    >
                      {q}
                      <PlusIcon
                        className={`size-5 shrink-0 transition-[rotate,color] duration-300 ${isOpen ? "rotate-45 text-roxo-luminoso" : "text-branco/80"}`}
                      />
                    </button>
                    {/* Resposta: abre deslizando por baixo da pergunta */}
                    <div
                      id={panel}
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-[15px] leading-relaxed text-branco/70 lg:px-6">{a}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
