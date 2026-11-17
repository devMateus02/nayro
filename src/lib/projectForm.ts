// Formulário de projeto do painel: campos, limites e validação (usados na tela e na action)
import { isProjectImage, isProjectVideo } from "./media";
import { PROJECT_CATEGORIES } from "./projects";

export const PROJECT_LIMITS = {
  name: 80,
  slug: 80,
  description: 220,
  content: 6000,
  tags: 8,
  tag: 30,
  client: 80,
  url: 300,
};

export type ProjectFields = {
  name: string;
  slug: string;
  description: string;
  content: string;
  categories: string[];
  /** Separadas por vírgula */
  tags: string;
  client: string;
  year: string;
  url: string;
  cover: string;
  /** Vídeo enviado pelo painel (/media/....webm) */
  video: string;
  featured: boolean;
  published: boolean;
};

export type ProjectErrors = Partial<Record<keyof ProjectFields, string>>;

export type ProjectFormState = { status: "idle" } | { status: "invalid"; errors: ProjectErrors; message?: string };

/** Nome → endereço: "Mundo Afora!" → "mundo-afora" */
export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PROJECT_LIMITS.slug);

export const splitTags = (tags: string) =>
  tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export function validateProject(v: ProjectFields): ProjectErrors {
  const errors: ProjectErrors = {};
  const year = Number(v.year);
  const tags = splitTags(v.tags);

  if (v.name.length < 2) errors.name = "Dê um nome ao projeto.";
  else if (v.name.length > PROJECT_LIMITS.name) errors.name = `Use até ${PROJECT_LIMITS.name} caracteres.`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug)) errors.slug = "Use só letras minúsculas, números e hífens (ex.: meu-projeto).";
  else if (v.slug.length > PROJECT_LIMITS.slug) errors.slug = `Use até ${PROJECT_LIMITS.slug} caracteres.`;
  if (v.description.length < 10) errors.description = "Escreva um resumo de pelo menos 10 caracteres.";
  else if (v.description.length > PROJECT_LIMITS.description) errors.description = `Use até ${PROJECT_LIMITS.description} caracteres.`;
  if (v.content.length > PROJECT_LIMITS.content) errors.content = `Use até ${PROJECT_LIMITS.content} caracteres.`;
  if (!v.categories.length) errors.categories = "Escolha pelo menos uma categoria.";
  else if (!v.categories.every((c) => PROJECT_CATEGORIES.some((x) => x.id === c))) errors.categories = "Categoria inválida.";
  if (tags.length > PROJECT_LIMITS.tags) errors.tags = `Use até ${PROJECT_LIMITS.tags} tags.`;
  else if (tags.some((t) => t.length > PROJECT_LIMITS.tag)) errors.tags = `Cada tag pode ter até ${PROJECT_LIMITS.tag} caracteres.`;
  if (v.client.length > PROJECT_LIMITS.client) errors.client = `Use até ${PROJECT_LIMITS.client} caracteres.`;
  if (v.year && (!Number.isInteger(year) || year < 2000 || year > 2100)) errors.year = "Informe um ano válido (ex.: 2025).";
  if (v.url) {
    let ok = false;
    try {
      ok = ["http:", "https:"].includes(new URL(v.url).protocol);
    } catch {}
    if (!ok || v.url.length > PROJECT_LIMITS.url) errors.url = "Informe o link completo (ex.: https://site.com.br).";
  }
  if (v.cover && !isProjectImage(v.cover)) errors.cover = "Imagem de capa inválida.";
  if (v.video && !isProjectVideo(v.video)) errors.video = "Vídeo inválido. Envie o arquivo de novo.";
  return errors;
}
