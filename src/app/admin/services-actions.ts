"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateService, type ServiceFields, type ServiceFormState } from "@/lib/serviceForm";
import { SERVICES_TAG } from "@/lib/services-data";

const SERVICES_ADMIN = "/admin/servicos";

function requireDb() {
  if (!db) throw new Error("Banco não configurado (DATABASE_URL).");
  return db;
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

/** Cria ou atualiza um serviço (id null = novo) */
export async function saveService(id: string | null, _prev: ServiceFormState, data: FormData): Promise<ServiceFormState> {
  await requireAdmin();
  const prisma = requireDb();

  const values: ServiceFields = {
    name: text(data, "name"),
    summary: text(data, "summary"),
    description: text(data, "description"),
    icon: text(data, "icon"),
    featured: data.get("featured") === "on",
    published: data.get("published") === "on",
  };
  const errors = validateService(values);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  try {
    if (id) {
      const updated = await prisma.service.updateMany({ where: { id }, data: values });
      if (!updated.count) return { status: "invalid", errors: {}, message: "Este serviço não existe mais." };
    } else {
      // Serviço novo entra no fim da lista
      const last = await prisma.service.aggregate({ _max: { position: true } });
      await prisma.service.create({ data: { ...values, position: (last._max.position ?? -1) + 1 } });
    }
  } catch (error) {
    console.error("Painel: falha ao salvar serviço", error);
    return { status: "invalid", errors: {}, message: "Não foi possível salvar. Tente de novo em instantes." };
  }

  updateTag(SERVICES_TAG);
  redirect(SERVICES_ADMIN);
}

export async function deleteService(id: string) {
  await requireAdmin();
  await requireDb().service.deleteMany({ where: { id } });
  updateTag(SERVICES_TAG);
  refresh();
}

/** Liga/desliga "publicado" ou "destaque na home" */
export async function toggleService(id: string, field: "published" | "featured") {
  await requireAdmin();
  const prisma = requireDb();
  const service = await prisma.service.findUnique({ where: { id }, select: { published: true, featured: true } });
  if (!service) return;
  await prisma.service.update({ where: { id }, data: field === "published" ? { published: !service.published } : { featured: !service.featured } });
  updateTag(SERVICES_TAG);
  refresh();
}

/** Sobe (-1) ou desce (+1) o serviço na ordem do site */
export async function moveService(id: string, direction: -1 | 1) {
  await requireAdmin();
  const prisma = requireDb();
  const list = await prisma.service.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const from = list.findIndex((s) => s.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
  await prisma.$transaction(list.map((s, position) => prisma.service.update({ where: { id: s.id }, data: { position } })));
  updateTag(SERVICES_TAG);
  refresh();
}
