import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import ProjectList, { type AdminProjectRow } from "@/components/admin/ProjectList";
import SetupNotice, { missingSetup } from "@/components/admin/SetupNotice";
import { PlusIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ProjectCategory, ProjectScreenSpec } from "@/lib/projects";

// Depende da sessão do usuário: a navegação pode esperar o servidor
export const instant = false;

export default async function AdminPage() {
  const missing = missingSetup();
  if (missing || !db) return <SetupNotice missing={missing ?? []} />;
  const admin = await requireAdmin();

  const rows = await db.project.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  const projects: AdminProjectRow[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    categories: p.categories as ProjectCategory[],
    cover: p.cover,
    screen: (p.screen as ProjectScreenSpec | null) ?? null,
    published: p.published,
    featured: p.featured,
  }));

  return (
    <>
      <AdminHeader email={admin.email} section="projetos" />
      <main className="mx-auto mt-10 max-w-[1100px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-poppins text-[28px] font-semibold tracking-[-0.02em] text-branco">Projetos</h1>
            <p className="mt-1 text-[14px] text-branco/55">
              {projects.length} {projects.length === 1 ? "projeto" : "projetos"} · a ordem da lista é a ordem do site · a estrela marca os
              destaques da home
            </p>
          </div>
          <Link
            href="/admin/projetos/novo"
            className="inline-flex items-center gap-2 rounded-full bg-violeta px-5 py-2.5 font-poppins text-sm font-semibold text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea]"
          >
            <PlusIcon className="size-4" />
            Novo projeto
          </Link>
        </div>
        <ProjectList projects={projects} />
      </main>
    </>
  );
}
