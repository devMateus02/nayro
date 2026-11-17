import AdminHeader from "@/components/admin/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";
import SetupNotice, { missingSetup } from "@/components/admin/SetupNotice";
import { requireAdmin } from "@/lib/auth";
import type { ProjectFields } from "@/lib/projectForm";

const EMPTY: ProjectFields = {
  name: "",
  slug: "",
  description: "",
  content: "",
  categories: [],
  tags: "",
  client: "",
  year: String(new Date().getFullYear()),
  url: "",
  cover: "",
  video: "",
  featured: false,
  published: true,
};

// Depende da sessão do usuário: a navegação pode esperar o servidor
export const instant = false;

export default async function NewProjectPage() {
  const missing = missingSetup();
  if (missing) return <SetupNotice missing={missing} />;
  const admin = await requireAdmin();

  return (
    <>
      <AdminHeader email={admin.email} section="projetos" />
      <main className="mx-auto mt-10 max-w-[900px]">
        <h1 className="mb-6 font-poppins text-[28px] font-semibold tracking-[-0.02em] text-branco">Novo projeto</h1>
        <ProjectForm id={null} initial={EMPTY} />
      </main>
    </>
  );
}
