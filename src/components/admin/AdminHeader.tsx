import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { LogoutIcon } from "../icons";

const TABS = [
  { id: "projetos", label: "Projetos", href: "/admin" },
  { id: "servicos", label: "Serviços", href: "/admin/servicos" },
] as const;

/** Topo do painel: logo, abas (projetos e serviços), link para o site e sair */
export default function AdminHeader({ email, section }: { email: string; section: (typeof TABS)[number]["id"] }) {
  return (
    <header className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 border-b border-branco/10 pb-6">
      <Link href="/admin" className="flex items-center gap-3">
        <Image src="/images/logo-navbar.webp" alt="NAYRO" width={2172} height={724} sizes="120px" loading="eager" className="-my-3 -ml-3 h-10 w-auto" />
        <span className="rounded-full border border-violeta/40 px-2.5 py-0.5 font-poppins text-[11px] uppercase tracking-[0.2em] text-lavanda">Painel</span>
      </Link>
      <nav aria-label="Painel" className="order-last flex w-full gap-1 rounded-full border border-branco/10 bg-[#0e0c15]/80 p-1 sm:order-none sm:w-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={tab.id === section ? "page" : undefined}
            className={`flex-1 rounded-full px-5 py-1.5 text-center font-poppins text-[13px] transition sm:flex-none ${
              tab.id === section ? "bg-violeta text-branco shadow-[0_0_18px_rgba(112,41,217,0.4)]" : "text-branco/65 hover:text-branco"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <span className="hidden font-poppins text-[13px] text-branco/50 sm:inline">{email}</span>
        <Link href="/" target="_blank" className="font-poppins text-[13px] text-branco/70 transition-colors hover:text-branco">
          Ver site
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-branco/20 px-4 py-1.5 font-poppins text-[13px] text-branco/80 transition hover:border-roxo-luminoso hover:text-branco"
          >
            <LogoutIcon className="size-4" />
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
