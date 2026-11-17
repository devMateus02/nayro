"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, type FormEvent, type ReactNode } from "react";
import { discardMedia, saveProject } from "@/app/admin/actions";
import { PROJECT_LIMITS, slugify, validateProject, type ProjectErrors, type ProjectFields, type ProjectFormState } from "@/lib/projectForm";
import { PROJECT_CATEGORIES } from "@/lib/projects";
import { videoType } from "@/lib/media";
import { ArrowLeft, CloseIcon } from "../icons";
import ImageUpload from "./ImageUpload";
import VideoUpload from "./VideoUpload";

const input =
  "mt-2 w-full rounded-xl border bg-[#0b0a10] px-4 py-3 font-poppins text-[15px] text-branco outline-none transition placeholder:text-branco/30 focus:border-roxo-luminoso focus:shadow-[0_0_0_3px_rgba(164,91,255,0.18)]";
const border = (error?: string) => (error ? "border-red-400/60" : "border-branco/15");

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <span className="font-poppins text-[13px] font-medium text-branco/85">{label}</span>
      {hint && <span className="ml-2 text-[12px] text-branco/40">{hint}</span>}
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function Thumb({ src, video = false, onRemove }: { src: string; video?: boolean; onRemove: () => void }) {
  return (
    <div className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-branco/10 bg-[#0b0a10]">
      {video ? (
        <video muted loop autoPlay playsInline controls preload="metadata" className="size-full object-cover object-top">
          <source src={src} type={videoType(src)} />
        </video>
      ) : (
        <Image src={src} alt="" fill sizes="240px" className="object-cover object-top" />
      )}
      <div className="absolute right-2 top-2 flex gap-1.5">
        <button
          type="button"
          onClick={onRemove}
          aria-label={video ? "Remover vídeo" : "Remover imagem"}
          className="flex size-8 items-center justify-center rounded-full bg-[#08070d]/80 text-branco backdrop-blur-sm transition hover:bg-red-500/80"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Cadastro e edição de projeto (id null = novo) */
export default function ProjectForm({ id, initial }: { id: string | null; initial: ProjectFields }) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProject.bind(null, id), { status: "idle" });
  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState<ProjectErrors | null>(null);
  // Endereço segue o nome até ser editado à mão (só em projeto novo)
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  // Arquivos enviados nesta edição: se forem removidos antes de salvar, saem do Storage
  const uploaded = useRef(new Set<string>());
  const form = useRef<HTMLFormElement>(null);

  const errors = clientErrors ?? (state.status === "invalid" ? state.errors : {});
  const set = <K extends keyof ProjectFields>(key: K, value: ProjectFields[K]) => setValues((v) => ({ ...v, [key]: value }));

  const removeUpload = (src: string) => {
    if (uploaded.current.has(src)) {
      uploaded.current.delete(src);
      void discardMedia(src);
    }
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const found = validateProject(values);
    if (Object.keys(found).length) {
      e.preventDefault();
      setClientErrors(found);
      // Leva até o primeiro campo com erro
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setClientErrors(null);
  }

  return (
    <form ref={form} action={action} onSubmit={onSubmit} noValidate className="space-y-10">
      <Link href="/admin" className="inline-flex items-center gap-2 font-poppins text-[13px] text-branco/60 transition-colors hover:text-branco">
        <ArrowLeft className="size-4" />
        Voltar aos projetos
      </Link>

      <section className="grid grid-cols-1 gap-6 rounded-2xl border border-branco/10 bg-[#0e0c15]/80 p-6 md:grid-cols-2 md:p-8">
        <h2 className="font-poppins text-lg font-semibold text-branco md:col-span-2">Informações</h2>
        <Field label="Nome do projeto" error={errors.name}>
          <input
            name="name"
            value={values.name}
            maxLength={PROJECT_LIMITS.name}
            aria-invalid={Boolean(errors.name)}
            onChange={(e) => {
              const name = e.target.value;
              setValues((v) => ({ ...v, name, slug: slugTouched ? v.slug : slugify(name) }));
            }}
            className={`${input} ${border(errors.name)}`}
          />
        </Field>
        <Field label="Endereço da página" hint={`/projetos/${values.slug || "…"}`} error={errors.slug}>
          <input
            name="slug"
            value={values.slug}
            maxLength={PROJECT_LIMITS.slug}
            aria-invalid={Boolean(errors.slug)}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            className={`${input} ${border(errors.slug)}`}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Resumo" hint={`${values.description.length}/${PROJECT_LIMITS.description} · aparece nos cartões`} error={errors.description}>
            <textarea
              name="description"
              rows={2}
              value={values.description}
              maxLength={PROJECT_LIMITS.description}
              aria-invalid={Boolean(errors.description)}
              onChange={(e) => set("description", e.target.value)}
              className={`${input} ${border(errors.description)} resize-y`}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Texto da página do projeto" hint="separe os parágrafos com uma linha em branco" error={errors.content}>
            <textarea
              name="content"
              rows={8}
              value={values.content}
              maxLength={PROJECT_LIMITS.content}
              aria-invalid={Boolean(errors.content)}
              onChange={(e) => set("content", e.target.value)}
              className={`${input} ${border(errors.content)} resize-y leading-relaxed`}
            />
          </Field>
        </div>
        <fieldset className="md:col-span-2">
          <legend className="font-poppins text-[13px] font-medium text-branco/85">Categorias</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROJECT_CATEGORIES.map(({ id: cat, label }) => {
              const checked = values.categories.includes(cat);
              return (
                <label
                  key={cat}
                  className={`cursor-pointer rounded-full border px-4 py-2 font-poppins text-[13px] transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-roxo-luminoso ${
                    checked ? "border-transparent bg-violeta text-branco" : "border-branco/20 text-branco/75 hover:border-roxo-luminoso/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat}
                    checked={checked}
                    aria-invalid={Boolean(errors.categories)}
                    onChange={() => set("categories", checked ? values.categories.filter((c) => c !== cat) : [...values.categories, cat])}
                    className="sr-only"
                  />
                  {label}
                </label>
              );
            })}
          </div>
          {errors.categories && (
            <p role="alert" className="mt-1.5 text-[13px] text-red-300">
              {errors.categories}
            </p>
          )}
        </fieldset>
        <Field label="Tags" hint="separadas por vírgula (ex.: Next.js, Sistema Web)" error={errors.tags}>
          <input name="tags" value={values.tags} aria-invalid={Boolean(errors.tags)} onChange={(e) => set("tags", e.target.value)} className={`${input} ${border(errors.tags)}`} />
        </Field>
        <Field label="Cliente" hint="opcional" error={errors.client}>
          <input
            name="client"
            value={values.client}
            maxLength={PROJECT_LIMITS.client}
            aria-invalid={Boolean(errors.client)}
            onChange={(e) => set("client", e.target.value)}
            className={`${input} ${border(errors.client)}`}
          />
        </Field>
        <Field label="Ano" hint="opcional" error={errors.year}>
          <input
            name="year"
            inputMode="numeric"
            value={values.year}
            maxLength={4}
            aria-invalid={Boolean(errors.year)}
            onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))}
            className={`${input} ${border(errors.year)}`}
          />
        </Field>
        <Field label="Link do projeto no ar" hint="opcional" error={errors.url}>
          <input
            name="url"
            type="url"
            placeholder="https://"
            value={values.url}
            aria-invalid={Boolean(errors.url)}
            onChange={(e) => set("url", e.target.value.trim())}
            className={`${input} ${border(errors.url)}`}
          />
        </Field>
      </section>

      <section className="space-y-8 rounded-2xl border border-branco/10 bg-[#0e0c15]/80 p-6 md:p-8">
        <h2 className="font-poppins text-lg font-semibold text-branco">Capa e vídeo</h2>

        <div>
          <p className="font-poppins text-[13px] font-medium text-branco/85">Capa</p>
          <p className="mt-1 text-[13px] text-branco/45">Print da tela inicial do site, sem a barra do navegador. Qualquer formato funciona: no notebook da home ela aparece inteira. Sem capa, o site mostra uma tela ilustrativa.</p>
          <input type="hidden" name="cover" value={values.cover} />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.cover && (
              <Thumb
                src={values.cover}
                onRemove={() => {
                  removeUpload(values.cover);
                  set("cover", "");
                }}
              />
            )}
          </div>
          <div className="mt-4">
            <ImageUpload
              label={values.cover ? "Trocar capa" : "Enviar capa"}
              onUploaded={(src) => {
                uploaded.current.add(src);
                if (values.cover) removeUpload(values.cover);
                set("cover", src);
              }}
            />
          </div>
          {errors.cover && <p className="mt-1.5 text-[13px] text-red-300">{errors.cover}</p>}
        </div>

        <div>
          <p className="font-poppins text-[13px] font-medium text-branco/85">Vídeo</p>
          <p className="mt-1 text-[13px] text-branco/45">
            Uma gravação de tela do projeto, de 20 a 60 segundos (até 3 minutos). Toca sozinho e sem som no quadro de navegador da página do
            projeto, que segue o formato do vídeo, com a capa aparecendo enquanto carrega. As faixas pretas da gravação são removidas. Pode enviar MP4 ou MOV: ele é convertido para WebM aqui mesmo, antes do envio.
          </p>
          <input type="hidden" name="video" value={values.video} />
          {values.video && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Thumb
                src={values.video}
                video
                onRemove={() => {
                  removeUpload(values.video);
                  set("video", "");
                }}
              />
            </div>
          )}
          <div className="mt-4">
            <VideoUpload
              label={values.video ? "Trocar vídeo" : "Enviar vídeo"}
              onUploaded={(src) => {
                uploaded.current.add(src);
                if (values.video) removeUpload(values.video);
                set("video", src);
              }}
            />
          </div>
          {errors.video && <p className="mt-1.5 text-[13px] text-red-300">{errors.video}</p>}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-branco/10 bg-[#0e0c15]/80 p-6 md:p-8">
        <h2 className="font-poppins text-lg font-semibold text-branco">Exibição</h2>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="published" checked={values.published} onChange={(e) => set("published", e.target.checked)} className="mt-1 size-4 accent-violeta" />
          <span>
            <span className="block font-poppins text-[14px] text-branco">Publicado</span>
            <span className="block text-[13px] text-branco/50">Desmarcado, o projeto fica salvo mas não aparece no site.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="featured" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-1 size-4 accent-violeta" />
          <span>
            <span className="block font-poppins text-[14px] text-branco">Destaque na home</span>
            <span className="block text-[13px] text-branco/50">Aparece no carrossel do MacBook na página inicial.</span>
          </span>
        </label>
      </section>

      {state.status === "invalid" && state.message && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-200">
          {state.message}
        </p>
      )}
      {Object.keys(errors).length > 0 && <p className="text-[14px] text-red-300">Confira os campos marcados acima.</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-violeta px-8 py-3 font-poppins text-sm font-semibold text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] disabled:opacity-60"
        >
          {pending ? "Salvando…" : id ? "Salvar alterações" : "Criar projeto"}
        </button>
        <Link href="/admin" className="font-poppins text-sm text-branco/60 transition-colors hover:text-branco">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
