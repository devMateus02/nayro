import Image from "next/image";
import Link from "next/link";
import { INSTAGRAM_LABEL, INSTAGRAM_URL, PHONE_LABEL, WHATSAPP_URL } from "@/lib/contact";
import { navHref, SECTIONS } from "@/lib/nav";
import NavLink from "./NavLink";

// Ícones de linha (traço de 1.6, no estilo dos demais ícones do site)
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const instagramIcon = (
  <svg {...iconProps} className="size-5">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </svg>
);

const whatsappIcon = (
  <svg {...iconProps} className="size-5">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M9.5 9.5c.3 1.5 1.5 3.2 3 4l1-1 2 1c-.2 1-1 1.5-2 1.5-2.5 0-5-2.5-5-5 0-1 .5-1.8 1.5-2l1 2Z" />
  </svg>
);

const socials = [
  { label: "Instagram da NAYRO", href: INSTAGRAM_URL, icon: instagramIcon },
  { label: "WhatsApp da NAYRO", href: WHATSAPP_URL, icon: whatsappIcon },
];

/** Ano atual guardado em cache: a página continua pré-renderizada (o Next não aceita new Date() direto no render) */
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

/** `home`: os links rolam até as seções da própria página; fora da home, levam até ela */
export default function Footer({ home = true }: { home?: boolean }) {
  return (
    <footer className="relative bg-[#0b0a10]">
      <div className="border-t border-branco/15">
        {/* No celular: marca, depois navegação e redes lado a lado, e o contato por último */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 md:px-8 lg:grid-cols-[1.4fr_1fr_1.3fr_auto] lg:gap-0 lg:px-12 lg:py-14">
          {/* Marca */}
          <div className="max-sm:col-span-2 lg:border-r lg:border-branco/15 lg:pr-[4vw]">
            <Image src="/images/logo-navbar.webp" alt="NAYRO" width={2172} height={724} sizes="180px" className="-my-4 -ml-4 h-[60px] w-auto" />
            <p className="mt-4 max-w-[32ch] text-[15px] leading-relaxed text-branco/75">
              Desenvolvimento de soluções digitais para negócios que querem ir além.
            </p>
          </div>

          {/* Navegação */}
          <nav aria-label="Rodapé" className="lg:px-[4vw]">
            <p className="font-poppins text-sm font-semibold uppercase tracking-wider text-branco">Navegação</p>
            <ul className="mt-4 space-y-2 text-[15px] text-branco/75">
              {SECTIONS.map(({ hash, label }) => (
                <li key={hash}>
                  <NavLink href={navHref(hash, home)} className="-my-1 inline-block py-1 transition-colors hover:text-roxo-luminoso">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contato */}
          <div className="max-sm:order-last max-sm:col-span-2 lg:border-r lg:border-branco/15 lg:pr-[4vw]">
            <p className="font-poppins text-sm font-semibold uppercase tracking-wider text-branco">Contato</p>
            <ul className="mt-4 space-y-4 text-[15px] text-branco/80">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -my-1 inline-flex items-center gap-3 py-1 transition-colors hover:text-roxo-luminoso"
                >
                  <svg {...iconProps} className="size-5 text-branco/70 group-hover:text-roxo-luminoso">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M17.5 6.5h.01" />
                  </svg>
                  {INSTAGRAM_LABEL}
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -my-1 inline-flex items-center gap-3 py-1 transition-colors hover:text-roxo-luminoso"
                >
                  <svg {...iconProps} className="size-5 text-branco/70 group-hover:text-roxo-luminoso">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    <path d="M9.5 9.5c.3 1.5 1.5 3.2 3 4l1-1 2 1c-.2 1-1 1.5-2 1.5-2.5 0-5-2.5-5-5 0-1 .5-1.8 1.5-2l1 2Z" />
                  </svg>
                  {PHONE_LABEL}
                </a>
              </li>
            </ul>
          </div>

          {/* Redes sociais */}
          <div className="lg:pl-[4vw]">
            <p className="font-poppins text-sm font-semibold uppercase tracking-wider text-branco">Redes sociais</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-lg border border-branco/40 text-branco transition hover:border-roxo-luminoso hover:text-roxo-luminoso hover:shadow-[0_0_16px_rgba(164,91,255,0.35)]"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Direitos e políticas */}
        <div className="flex flex-col gap-3 border-t border-branco/15 px-5 py-6 md:px-8 lg:px-12 text-[13px] text-branco/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© <CurrentYear /> NAYRO. Todos os direitos reservados.</p>
          {/* No celular os links quebram de linha: sem os separadores, para nenhum "|" ficar sobrando no fim da linha */}
          <p className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-3">
            <Link href="/privacidade" className="-my-1.5 inline-block py-1.5 transition-colors hover:text-branco">
              Política de Privacidade
            </Link>
            <span aria-hidden className="text-branco/30 max-sm:hidden">
              |
            </span>
            <Link href="/termos" className="-my-1.5 inline-block py-1.5 transition-colors hover:text-branco">
              Termos de Uso
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
