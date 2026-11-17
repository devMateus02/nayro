import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ServiceForm from "@/components/admin/ServiceForm";
import SetupNotice, { missingSetup } from "@/components/admin/SetupNotice";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Depende da sessão do usuário: a navegação pode esperar o servidor
export const instant = false;

export default async function EditServicePage({ params }: PageProps<"/admin/servicos/[id]">) {
  const missing = missingSetup();
  if (missing || !db) return <SetupNotice missing={missing ?? []} />;
  const admin = await requireAdmin();

  const { id } = await params;
  const service = UUID.test(id) ? await db.service.findUnique({ where: { id } }) : null;
  if (!service) notFound();

  return (
    <>
      <AdminHeader email={admin.email} section="servicos" />
      <main className="mx-auto mt-10 max-w-[900px]">
        <h1 className="mb-6 font-poppins text-[28px] font-semibold tracking-[-0.02em] text-branco">Editar: {service.name}</h1>
        <ServiceForm
          id={service.id}
          initial={{
            name: service.name,
            summary: service.summary,
            description: service.description,
            icon: service.icon,
            featured: service.featured,
            published: service.published,
          }}
        />
      </main>
    </>
  );
}
