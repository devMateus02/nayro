import AdminHeader from "@/components/admin/AdminHeader";
import ServiceForm from "@/components/admin/ServiceForm";
import SetupNotice, { missingSetup } from "@/components/admin/SetupNotice";
import { requireAdmin } from "@/lib/auth";

// Depende da sessão do usuário: a navegação pode esperar o servidor
export const instant = false;

export default async function NewServicePage() {
  const missing = missingSetup();
  if (missing) return <SetupNotice missing={missing} />;
  const admin = await requireAdmin();

  return (
    <>
      <AdminHeader email={admin.email} section="servicos" />
      <main className="mx-auto mt-10 max-w-[900px]">
        <h1 className="mb-6 font-poppins text-[28px] font-semibold tracking-[-0.02em] text-branco">Novo serviço</h1>
        <ServiceForm id={null} initial={{ name: "", summary: "", description: "", icon: "code", featured: false, published: true }} />
      </main>
    </>
  );
}
