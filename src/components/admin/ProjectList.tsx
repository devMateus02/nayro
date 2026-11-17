"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteProject, moveProject, toggleProject } from "@/app/admin/actions";
import { categoryLabel, projectHref, type Project } from "@/lib/projects";
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeOffIcon, PencilIcon, StarIcon, TrashIcon } from "../icons";
import ProjectScreen from "../projetos/ProjectScreen";

export type AdminProjectRow = Pick<Project, "slug" | "name" | "description" | "categories" | "cover" | "screen" | "featured"> & {
  id: string;
  published: boolean;
};

const iconButton =
  "flex size-9 items-center justify-center rounded-full border border-branco/15 text-branco/70 transition hover:border-roxo-luminoso hover:text-branco disabled:pointer-events-none disabled:opacity-30";

function Row({ project, first, last }: { project: AdminProjectRow; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const run = (fn: () => Promise<void>) => start(async () => fn());

  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border border-branco/10 bg-[#0e0c15]/80 p-4 transition sm:flex-row sm:items-center ${
        pending ? "opacity-60" : ""
      } ${project.published ? "" : "border-dashed"}`}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-branco/10 sm:w-40">
        <ProjectScreen project={project} sizes="160px" />
        {!project.published && (
          <span className="absolute inset-0 flex items-center justify-center bg-[#08070d]/70 font-poppins text-[11px] uppercase tracking-[0.2em] text-branco/80">
            Oculto
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-poppins text-[16px] font-semibold text-branco">{project.name}</h2>
          {project.featured && <span className="rounded-full bg-violeta/25 px-2 py-0.5 font-poppins text-[11px] text-lavanda">Destaque</span>}
        </div>
        <p className="mt-0.5 font-poppins text-[12px] text-branco/45">
          {project.categories.map(categoryLabel).join(" · ")} · /projetos/{project.slug}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[14px] text-branco/65">{project.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Subir na ordem" disabled={first || pending} onClick={() => run(() => moveProject(project.id, -1))} className={iconButton}>
          <ChevronUpIcon className="size-4" />
        </button>
        <button type="button" aria-label="Descer na ordem" disabled={last || pending} onClick={() => run(() => moveProject(project.id, 1))} className={iconButton}>
          <ChevronDownIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label={project.featured ? "Tirar dos destaques da home" : "Destacar na home"}
          aria-pressed={project.featured}
          title={project.featured ? "Destaque na home" : "Destacar na home"}
          disabled={pending}
          onClick={() => run(() => toggleProject(project.id, "featured"))}
          className={`${iconButton} ${project.featured ? "border-violeta/60 bg-violeta/20 text-lavanda" : ""}`}
        >
          <StarIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label={project.published ? "Ocultar do site" : "Publicar no site"}
          title={project.published ? "Publicado (clique para ocultar)" : "Oculto (clique para publicar)"}
          disabled={pending}
          onClick={() => run(() => toggleProject(project.id, "published"))}
          className={iconButton}
        >
          {project.published ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
        </button>
        <Link href={`/admin/projetos/${project.id}`} aria-label={`Editar ${project.name}`} className={iconButton}>
          <PencilIcon className="size-4" />
        </Link>
        {project.published && (
          <Link
            href={projectHref(project.slug)}
            target="_blank"
            className="font-poppins text-[12px] text-branco/50 underline-offset-4 transition-colors hover:text-branco hover:underline"
          >
            Ver
          </Link>
        )}
        {confirming ? (
          <span className="flex items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => deleteProject(project.id))}
              className="rounded-full bg-red-500/80 px-3 py-1.5 font-poppins text-[12px] font-semibold text-branco transition hover:bg-red-500"
            >
              Excluir de vez
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="font-poppins text-[12px] text-branco/60 hover:text-branco">
              Cancelar
            </button>
          </span>
        ) : (
          <button
            type="button"
            aria-label={`Excluir ${project.name}`}
            disabled={pending}
            onClick={() => setConfirming(true)}
            className={`${iconButton} hover:border-red-400 hover:text-red-300`}
          >
            <TrashIcon className="size-4" />
          </button>
        )}
      </div>
    </li>
  );
}

export default function ProjectList({ projects }: { projects: AdminProjectRow[] }) {
  if (!projects.length) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-branco/15 px-6 py-16 text-center">
        <p className="font-poppins text-lg font-semibold text-branco">Nenhum projeto ainda</p>
        <p className="mt-1.5 text-[14px] text-branco/60">Clique em &quot;Novo projeto&quot; para cadastrar o primeiro.</p>
      </div>
    );
  }
  return (
    <ul className="mt-8 space-y-3">
      {projects.map((p, i) => (
        <Row key={p.id} project={p} first={i === 0} last={i === projects.length - 1} />
      ))}
    </ul>
  );
}
