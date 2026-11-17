"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { onLoaderDone } from "@/lib/loader";
import { CONTACT_PAGE, findVisible, navHref, SECTIONS } from "@/lib/nav";
import { ArrowRight } from "./icons";
import NavLink from "./NavLink";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Navbar() {
  const header = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const home = pathname === "/";
  const links = SECTIONS.map(({ hash, label }) => ({ hash, href: navHref(hash, home), label }));
  const [open, setOpen] = useState(false);
  // Na home o link ativo acompanha a seção na tela; nas outras páginas é o da própria página
  const [activeSection, setActiveSection] = useState("#inicio");
  const isActive = (link: (typeof links)[number]) => (home ? link.hash === activeSection : pathname === link.href || pathname.startsWith(`${link.href}/`));
  const [scrolled, setScrolled] = useState(false);

  // Entrada: logo, links e botão descem quando a tela de load se abre (na hora, se ela já abriu)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", (context) =>
        onLoaderDone(() =>
          context.add(() => {
            gsap
              .timeline({
                defaults: { ease: "power3.out", duration: 0.6 },
                // Ao final, devolve transform ao CSS (hover e layout continuam funcionando normalmente)
                onComplete: () => gsap.set("[data-intro^='nav']", { clearProps: "transform" }),
              })
              .fromTo("[data-intro='nav-logo']", { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
              .fromTo("[data-intro='nav-link']", { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, stagger: 0.06 }, 0.15)
              .fromTo("[data-intro='nav-cta']", { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0 }, 0.4);
          }),
        ),
      );
      // Movimento reduzido: mostra direto
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-intro^='nav']", { autoAlpha: 1 });
      });
    },
    { scope: header },
  );

  // Na home, o link ativo acompanha a seção que ocupa o meio da tela
  useGSAP(() => {
    const triggers = links.flatMap(({ hash }) => {
      if (!home) return [];
      const section = findVisible(hash);
      if (!section) return [];
      return ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        // Recalcula depois das seções fixadas (pin), que aumentam a altura da página
        refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) setActiveSection(hash);
        },
      });
    });
    // Fora do topo, a barra ganha um fundo de vidro escuro para não embolar com o conteúdo
    const scroll = ScrollTrigger.create({
      start: 80,
      // Vai além do fim da página: no rodapé a barra continua com o fundo de vidro
      end: "+=100000",
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => {
      triggers.forEach((t) => t.kill());
      scroll.kill();
    };
  });

  return (
    <header
      ref={header}
      className={`fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color,backdrop-filter,padding] duration-500 ${
        scrolled ? "border-branco/5 bg-[#0b0a10]/70 pb-4 backdrop-blur-md lg:pb-5" : "border-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-[1600px] items-center justify-between px-6 transition-[padding] duration-500 md:px-12 lg:px-[6%] ${
          scrolled ? "pt-4 lg:pt-5" : "pt-6 lg:pt-8"
        }`}
      >
        <NavLink data-intro="nav-logo" href={home ? "#inicio" : "/"} aria-label="NAYRO — início" className="shrink-0">
          <Image
            src="/images/logo-navbar.webp"
            alt="NAYRO"
            width={2172}
            height={724}
            // Largura na tela (altura × 3): evita baixar a logo em resolução de banner
            sizes="(min-width: 768px) 156px, 132px"
            preload
            className="-my-3.5 -ml-3.5 h-11 w-auto md:-my-5 md:-ml-5 md:h-[52px]"
          />
        </NavLink>

        <ul className="hidden items-center gap-10 font-poppins text-[14px] lg:flex">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href} data-intro="nav-link" className="relative">
                <NavLink
                  href={link.href}
                  aria-current={active && !home ? "page" : undefined}
                  className={`transition-colors hover:text-branco ${
                    active ? "font-medium text-branco" : "text-branco/75"
                  }`}
                >
                  {link.label}
                </NavLink>
                {active && (
                  <span className="absolute -bottom-3 left-1/2 size-1 -translate-x-1/2 rounded-full bg-lavanda shadow-[0_0_8px_#a45bff]" />
                )}
              </li>
            );
          })}
        </ul>

        <NavLink
          data-intro="nav-cta"
          href={CONTACT_PAGE}
          className="hidden items-center gap-3 rounded-full border border-violeta/80 bg-roxo-escuro/30 px-5 py-2.5 font-poppins text-[14px] font-medium text-branco shadow-[0_0_18px_rgba(112,41,217,0.35)] backdrop-blur-sm transition hover:border-roxo-luminoso hover:shadow-[0_0_26px_rgba(164,91,255,0.5)] lg:inline-flex"
        >
          Fale com a gente
          <ArrowRight className="size-4" />
        </NavLink>

        <button
          data-intro="nav-cta"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex size-11 flex-col items-center justify-center gap-1.5 rounded-full border border-violeta/60 lg:hidden"
        >
          <span className={`h-px w-5 bg-branco transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-px w-5 bg-branco transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="mx-6 mt-4 rounded-2xl border border-violeta/30 bg-preto/90 p-6 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-4 font-poppins">
            {links.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={isActive(link) ? "text-branco" : "text-branco/75"}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <NavLink
            href={CONTACT_PAGE}
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex items-center gap-3 rounded-full border border-violeta px-5 py-2.5 font-poppins text-sm font-medium"
          >
            Fale com a gente <ArrowRight className="size-4" />
          </NavLink>
        </div>
      )}
    </header>
  );
}
