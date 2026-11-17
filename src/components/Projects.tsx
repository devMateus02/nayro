"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAC_HINGE as HINGE, MAC_SCREEN as SCREEN } from "@/lib/macbook";
import { PROJECTS_PAGE } from "@/lib/nav";
import { revealOnView } from "@/lib/reveal";
import { projectHref, type Project } from "@/lib/projects";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "./icons";
import ProjectScreen from "./projetos/ProjectScreen";
import { keepHyphens } from "@/lib/text";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AUTOPLAY_MS = 5000;

/** Posição de um projeto no anel: d = distância do destaque (0 = na tela do MacBook) */
function ringStyle(d: number, w: number, count: number) {
  const phi = (d * 2 * Math.PI) / Math.max(count, 4); // projetos espalhados pela volta (4 projetos = 90° entre eles)
  const s = Math.sin(phi);
  const c = Math.cos(phi);
  return {
    transform: `translate3d(${s * w * 0.95}px, 0, ${(c - 1) * w * 1.05}px) rotateY(${-s * 42}deg)`,
    opacity: c >= 0 ? 0.78 + 0.22 * c : Math.max(0, 0.78 * (1 + c * 1.4)),
    filter: `blur(${((1 - c) * 1.6).toFixed(2)}px)`,
    zIndex: Math.round(c * 10) + 10,
  };
}

/** Distância circular de i até a posição contínua do anel, em [-COUNT/2, COUNT/2) */
const ringDistance = (i: number, pos: number, count: number) => {
  const d = (((i - pos) % count) + count) % count;
  return d >= count / 2 ? d - count : d;
};
const wrap = (n: number, count: number) => ((n % count) + count) % count;

/** Portfólio da home; sem projetos publicados, a seção não aparece */
export default function Projects({ projects }: { projects: Project[] }) {
  return projects.length ? <ProjectsCarousel projects={projects} /> : null;
}

function ProjectsCarousel({ projects }: { projects: Project[] }) {
  const COUNT = projects.length;
  const section = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const ring = useRef({ pos: 0, target: 0, width: 1 });
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState(false);
  const [paused, setPaused] = useState(false);
  const openingTl = useRef<gsap.core.Timeline | null>(null);
  const spinTween = useRef<gsap.core.Tween | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Aplica a posição do anel em cada cartão (fora do React, a cada quadro do tween)
  const render = useCallback(() => {
    const { pos, width } = ring.current;
    cards.current.forEach((card, i) => {
      if (!card) return;
      const st = ringStyle(ringDistance(i, pos, COUNT), width, COUNT);
      card.style.transform = st.transform;
      card.style.opacity = String(st.opacity);
      card.style.filter = st.filter;
      card.style.zIndex = String(st.zIndex);
    });
    const index = wrap(Math.round(pos), COUNT);
    setActive((prev) => (prev === index ? prev : index));
  }, [COUNT]);

  // Gira o anel até o alvo (sempre pelo caminho do passo pedido, mantendo a continuidade do 360)
  const spinTo = useCallback(
    (target: number, duration = 0.9) => {
      // Interação durante a abertura: conclui a abertura na hora para o giro dela não disputar com o do clique
      const opening = openingTl.current;
      if (opening && (opening.progress() < 1 || opening.reversed())) opening.reversed(false).progress(1);
      ring.current.target = target;
      spinTween.current = gsap.to(ring.current, { pos: target, duration, ease: "power3.inOut", overwrite: true, onUpdate: render });
    },
    [render],
  );
  const step = useCallback((dir: 1 | -1) => spinTo(ring.current.target + dir), [spinTo]);
  const goTo = useCallback(
    (index: number) => {
      const current = ring.current.target;
      spinTo(current + ringDistance(index, current, COUNT));
    },
    [spinTo, COUNT],
  );

  // Largura da tela do MacBook (base para o raio do anel)
  useEffect(() => {
    const el = screen.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      ring.current.width = el.clientWidth || 1;
      render();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [render]);

  // Abertura: o MacBook abre e o anel entra dando uma volta completa até o Projeto A
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          if (ctx.conditions?.reduce) {
            gsap.set("[data-mac-lid]", { rotationX: 0 });
            gsap.set("[data-mac], [data-ring-layer], [data-proj-head]", { autoAlpha: 1, y: 0 });
            setOpened(true);
            return;
          }
          gsap.set("[data-mac-lid]", { rotationX: -88, transformOrigin: `50% ${HINGE}%` });
          gsap.set("[data-ring-layer]", { autoAlpha: 0 });
          // Volta de entrada do anel: chega ao projeto atual depois de uma volta inteira.
          // Relativa ao alvo atual, para que ao refazer a entrada o anel continue de onde o usuário parou.
          const intro = { k: 0 };
          const spinIn = () => {
            ring.current.pos = ring.current.target - COUNT * (1 - intro.k);
            render();
          };
          spinIn();

          const tl = gsap
            .timeline({ defaults: { ease: "power3.out" }, onComplete: () => setOpened(true) })
            .fromTo("[data-proj-head]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0)
            .fromTo("[data-mac]", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.15)
            .to("[data-mac-lid]", { rotationX: 0, duration: 1.4, ease: "power2.out" }, 0.55)
            .fromTo("[data-screen-glow]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, yoyo: true, repeat: 1 }, 1.45)
            .to("[data-ring-layer]", { autoAlpha: 1, duration: 0.4 }, 1.55)
            .to(intro, { k: 1, duration: 1.8, ease: "expo.out", onUpdate: spinIn }, 1.55)
            .fromTo("[data-proj-info]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 2.2);
          openingTl.current = tl;

          // Ao sair: para o giro em andamento, o avanço automático e o modal; o MacBook fecha
          if (section.current) {
            revealOnView(tl, section.current, {
              start: "top 65%",
              end: "bottom 35%",
              onLeave: () => {
                spinTween.current?.kill();
                ring.current.pos = ring.current.target;
                setOpened(false);
                setInfoOpen(false);
              },
            });
          }
          return () => {
            openingTl.current = null;
          };
        },
      );
    },
    { scope: section },
  );

  // Troca do texto do projeto com blur (mesma linguagem da seção de serviços)
  useGSAP(
    () => {
      gsap.fromTo(
        "[data-proj-name]",
        { autoAlpha: 0, y: 10, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out", stagger: 0.06 },
      );
    },
    { scope: section, dependencies: [active] },
  );

  // Avanço automático: pausa com o mouse em cima, fora da tela ou com movimento reduzido
  useEffect(() => {
    if (!opened || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [opened, paused, step]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const project = projects[active];

  return (
    <section
      ref={section}
      id="projetos"
      className="relative flex flex-col overflow-hidden bg-[#0b0a10] px-6 pb-16 pt-24 md:px-12 lg:min-h-svh lg:h-svh lg:px-[8%] lg:pb-[5vh] lg:pt-[13vh]"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      {/* Fundo: brilho âmbar no topo e luz sob o MacBook */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[25%] left-1/2 h-[50%] w-[50%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(184,116,63,0.28),transparent)] blur-2xl" />
        <div className="absolute bottom-[14%] left-1/2 h-[18%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(112,41,217,0.35),transparent)] blur-2xl" />
      </div>

      {/* Cabeçalho */}
      <header className="relative text-center">
        <p data-proj-head className="font-poppins text-[11px] font-medium uppercase tracking-[0.32em] text-roxo-luminoso lg:text-[clamp(11px,0.75vw,13px)]">
          Portfólio
        </p>
        <h2 data-proj-head className="mt-2 font-poppins text-[clamp(24px,2.4vw,42px)] font-semibold leading-tight tracking-[-0.02em] text-branco">
          Projetos que ganham vida <span className="text-roxo-luminoso">no digital.</span>
        </h2>
      </header>

      {/* Palco: anel de projetos + MacBook */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center py-4 lg:py-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div data-mac className="relative aspect-[3/2] w-[min(96vw,58vh*1.5)] lg:w-[min(54vw,64vh*1.5)]">
          {/* Anel de projetos: centrado na tela do MacBook, atrás do mockup */}
          <div
            ref={screen}
            data-ring-layer
            className="absolute [perspective:1300px] [transform-style:preserve-3d]"
            style={{ left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` }}
          >
            {projects.map((p, i) => (
              <div
                key={p.slug}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                role="button"
                tabIndex={-1}
                aria-label={p.name}
                onClick={() => goTo(i)}
                className="absolute inset-0 cursor-pointer overflow-hidden rounded-[0.6%] shadow-[0_20px_60px_rgba(0,0,0,0.6)] will-change-transform"
              >
                {/* Capa inteira na tela do notebook, sem cortar as laterais */}
                <ProjectScreen project={p} sizes="(min-width: 1024px) 40vw, 70vw" fit="contain" />
              </div>
            ))}
          </div>

          {/* MacBook: base fixa + tampa que abre na dobradiça (a tela é transparente) */}
          <div className="pointer-events-none absolute inset-0 [perspective:1600px]">
            <Image
              src="/images/macbook-mockup.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 54vw, 96vw"
              className="object-contain"
              style={{ clipPath: `inset(${HINGE}% 0 0 0)` }}
            />
            <div data-mac-lid className="absolute inset-0 will-change-transform">
              <Image
                src="/images/macbook-mockup.webp"
                alt="MacBook exibindo o projeto em destaque"
                fill
                sizes="(min-width: 1024px) 54vw, 96vw"
                className="object-contain"
                style={{ clipPath: `inset(0 0 ${100 - HINGE}% 0)` }}
              />
              {/* Brilho da tela acendendo ao abrir */}
              <div
                data-screen-glow
                className="invisible absolute bg-[radial-gradient(closest-side,rgba(217,199,255,0.35),transparent)]"
                style={{ left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` }}
              />
            </div>
          </div>

          {/* "!" pulsando ao lado do MacBook: abre o modal com as informações do projeto */}
          <div
            data-proj-info
            className="absolute right-[1%] top-[30%] z-30 lg:left-[90%] lg:right-auto"
            onMouseEnter={() => setInfoOpen(true)}
            onMouseLeave={() => setInfoOpen(false)}
            onFocus={() => setInfoOpen(true)}
            // Fecha só quando o foco sai do botão e do modal (dá para chegar no "Ver projeto" pelo teclado)
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setInfoOpen(false);
            }}
          >
            <button
              type="button"
              aria-label={`Informações do ${project.name}`}
              aria-expanded={infoOpen}
              onClick={() => setInfoOpen((v) => !v)}
              className="relative flex size-8 items-center justify-center rounded-full border border-roxo-luminoso/70 bg-roxo-escuro/70 font-poppins text-sm font-bold text-lavanda backdrop-blur-md lg:size-9"
            >
              <span className="absolute inset-0 animate-ping rounded-full border border-roxo-luminoso/60" aria-hidden />
              !
            </button>

            {/* Modal de vidro: blur de fundo, borda e cantos sutis (sem filter no próprio modal, que desligaria o backdrop-blur) */}
            <div
              role="dialog"
              aria-label={`Sobre o ${project.name}`}
              className={`absolute right-0 top-full mt-3 w-64 origin-top-right rounded-2xl border border-branco/10 bg-branco/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 ease-out lg:left-full lg:right-auto lg:top-1/2 lg:mt-0 lg:ml-4 lg:w-[clamp(240px,17vw,300px)] lg:origin-left lg:-translate-y-1/2 ${
                infoOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
              }`}
            >
              <p className="font-poppins text-xs font-medium text-roxo-luminoso">
                {String(active + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
              </p>
              <p data-proj-name className="mt-1 font-poppins text-lg font-semibold text-branco">
                {keepHyphens(project.name)}
              </p>
              <p data-proj-name className="mt-1.5 text-[13px] leading-relaxed text-branco/70">
                {project.description}
              </p>
              <div data-proj-name className="mt-4 flex flex-wrap gap-1.5 border-t border-branco/10 pt-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-branco/15 bg-branco/[0.03] px-2.5 py-1 font-poppins text-[11px] text-branco/85">
                    {tag}{" "}
                  </span>
                ))}
              </div>
              <Link
                data-proj-name
                href={projectHref(project.slug)}
                className="group/link mt-4 inline-flex items-center gap-1.5 font-poppins text-[13px] font-semibold text-roxo-luminoso transition-colors hover:text-lavanda"
              >
                Ver projeto
                <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Controles fora do modal: setas, progresso e "Ver projeto" */}
        <div data-proj-info className="mt-4 flex items-center gap-3 sm:gap-4 lg:mt-[1vh] lg:gap-6">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Projeto anterior"
            className="flex size-9 items-center justify-center rounded-full border border-branco/30 text-branco transition hover:border-roxo-luminoso"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap font-poppins text-sm font-semibold">
              <span className="text-roxo-luminoso">{String(active + 1).padStart(2, "0")}</span>
              <span className="text-branco/50"> / {String(COUNT).padStart(2, "0")}</span>
            </span>
            {/* Barrinhas de progresso: só a partir do tablet (no celular falta espaço) */}
            <div className="hidden gap-1 sm:flex">
              {projects.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ver ${p.name}`}
                  aria-current={i === active ? "true" : undefined}
                  className="group py-2"
                >
                  {/* Área de clique maior que a barrinha visível */}
                  <span
                    className={`block h-0.5 w-7 rounded-full transition-colors ${i === active ? "bg-roxo-luminoso" : "bg-branco/20 group-hover:bg-branco/40"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Próximo projeto"
            className="flex size-9 items-center justify-center rounded-full border border-branco/30 text-branco transition hover:border-roxo-luminoso"
          >
            <ArrowRight className="size-4" />
          </button>
          <span className="h-5 w-px bg-branco/15" aria-hidden />
          <Link href={PROJECTS_PAGE} className="group inline-flex items-center gap-1.5 whitespace-nowrap font-poppins text-sm font-semibold text-roxo-luminoso">
            Ver projetos
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
