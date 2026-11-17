import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";
import SetupNotice, { missingSetup } from "@/components/admin/SetupNotice";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Depende da sessão do usuário: a navegação pode esperar o servidor
export const instant = false;

export default async function EditProjectPage({ params }: PageProps<"/admin/projetos/[id]">) {
  const missing = missingSetup();
  if (missing || !db) return <SetupNotice missing={missing ?? []} />;
  const admin = await requireAdmin();

  const { id } = await params;
  const project = UUID.test(id) ? await db.project.findUnique({ where: { id } }) : null;
  if (!project) notFound();

  return (
    <>
      <AdminHeader email={admin.email} section="projetos" />
      <main className="mx-auto mt-10 max-w-[900px]">
        <h1 className="mb-6 font-poppins text-[28px] font-semibold tracking-[-0.02em] text-branco">Editar: {project.name}</h1>
        <ProjectForm
          id={project.id}
          initial={{
            name: project.name,
            slug: project.slug,
            description: project.description,
            content: project.content,
            categories: project.categories,
            tags: project.tags.join(", "),
            client: project.client ?? "",
            year: project.year ? String(project.year) : "",
            url: project.url ?? "",
            cover: project.cover ?? "",
            video: project.video ?? "",
            featured: project.featured,
            published: project.published,
          }}
        />
      </main>
    </>
  );
}
