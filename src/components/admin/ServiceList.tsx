"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteService, moveService, toggleService } from "@/app/admin/services-actions";
import type { ServiceIcon as IconId } from "@/lib/services";
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeOffIcon, PencilIcon, StarIcon, TrashIcon } from "../icons";
import ServiceIcon from "../ServiceIcon";

export type AdminServiceRow = { id: string; name: string; summary: string; icon: IconId; featured: boolean; published: boolean };

const iconButton =
  "flex size-9 items-center justify-center rounded-full border border-branco/15 text-branco/70 transition hover:border-roxo-luminoso hover:text-branco disabled:pointer-events-none disabled:opacity-30";

function Row({ service, first, last }: { service: AdminServiceRow; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const run = (fn: () => Promise<void>) => start(async () => fn());

  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border border-branco/10 bg-[#0e0c15]/80 p-4 transition sm:flex-row sm:items-center ${pending ? "opacity-60" : ""} ${
        service.published ? "" : "border-dashed opacity-75"
      }`}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-violeta/40 bg-[linear-gradient(140deg,rgba(112,41,217,0.45),rgba(33,16,57,0.6))] text-lavanda">
        <ServiceIcon icon={service.icon} className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-poppins text-[16px] font-semibold text-branco">{service.name}</h2>
          {service.featured && <span className="rounded-full bg-violeta/25 px-2 py-0.5 font-poppins text-[11px] text-lavanda">Destaque</span>}
          {!service.published && <span className="rounded-full border border-branco/20 px-2 py-0.5 font-poppins text-[11px] text-branco/60">Oculto</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-[14px] text-branco/65">{service.summary}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Subir na ordem" disabled={first || pending} onClick={() => run(() => moveService(service.id, -1))} className={iconButton}>
          <ChevronUpIcon className="size-4" />
        </button>
        <button type="button" aria-label="Descer na ordem" disabled={last || pending} onClick={() => run(() => moveService(service.id, 1))} className={iconButton}>
          <ChevronDownIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label={service.featured ? "Tirar dos destaques da home" : "Destacar na home"}
          aria-pressed={service.featured}
          title={service.featured ? "Destaque na home" : "Destacar na home"}
          disabled={pending}
          onClick={() => run(() => toggleService(service.id, "featured"))}
          className={`${iconButton} ${service.featured ? "border-violeta/60 bg-violeta/20 text-lavanda" : ""}`}
        >
          <StarIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label={service.published ? "Ocultar do site" : "Publicar no site"}
          title={service.published ? "Publicado (clique para ocultar)" : "Oculto (clique para publicar)"}
          disabled={pending}
          onClick={() => run(() => toggleService(service.id, "published"))}
          className={iconButton}
        >
          {service.published ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
        </button>
        <Link href={`/admin/servicos/${service.id}`} aria-label={`Editar ${service.name}`} className={iconButton}>
          <PencilIcon className="size-4" />
        </Link>
        {confirming ? (
          <span className="flex items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => deleteService(service.id))}
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
            aria-label={`Excluir ${service.name}`}
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

export default function ServiceList({ services }: { services: AdminServiceRow[] }) {
  if (!services.length) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-branco/15 px-6 py-16 text-center">
        <p className="font-poppins text-lg font-semibold text-branco">Nenhum serviço ainda</p>
        <p className="mt-1.5 text-[14px] text-branco/60">Clique em &quot;Novo serviço&quot; para cadastrar o primeiro.</p>
      </div>
    );
  }
  return (
    <ul className="mt-8 space-y-3">
      {services.map((s, i) => (
        <Row key={s.id} service={s} first={i === 0} last={i === services.length - 1} />
      ))}
    </ul>
  );
}
