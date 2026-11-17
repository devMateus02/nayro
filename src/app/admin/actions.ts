"use server";

import { randomUUID } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { LOGIN_PATH, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MEDIA_BUCKET, MEDIA_PREFIX, MEDIA_UPLOAD_PREFIX, VIDEO_LIMITS, VIDEO_TYPES, mediaPath, validSize } from "@/lib/media";
import { splitTags, validateProject, type ProjectFields, type ProjectFormState } from "@/lib/projectForm";
import { PROJECTS_TAG } from "@/lib/projects-data";
import { adminEmails, supabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// ── Login ────────────────────────────────────────────────────────────────────

export type LoginState = { error?: string };

export async function signIn(_prev: LoginState, data: FormData): Promise<LoginState> {
  if (!supabaseConfigured) return { error: "O Supabase ainda não está configurado no .env." };
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const password = String(data.get("password") ?? "");
  if (!email || !password) return { error: "Informe e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha incorretos." };
  if (!adminEmails().includes(email)) {
    await supabase.auth.signOut();
    return { error: "Este e-mail não tem acesso ao painel." };
  }
  redirect("/admin");
}

export async function signOut() {
  if (supabaseConfigured) await (await createClient()).auth.signOut();
  redirect(LOGIN_PATH);
}

// ── Projetos ─────────────────────────────────────────────────────────────────

function requireDb() {
  if (!db) throw new Error("Banco não configurado (DATABASE_URL).");
  return db;
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

/** Apaga do Storage as imagens e vídeos que deixaram de ser usados (sem travar o salvamento se falhar) */
async function removeMedia(srcs: string[]) {
  const paths = srcs.map(mediaPath).filter((p): p is string => Boolean(p));
  const storage = createAdminClient()?.storage;
  if (!paths.length || !storage) return;
  const { error } = await storage.from(MEDIA_BUCKET).remove(paths);
  if (error) console.error("Painel: falha ao apagar arquivos", error.message);
}

/** Cria ou atualiza um projeto (id null = novo) */
export async function saveProject(id: string | null, _prev: ProjectFormState, data: FormData): Promise<ProjectFormState> {
  await requireAdmin();
  const prisma = requireDb();

  const values: ProjectFields = {
    name: text(data, "name"),
    slug: text(data, "slug"),
    description: text(data, "description"),
    content: text(data, "content").replace(/\r\n/g, "\n"),
    categories: data.getAll("categories").map(String),
    tags: text(data, "tags"),
    client: text(data, "client"),
    year: text(data, "year"),
    url: text(data, "url"),
    cover: text(data, "cover"),
    video: text(data, "video"),
    featured: data.get("featured") === "on",
    published: data.get("published") === "on",
  };

  const errors = validateProject(values);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  const record = {
    name: values.name,
    slug: values.slug,
    description: values.description,
    content: values.content,
    categories: values.categories,
    tags: splitTags(values.tags),
    client: values.client || null,
    year: values.year ? Number(values.year) : null,
    url: values.url || null,
    cover: values.cover || null,
    video: values.video || null,
    featured: values.featured,
    published: values.published,
  };

  try {
    if (id) {
      const before = await prisma.project.findUnique({ where: { id }, select: { cover: true, video: true } });
      if (!before) return { status: "invalid", errors: {}, message: "Este projeto não existe mais." };
      await prisma.project.update({ where: { id }, data: record });
      const kept = new Set([record.cover, record.video]);
      await removeMedia([before.cover, before.video].filter((src): src is string => Boolean(src) && !kept.has(src)));
    } else {
      // Projeto novo entra no topo da lista
      const first = await prisma.project.aggregate({ _min: { position: true } });
      await prisma.project.create({ data: { ...record, position: (first._min.position ?? 0) - 1 } });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "invalid", errors: { slug: "Já existe um projeto com este endereço." } };
    }
    console.error("Painel: falha ao salvar projeto", error);
    return { status: "invalid", errors: {}, message: "Não foi possível salvar. Tente de novo em instantes." };
  }

  updateTag(PROJECTS_TAG);
  redirect("/admin");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const prisma = requireDb();
  const project = await prisma.project.delete({ where: { id } }).catch(() => null);
  if (project) await removeMedia([project.cover, project.video].filter((src): src is string => Boolean(src)));
  updateTag(PROJECTS_TAG);
  refresh();
}

/** Liga/desliga "publicado" ou "destaque na home" */
export async function toggleProject(id: string, field: "published" | "featured") {
  await requireAdmin();
  const prisma = requireDb();
  const project = await prisma.project.findUnique({ where: { id }, select: { published: true, featured: true } });
  if (!project) return;
  await prisma.project.update({ where: { id }, data: field === "published" ? { published: !project.published } : { featured: !project.featured } });
  updateTag(PROJECTS_TAG);
  refresh();
}

/** Sobe (-1) ou desce (+1) o projeto na ordem do site */
export async function moveProject(id: string, direction: -1 | 1) {
  await requireAdmin();
  const prisma = requireDb();
  const list = await prisma.project.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const from = list.findIndex((p) => p.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
  // Regrava a ordem inteira (a lista é pequena) para não depender de posições repetidas
  await prisma.$transaction(list.map((p, position) => prisma.project.update({ where: { id: p.id }, data: { position } })));
  updateTag(PROJECTS_TAG);
  refresh();
}

// ── Imagens e vídeo ──────────────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/avif": "avif" };
let bucketReady = false;

/** Garante o bucket público com os formatos aceitos (cria na primeira vez; atualiza se for de uma versão antiga) */
async function ensureBucket(supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  if (bucketReady) return true;
  const config = {
    public: true,
    fileSizeLimit: VIDEO_LIMITS.bytes,
    allowedMimeTypes: [...Object.keys(IMAGE_TYPES), ...Object.keys(VIDEO_TYPES)],
  };
  const { data, error } = await supabase.storage.getBucket(MEDIA_BUCKET);
  const result = error
    ? await supabase.storage.createBucket(MEDIA_BUCKET, config)
    : config.allowedMimeTypes.every((type) => data.allowed_mime_types?.includes(type))
      ? { error: null }
      : await supabase.storage.updateBucket(MEDIA_BUCKET, config);
  if (result.error && !/exist/i.test(result.error.message)) {
    console.error("Painel: falha ao preparar o bucket", result.error.message);
    return false;
  }
  bucketReady = true;
  return true;
}

/** Caminho novo no bucket; com as medidas no nome quando o painel as informa (ver mediaSize) */
const newPath = (ext: string, width?: unknown, height?: unknown) =>
  `${new Date().getFullYear()}/${randomUUID()}${validSize(width, height) ? `-${width}x${height}` : ""}.${ext}`;

type UploadResult = { src: string } | { error: string };

/** Recebe uma imagem do painel (já convertida para WebP no navegador) e guarda no Storage */
export async function uploadImage(data: FormData): Promise<UploadResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { error: "Falta a chave secreta do Supabase (SUPABASE_SECRET_KEY) no .env." };

  const file = data.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Nenhuma imagem recebida." };
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: "Formato não aceito. Use WebP, JPG, PNG ou AVIF." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Imagem grande demais (máximo de 5 MB)." };
  if (!(await ensureBucket(supabase))) return { error: "Não foi possível preparar o armazenamento de arquivos." };

  const path = newPath(ext, Number(data.get("width")), Number(data.get("height")));
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) {
    console.error("Painel: falha no envio da imagem", error.message);
    return { error: "Não foi possível enviar a imagem. Tente de novo." };
  }
  return { src: `${MEDIA_PREFIX}${path}` };
}

type VideoUploadTicket = { src: string; upload: string } | { error: string };

/**
 * Libera o envio de um vídeo (já convertido para WebM no navegador). O arquivo é grande demais para passar pela
 * action, então o painel envia direto para o Storage com um token de uso único, pelo endereço do próprio site.
 */
export async function createVideoUpload(type: string, size: number, width?: number, height?: number): Promise<VideoUploadTicket> {
  await requireAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { error: "Falta a chave secreta do Supabase (SUPABASE_SECRET_KEY) no .env." };
  const ext = VIDEO_TYPES[type];
  if (!ext) return { error: "Formato não aceito. Envie um vídeo MP4, MOV ou WebM." };
  if (!(size > 0) || size > VIDEO_LIMITS.bytes) return { error: "O vídeo passou de 50 MB. Envie um vídeo mais curto." };
  if (!(await ensureBucket(supabase))) return { error: "Não foi possível preparar o armazenamento de arquivos." };

  const path = newPath(ext, width, height);
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error) {
    console.error("Painel: falha ao liberar envio de vídeo", error.message);
    return { error: "Não foi possível preparar o envio. Tente de novo." };
  }
  return { src: `${MEDIA_PREFIX}${path}`, upload: `${MEDIA_UPLOAD_PREFIX}${path}?token=${encodeURIComponent(data.token)}` };
}

/** Imagem ou vídeo enviado e depois descartado no formulário (antes de salvar) */
export async function discardMedia(src: string) {
  await requireAdmin();
  if (!db) return;
  // Só apaga se nenhum projeto salvo usa o arquivo
  const used = await db.project.count({ where: { OR: [{ cover: src }, { video: src }] } });
  if (!used) await removeMedia([src]);
}
