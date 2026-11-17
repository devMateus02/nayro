"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/contact";
import { onLoaderDone } from "@/lib/loader";
import { mediaSize } from "@/lib/media";
import { PROJECTS_PAGE } from "@/lib/nav";
import { categoryLabel, projectHref, type Project } from "@/lib/projects";
import { revealOnView } from "@/lib/reveal";
import { ArrowLeft, ArrowRight, ExternalIcon } from "../icons";
import ProjectScreen from "./ProjectScreen";
import ProjectVideo from "./ProjectVideo";
import { keepHyphens } from "@/lib/text";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Formato da tela quando a mídia não informa o dela (e limites para não ficar estreita ou alta demais) */
const DEFAULT_RATIO = 16 / 9;
const clampRatio = (ratio: number) => Math.min(2.6, Math.max(1.2, ratio));
const ratioOf = (size: { width: number; height: number } | null) => (size ? clampRatio(size.width / size.height) : null);

/**
 * Moldura de navegador com a tela do projeto (e o vídeo por cima, quando houver).
 * A tela segue o formato do vídeo (ou da capa): nada é cortado nas laterais.
 */
function BrowserFrame({ project, sizes }: { project: Project; sizes: string }) {
  const host = project.url ? new URL(project.url).host.replace(/^www\./, "") : project.slug;
  const videoRatio = ratioOf(mediaSize(project.video));
  const [measured, setMeasured] = useState<number | null>(null);
  const ratio = videoRatio ?? measured ?? ratioOf(mediaSize(project.cover)) ?? DEFAULT_RATIO;

  // Vídeo antigo, sem as medidas no nome: a tela se ajusta quando o vídeo informa o formato
  useEffect(() => {
    if (measured) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [measured]);

  return (
    <div className="overflow-hidden rounded-2xl border border-branco/10 bg-[#121019] shadow-[0_40px_120px_rgba(0,0,0,0.55),0_0_80px_rgba(112,41,217,0.18)]">
      <div className="flex items-center gap-3 border-b border-branco/10 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-branco/15" />
          ))}
        </span>
        <span className="mx-auto max-w-[60%] truncate rounded-full bg-branco/[0.05] px-4 py-1 font-poppins text-[11px] text-branco/50">{host}</span>
        <span className="w-[42px]" aria-hidden />
      </div>
      <div className="relative" style={{ aspectRatio: ratio }}>
        <ProjectScreen project={project} sizes={sizes} />
        {project.video && (
          <ProjectVideo
            src={project.video}
            name={project.name}
            onSize={videoRatio ? undefined : (width, height) => setMeasured(clampRatio(width / height))}
          />
        )}
      </div>
    </div>
  );
}

/** Página de um projeto: topo com a chamada, tela grande (com o vídeo), texto e o próximo projeto */
export default function ProjectDetail({ project, next }: { project: Project; next: Project | null }) {
  const root = useRef<HTMLDivElement>(null);
  const paragraphs = (project.content || project.description).split(/\n\s*\n/).filter((p) => p.trim());
  const meta = [
    { label: "Cliente", value: project.client },
    { label: "Ano", value: project.year ? String(project.year) : null },
    { label: "Categoria", value: project.categories.map(categoryLabel).join(" · ") },
  ].filter((m): m is { label: string; value: string } => Boolean(m.value));

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (context) => {
        // Topo: entra quando a tela de load se abre (na hora, se já abriu)
        const cancel = onLoaderDone(() =>
          context.add(() => {
            const hero = el.querySelector<HTMLElement>("[data-pd-hero]");
            if (!hero) return;
            const tl = gsap
              .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
              .fromTo("[data-pd='back']", { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.7 }, 0)
              .fromTo("[data-pd='eyebrow']", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.1)
              .fromTo(
                "[data-pd='title']",
                { autoAlpha: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
                { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 1.1, ease: "expo.out" },
                0.2,
              )
              .fromTo("[data-pd='text']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0 }, 0.5)
              .fromTo("[data-pd='meta']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.08 }, 0.6)
              .fromTo("[data-pd='cta']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.08 }, 0.7)
              .fromTo("[data-pd='frame']", { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: "expo.out" }, 0.45);
            revealOnView(tl, hero, { start: "top 80%", end: "bottom 10%" });
          }),
        );

        // A tela cresce até o tamanho final conforme a página rola
        gsap.fromTo(
          "[data-pd='zoom']",
          { scale: 0.9 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-pd='frame']", start: "top bottom", end: "center center", scrub: true },
          },
        );

        // Seções de baixo: entram ao chegar na tela e desfazem ao sair
        el.querySelectorAll<HTMLElement>("[data-pd-section]").forEach((section) => {
          const tl = gsap
            .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
            .fromTo(section.querySelectorAll("[data-pd-item]"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.1 });
          revealOnView(tl, section, { start: "top 75%", end: "bottom 20%" });
        });

        return cancel;
      });

      // Movimento reduzido: mostra tudo de uma vez
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-pd], [data-pd-item]", { autoAlpha: 1 });
      });

      // O projeto chega depois do resto da página (streaming): recalcula as posições das animações
      // por rolagem de quem está abaixo (ex.: o banner de contato), medidas com a página ainda curta
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* Topo */}
      <section data-pd-hero className="relative isolate overflow-hidden px-6 pb-20 pt-32 md:px-12 lg:px-[6%] lg:pb-28 lg:pt-40">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-[20%] left-1/2 h-[60%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(112,41,217,0.32),transparent)] blur-2xl" />
          <div className="absolute bottom-[10%] left-1/2 h-[30%] w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(164,91,255,0.16),transparent)] blur-2xl" />
        </div>

        <div className="mx-auto max-w-[1400px]">
          <Link
            data-pd="back"
            data-intro
            href={PROJECTS_PAGE}
            className="group inline-flex items-center gap-2 font-poppins text-sm text-branco/60 transition-colors hover:text-branco"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Todos os projetos
          </Link>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-[5vw]">
            <div>
              <p data-pd="eyebrow" data-intro className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]">
                {project.categories.map(categoryLabel).join(" · ")}
              </p>
              <h1
                data-pd="title"
                data-intro
                className="mt-4 font-poppins text-[clamp(38px,11vw,56px)] font-semibold leading-[1.02] tracking-[-0.03em] text-branco lg:text-[clamp(56px,6vw,104px)]"
              >
                {keepHyphens(project.name)}
              </h1>
              <p data-pd="text" data-intro className="mt-6 max-w-[48ch] text-base leading-relaxed text-branco/75 lg:text-[clamp(17px,1.2vw,20px)]">
                {project.description}
              </p>
            </div>

            <div>
              {meta.length > 0 && (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-branco/10 pt-6">
                  {meta.map(({ label, value }) => (
                    <div key={label} data-pd="meta" data-intro className={label === "Categoria" ? "col-span-2" : ""}>
                      <dt className="font-poppins text-[11px] uppercase tracking-[0.25em] text-branco/45">{label}</dt>
                      <dd className="mt-1.5 font-poppins text-[15px] font-medium text-branco">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {project.url && (
                  <a
                    data-pd="cta"
                    data-intro
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-full border border-branco/40 px-6 py-3 font-poppins text-sm font-medium text-branco transition hover:border-roxo-luminoso"
                  >
                    Visitar projeto
                    <ExternalIcon className="size-4" />
                  </a>
                )}
                <a
                  data-pd="cta"
                  data-intro
                  href={whatsappLink(`Olá! Vi o projeto ${project.name} no site e quero algo parecido.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-violeta px-6 py-3 font-poppins text-sm font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea]"
                >
                  Quero um projeto assim
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>

          <div data-pd="frame" data-intro className="mt-14 lg:mt-20">
            <div data-pd="zoom" className="origin-top">
              <BrowserFrame project={project} sizes="(min-width: 1440px) 1400px, 94vw" />
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o projeto */}
      <section data-pd-section className="px-6 py-16 md:px-12 lg:px-[6%] lg:py-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-[6vw]">
          <div data-pd-item>
            <p className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]">O projeto</p>
            <h2 className="mt-4 font-poppins text-[clamp(28px,8vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em] text-branco lg:text-[clamp(32px,2.6vw,46px)]">
              Sobre o <span className="text-roxo-luminoso">projeto</span>
            </h2>
            {project.tags.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-branco/15 bg-branco/[0.03] px-3 py-1.5 font-poppins text-[12px] text-branco/80">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-6">
            {paragraphs.map((paragraph, i) => (
              <p key={i} data-pd-item className="max-w-[62ch] text-base leading-[1.8] text-branco/75 lg:text-[clamp(17px,1.15vw,19px)]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Próximo projeto */}
      {next && (
        <section data-pd-section className="px-6 pb-20 pt-10 md:px-12 lg:px-[6%] lg:pb-24">
          <Link
            data-pd-item
            href={projectHref(next.slug)}
            className="group mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-branco/10 bg-[#0e0c15]/80 p-6 transition-[border-color,box-shadow] duration-500 hover:border-violeta/45 hover:shadow-[0_0_60px_rgba(112,41,217,0.18)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-10"
          >
            <div>
              <p className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-branco/50">Próximo projeto</p>
              <p className="mt-3 font-poppins text-[clamp(28px,8vw,40px)] font-semibold leading-[1.05] tracking-[-0.02em] text-branco transition-colors group-hover:text-lavanda lg:text-[clamp(36px,3.4vw,60px)]">
                {keepHyphens(next.name)}
              </p>
              <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-branco/60">{next.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-poppins text-sm font-semibold text-roxo-luminoso">
                Ver projeto
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" />
              </span>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-branco/10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">
              <ProjectScreen project={next} sizes="(min-width: 768px) 45vw, 90vw" />
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
