import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Painel",
  // O painel não aparece no Google
  robots: { index: false, follow: false },
};

/** Painel de projetos: sem tela de entrada nem animações do site */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-svh bg-[radial-gradient(70%_50%_at_50%_0%,rgba(112,41,217,0.14),transparent)] px-5 pb-20 pt-8 sm:px-8 lg:px-12">
      {/* As páginas leem a sessão (cookies) a cada acesso */}
      <Suspense fallback={<p className="pt-24 text-center font-poppins text-sm text-branco/50">Carregando…</p>}>{children}</Suspense>
    </div>
  );
}
