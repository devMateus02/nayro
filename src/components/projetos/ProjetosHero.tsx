"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { whatsappLink } from "@/lib/contact";
import { onLoaderDone } from "@/lib/loader";
import { MAC_SCREEN } from "@/lib/macbook";
import type { Project } from "@/lib/projects";
import { revealOnView } from "@/lib/reveal";
import { ArrowRight, ChatIcon, MonitorIcon, ShieldCheckIcon, UsersIcon } from "../icons";
import ProjectScreen from "./ProjectScreen";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Números da faixa: o valor sobe de 0 até `count` ao entrar; sem `count`, é só texto
const stats = [
  { prefix: "+", count: 10, suffix: "", label: "Projetos entregues", icon: MonitorIcon },
  { prefix: "", count: 100, suffix: "%", label: "Clientes satisfeitos", icon: UsersIcon },
  { prefix: "Suporte contínuo", count: null, suffix: "", label: "E evolução dos projetos", icon: ShieldCheckIcon },
];

/** Página de portfólio exibida na tela do MacBook: os projetos passam rolando sem parar (duas cópias para emendar) */
// Sem projetos publicados: telas com a marca no lugar, para o MacBook não ficar vazio
const PLACEHOLDERS = Array.from({ length: 4 }, (_, i) => ({ slug: `nayro-${i}`, name: "NAYRO", cover: null, screen: null }));

function PortfolioScreen({ projects: published }: { projects: Project[] }) {
  const projects: Pick<Project, "slug" | "name" | "cover" | "screen">[] = published.length ? published : PLACEHOLDERS;
  const copy = (key: string) => (
    <div key={key} className="grid grid-cols-2 gap-[3%] pb-[3%]">
      {projects.map((p) => (
        <div key={p.slug} className="relative aspect-[16/10] overflow-hidden rounded-[3px] ring-1 ring-white/10">
          <ProjectScreen project={p} sizes="240px" />
        </div>
      ))}
    </div>
  );
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0a10] font-poppins">
      <div className="absolute inset-x-0 top-0 z-10 flex h-[13%] items-center justify-between bg-[#0b0a10]/95 px-[5%] text-white">
        <span className="text-[clamp(7px,1.1vw,15px)] font-semibold">Projetos</span>
        <span className="flex gap-[6px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[3px] w-[clamp(10px,1.6vw,26px)] rounded-full bg-white/25" />
          ))}
        </span>
      </div>
      <div className="absolute inset-x-[5%] top-[16%]">
        <div data-ph-track>
          {copy("a")}
          {copy("b")}
        </div>
      </div>
      {/* Esmaece a rolagem embaixo */}
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(transparent,#0b0a10)]" />
    </div>
  );
}

/** Topo da página de projetos: chamada à esquerda, MacBook com o portfólio à direita e a faixa de números */
export default function ProjetosHero({ projects }: { projects: Project[] }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (context) => {
        // Portfólio rolando na tela do MacBook
        gsap.to("[data-ph-track]", { yPercent: -50, duration: 40, ease: "none", repeat: -1 });

        // MacBook acompanha o mouse com uma inclinação leve (só com mouse)
        const tilt = el.querySelector<HTMLElement>("[data-ph-tilt]");
        const onMove = (e: PointerEvent) => {
          if (!tilt || e.pointerType !== "mouse") return;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(tilt, { rotateY: x * 10, rotateX: -y * 7, duration: 1.2, ease: "power3.out", overwrite: "auto" });
        };
        el.addEventListener("pointermove", onMove);

        // Paralaxe: o MacBook sobe um pouco mais devagar que a página
        gsap.to("[data-ph-mac]", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });

        const stop = onLoaderDone(() =>
          context.add(() => {
            const tl = gsap
              .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
              .fromTo(
                "[data-ph='mac']",
                { autoAlpha: 0, y: 70, rotateX: 18 },
                { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.8, ease: "expo.out" },
                0.1,
              )
              .fromTo("[data-ph='glow']", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power1.out" }, 0.4)
              .fromTo("[data-ph='eyebrow']", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
              .fromTo(
                "[data-ph='line']",
                { autoAlpha: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
                { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.12 },
                0.25,
              )
              .fromTo("[data-ph='text']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.6)
              .fromTo("[data-ph='cta']", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.75)
              .fromTo(
                "[data-ph='rule']",
                { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" },
                { autoAlpha: 1, scaleX: 1, duration: 1.4, ease: "power2.inOut" },
                0.9,
              )
              .fromTo("[data-ph='stat']", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1);
            // Números sobem de 0 até o valor
            el.querySelectorAll<HTMLElement>("[data-ph-count]").forEach((n, i) => {
              tl.fromTo(
                n,
                { innerText: 0 },
                { innerText: Number(n.dataset.phCount), snap: { innerText: 1 }, duration: 1.4, ease: "power2.out" },
                1.05 + i * 0.1,
              );
            });
            revealOnView(tl, el, { start: "top 60%", end: "bottom 30%" });
          }),
        );

        return () => {
          stop();
          el.removeEventListener("pointermove", onMove);
        };
      });

      // Movimento reduzido: mostra tudo de uma vez
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-ph]", { autoAlpha: 1 });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative isolate flex min-h-svh flex-col overflow-hidden bg-preto">
      {/* Luzes do ambiente: abajur âmbar no alto à direita e brilho roxo sob o MacBook */}
      <div data-ph="glow" data-intro aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-[8%] -top-[18%] h-[60%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgba(214,140,70,0.22),transparent)] blur-2xl" />
        <div className="absolute right-[6%] top-[38%] h-[50%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(112,41,217,0.32),transparent)] blur-2xl" />
        <div className="absolute -left-[10%] top-[10%] h-[70%] w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(33,16,57,0.8),transparent)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 items-center gap-12 px-6 pb-14 pt-32 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-[3vw] lg:px-[6%] lg:pt-28">
        <div className="relative z-10">
          <p
            data-ph="eyebrow"
            data-intro
            className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]"
          >
            Nossos projetos
          </p>
          <h1 className="mt-5 font-poppins text-[clamp(36px,3.4vw,62px)] font-semibold leading-[1.08] tracking-[-0.025em] text-branco">
            <span data-ph="line" data-intro className="block">
              Soluções reais,{" "}
            </span>
            <span data-ph="line" data-intro className="block lg:whitespace-nowrap">
              para <span className="text-roxo-luminoso">negócios reais.</span>
            </span>
          </h1>
          <p
            data-ph="text"
            data-intro
            className="mt-6 max-w-[42ch] text-base leading-relaxed text-branco/80 lg:text-[clamp(16px,1.15vw,20px)]"
          >
            Conheça alguns projetos desenvolvidos pela Nayro e veja na prática como a tecnologia pode gerar resultados.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              data-ph="cta"
              data-intro
              href={whatsappLink("Olá! Quero solicitar um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-violeta px-6 py-3 font-poppins text-[14px] font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] hover:shadow-[0_0_34px_rgba(164,91,255,0.55)]"
            >
              Solicitar orçamento
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              data-ph="cta"
              data-intro
              href={whatsappLink("Olá! Quero falar com a equipe da Nayro.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-branco/40 px-6 py-3 font-poppins text-[14px] font-medium text-branco transition hover:border-roxo-luminoso hover:bg-roxo-escuro/40"
            >
              <ChatIcon className="size-4" />
              Falar com a equipe
            </a>
          </div>
        </div>

        {/* MacBook com o portfólio na tela */}
        <div data-ph-mac className="relative [perspective:1400px]">
          <div data-ph-tilt className="[transform-style:preserve-3d]">
            <div data-ph="mac" data-intro className="relative aspect-[3/2] w-full">
              <div
                className="absolute overflow-hidden"
                style={{
                  left: `${MAC_SCREEN.left}%`,
                  top: `${MAC_SCREEN.top}%`,
                  width: `${MAC_SCREEN.width}%`,
                  height: `${MAC_SCREEN.height}%`,
                }}
              >
                <PortfolioScreen projects={projects} />
              </div>
              <Image
                src="/images/macbook-mockup.webp"
                alt="MacBook exibindo o portfólio da Nayro"
                fill
                preload
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="pointer-events-none object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Faixa de números */}
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12 lg:px-[6%]">
        <ul className="grid grid-cols-2 gap-y-7 pb-8 lg:grid-cols-3 lg:gap-y-0 lg:pb-10">
          {stats.map(({ prefix, count, suffix, label, icon: Icon }, i) => (
            <li
              key={label}
              data-ph="stat"
              data-intro
              className={`flex items-center gap-3.5 lg:justify-center ${i > 0 ? "lg:border-l lg:border-branco/10" : ""} ${
                i === stats.length - 1 ? "col-span-2 lg:col-span-1" : ""
              }`}
            >
              <Icon className="size-8 shrink-0 text-roxo-luminoso" />
              <div className="font-poppins">
                <p className="text-lg font-semibold leading-tight text-branco lg:text-xl">
                  {prefix}
                  {count !== null && <span data-ph-count={count}>{count}</span>}
                  {suffix}
                </p>
                <p className="text-[13px] text-branco/70">{label}</p>
              </div>
            </li>
          ))}
        </ul>
        <span data-ph="rule" data-intro aria-hidden className="block h-px w-full bg-branco/10" />
      </div>
    </section>
  );
}
