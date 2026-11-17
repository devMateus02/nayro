"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/contact";
import { CATEGORIES, projectHref, type CategoryId, type Project } from "@/lib/projects";
import { revealOnView } from "@/lib/reveal";
import { ArrowRight, ExternalIcon } from "../icons";
import ProjectScreen from "./ProjectScreen";
import { keepHyphens } from "@/lib/text";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

const matches = (p: Project, filter: CategoryId) => filter === "todos" || p.categories.includes(filter);

/** Etiquetas do projeto (tecnologias e tipo) */
function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border border-branco/15 bg-branco/[0.03] px-2.5 py-1 font-poppins text-[11px] text-branco/80">
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** Tela do projeto dentro de uma moldura de notebook, sobre um fundo roxo */
function Preview({ project, sizes, className = "" }: { project: Project; sizes: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(80%_90%_at_50%_100%,rgba(112,41,217,0.55),rgba(33,16,57,0.6)_55%,rgba(14,12,21,0.9))] ${className}`}>
      <div className="absolute inset-x-[9%] bottom-0 aspect-[16/10] overflow-hidden rounded-t-[10px] border-x-[5px] border-t-[5px] border-[#16141d] shadow-[0_-10px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.03]">
        <ProjectScreen project={project} sizes={sizes} />
      </div>
    </div>
  );
}

function ProjectCard({ project, hidden }: { project: Project; hidden: boolean }) {
  const href = projectHref(project.slug);
  return (
    <article
      data-pj-card
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-branco/10 bg-[#0e0c15]/80 transition-[border-color,box-shadow] duration-500 hover:border-violeta/45 hover:shadow-[0_0_40px_rgba(112,41,217,0.15)] ${
        hidden ? "hidden" : ""
      }`}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <Preview project={project} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw" className="aspect-[16/9]" />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-poppins text-lg font-semibold text-branco">
            <Link href={href} className="transition-colors hover:text-lavanda">
              {keepHyphens(project.name)}
            </Link>
          </h3>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir ${project.name} em uma nova aba`}
              className="mt-0.5 text-roxo-luminoso transition-colors hover:text-lavanda"
            >
              <ExternalIcon className="size-[18px]" />
            </a>
          )}
        </div>
        <div className="mt-3">
          <Tags tags={project.tags} />
        </div>
        <p className="mt-4 flex-1 text-[15px] leading-relaxed text-branco/65">{project.description}</p>
        <Link
          href={href}
          className="group/link mt-5 inline-flex w-fit items-center gap-2 font-poppins text-sm font-medium text-roxo-luminoso underline decoration-roxo-luminoso/40 underline-offset-4 transition-colors hover:text-lavanda"
        >
          Ver projeto
          <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

/** Filtro por categoria + grade de projetos */
export default function ProjectsGallery({ projects }: { projects: Project[] }) {
  const section = useRef<HTMLElement>(null);
  const pills = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [filter, setFilter] = useState<CategoryId>("todos");
  const visible = projects.filter((p) => matches(p, filter));

  // Fundo do filtro ativo desliza até o botão escolhido (e acompanha mudanças de tamanho)
  const moveIndicator = useCallback((animate: boolean) => {
    const button = pills.current?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!button || !indicator.current) return;
    const to = { x: button.offsetLeft, y: button.offsetTop, width: button.offsetWidth, height: button.offsetHeight };
    if (animate) gsap.to(indicator.current, { ...to, duration: 0.55, ease: "power3.out" });
    else gsap.set(indicator.current, to);
  }, []);

  useEffect(() => {
    const el = pills.current;
    if (!el) return;
    const ro = new ResizeObserver(() => moveIndicator(false));
    ro.observe(el);
    return () => ro.disconnect();
  }, [moveIndicator]);

  const choose = (id: CategoryId) => {
    if (id === filter) return;
    // Guarda a posição atual dos cartões para animar até a nova arrumação
    flipState.current = Flip.getState("[data-pj-card]");
    setFilter(id);
  };

  // Depois de trocar o filtro: cartões que ficam deslizam até o novo lugar, os que saem somem e os que entram sobem
  useLayoutEffect(() => {
    const state = flipState.current;
    // Na primeira pintura o fundo já nasce no lugar; nas trocas, desliza
    moveIndicator(!!state);
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.7,
      ease: "power3.inOut",
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(els, { autoAlpha: 0, y: 30, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, delay: 0.2, stagger: 0.06 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.94, duration: 0.35, ease: "power2.in" }),
      // A altura da página mudou: recalcula as animações por rolagem
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [filter, moveIndicator]);

  // Entrada: filtro e cartões sobem em sequência (desfaz ao sair)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
          .fromTo("[data-pj-filter]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.06 }, 0)
          .fromTo("[data-pj-grid]", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, 0.25);
        if (section.current) revealOnView(tl, section.current, { start: "top 75%", end: "bottom 20%" });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="px-6 pb-16 pt-10 md:px-12 lg:px-[6%] lg:pb-20 lg:pt-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-14">
          <p data-pj-filter className="font-poppins text-[15px] font-medium text-branco">
            Filtrar por categoria:
          </p>
          <div ref={pills} data-pj-filter role="group" aria-label="Categorias" className="relative flex flex-wrap gap-3">
            {/* Fundo do filtro ativo */}
            <span
              ref={indicator}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-full bg-violeta shadow-[0_0_24px_rgba(112,41,217,0.5)]"
            />
            {CATEGORIES.map(({ id, label }) => {
              const active = id === filter;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(id)}
                  className={`relative rounded-full border px-5 py-2 font-poppins text-[13px] font-medium transition-colors duration-300 lg:px-6 ${
                    active ? "border-transparent text-branco" : "border-branco/25 text-branco/80 hover:border-roxo-luminoso/70 hover:text-branco"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div data-pj-grid className="mt-10 lg:mt-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} hidden={!matches(p, filter)} />
            ))}
          </div>

          {/* Categoria ainda sem projetos publicados */}
          {visible.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-branco/15 px-6 py-16 text-center">
              <p className="font-poppins text-xl font-semibold text-branco">
                {filter === "todos"
                  ? "Novos projetos em breve."
                  : `Nenhum projeto de ${CATEGORIES.find((c) => c.id === filter)?.label} por aqui ainda.`}
              </p>
              <p className="mt-2 max-w-[44ch] text-[15px] text-branco/65">Que tal o seu ser o primeiro? Conte a sua ideia para a gente.</p>
              <a
                href={whatsappLink(
                  filter === "todos" ? "Olá! Quero tirar uma ideia do papel." : `Olá! Quero um projeto de ${CATEGORIES.find((c) => c.id === filter)?.label}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex items-center gap-2.5 rounded-full bg-violeta px-5 py-2.5 font-poppins text-sm font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea]"
              >
                Solicitar orçamento
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
