import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import ServiceList, { type AdminServiceRow } from "@/components/admin/ServiceList";
import SetupNotice, { missingSetup } from "@/components/admin/SetupNotice";
import { PlusIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SERVICE_ICONS, type ServiceIcon } from "@/lib/services";

// Depende da sessão do usuário: a navegação pode esperar o servidor
export const instant = false;

export default async function AdminServicesPage() {
  const missing = missingSetup();
  if (missing || !db) return <SetupNotice missing={missing ?? []} />;
  const admin = await requireAdmin();

  const rows = await db.service.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  const services: AdminServiceRow[] = rows.map((s) => ({
    id: s.id,
    name: s.name,
    summary: s.summary,
    icon: (SERVICE_ICONS.some((i) => i.id === s.icon) ? s.icon : "code") as ServiceIcon,
    featured: s.featured,
    published: s.published,
  }));
  const featured = services.filter((s) => s.featured && s.published).length;

  return (
    <>
      <AdminHeader email={admin.email} section="servicos" />
      <main className="mx-auto mt-10 max-w-[1100px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-poppins text-[28px] font-semibold tracking-[-0.02em] text-branco">Serviços</h1>
            <p className="mt-1 text-[14px] text-branco/55">
              {services.length} {services.length === 1 ? "serviço" : "serviços"} · {featured} em destaque na home · a ordem da lista é a ordem do site
            </p>
          </div>
          <Link
            href="/admin/servicos/novo"
            className="inline-flex items-center gap-2 rounded-full bg-violeta px-5 py-2.5 font-poppins text-sm font-semibold text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea]"
          >
            <PlusIcon className="size-4" />
            Novo serviço
          </Link>
        </div>
        {featured === 0 && services.length > 0 && (
          <p className="mt-6 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-[14px] text-amber-100">
            Nenhum serviço em destaque: a seção de serviços da página inicial fica escondida. Marque a estrela em pelo menos um.
          </p>
        )}
        <ServiceList services={services} />
      </main>
    </>
  );
}
