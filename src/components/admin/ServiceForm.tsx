"use client";

import Link from "next/link";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { saveService } from "@/app/admin/services-actions";
import { SERVICE_LIMITS, validateService, type ServiceErrors, type ServiceFields, type ServiceFormState } from "@/lib/serviceForm";
import { SERVICE_ICONS, serviceTitleLines } from "@/lib/services";
import { ArrowLeft } from "../icons";
import ServiceIcon from "../ServiceIcon";

const input =
  "mt-2 w-full rounded-xl border bg-[#0b0a10] px-4 py-3 font-poppins text-[15px] text-branco outline-none transition placeholder:text-branco/30 focus:border-roxo-luminoso focus:shadow-[0_0_0_3px_rgba(164,91,255,0.18)]";
const border = (error?: string) => (error ? "border-red-400/60" : "border-branco/15");

function ErrorText({ error }: { error?: string }) {
  return error ? (
    <p role="alert" className="mt-1.5 text-[13px] text-red-300">
      {error}
    </p>
  ) : null;
}

/** Cadastro e edição de serviço (id null = novo) */
export default function ServiceForm({ id, initial }: { id: string | null; initial: ServiceFields }) {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(saveService.bind(null, id), { status: "idle" });
  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState<ServiceErrors | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const errors = clientErrors ?? (state.status === "invalid" ? state.errors : {});
  const set = <K extends keyof ServiceFields>(key: K, value: ServiceFields[K]) => setValues((v) => ({ ...v, [key]: value }));
  const [line1, line2] = serviceTitleLines(values.name || "Nome do serviço");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const found = validateService(values);
    if (Object.keys(found).length) {
      e.preventDefault();
      setClientErrors(found);
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setClientErrors(null);
  }

  return (
    <form ref={form} action={action} onSubmit={onSubmit} noValidate className="space-y-8">
      <Link href="/admin/servicos" className="inline-flex items-center gap-2 font-poppins text-[13px] text-branco/60 transition-colors hover:text-branco">
        <ArrowLeft className="size-4" />
        Voltar aos serviços
      </Link>

      <section className="space-y-6 rounded-2xl border border-branco/10 bg-[#0e0c15]/80 p-6 md:p-8">
        <div>
          <label className="font-poppins text-[13px] font-medium text-branco/85" htmlFor="sv-name">
            Nome do serviço
          </label>
          <input
            id="sv-name"
            name="name"
            value={values.name}
            maxLength={SERVICE_LIMITS.name}
            aria-invalid={Boolean(errors.name)}
            onChange={(e) => set("name", e.target.value)}
            className={`${input} ${border(errors.name)}`}
          />
          <ErrorText error={errors.name} />
        </div>

        <div>
          <label className="font-poppins text-[13px] font-medium text-branco/85" htmlFor="sv-summary">
            Resumo
          </label>
          <span className="ml-2 text-[12px] text-branco/40">
            {values.summary.length}/{SERVICE_LIMITS.summary} · aparece no cartão da página de serviços
          </span>
          <textarea
            id="sv-summary"
            name="summary"
            rows={2}
            value={values.summary}
            maxLength={SERVICE_LIMITS.summary}
            aria-invalid={Boolean(errors.summary)}
            onChange={(e) => set("summary", e.target.value)}
            className={`${input} ${border(errors.summary)} resize-y`}
          />
          <ErrorText error={errors.summary} />
        </div>

        <div>
          <label className="font-poppins text-[13px] font-medium text-branco/85" htmlFor="sv-description">
            Texto do destaque na home
          </label>
          <span className="ml-2 text-[12px] text-branco/40">opcional · se ficar vazio, usa o resumo</span>
          <textarea
            id="sv-description"
            name="description"
            rows={3}
            value={values.description}
            maxLength={SERVICE_LIMITS.description}
            aria-invalid={Boolean(errors.description)}
            onChange={(e) => set("description", e.target.value)}
            className={`${input} ${border(errors.description)} resize-y`}
          />
          <ErrorText error={errors.description} />
        </div>

        <fieldset>
          <legend className="font-poppins text-[13px] font-medium text-branco/85">Ícone</legend>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {SERVICE_ICONS.map(({ id: icon, label }) => {
              const checked = values.icon === icon;
              return (
                <label
                  key={icon}
                  title={label}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-roxo-luminoso ${
                    checked ? "border-violeta bg-violeta/20 text-lavanda" : "border-branco/10 text-branco/60 hover:border-roxo-luminoso/60 hover:text-branco"
                  }`}
                >
                  <input type="radio" name="icon" value={icon} checked={checked} onChange={() => set("icon", icon)} className="sr-only" />
                  <ServiceIcon icon={icon} className="size-6" />
                  <span className="font-poppins text-[10px]">{label}</span>
                </label>
              );
            })}
          </div>
          <ErrorText error={errors.icon} />
        </fieldset>
      </section>

      <section className="space-y-4 rounded-2xl border border-branco/10 bg-[#0e0c15]/80 p-6 md:p-8">
        <h2 className="font-poppins text-lg font-semibold text-branco">Exibição</h2>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="published" checked={values.published} onChange={(e) => set("published", e.target.checked)} className="mt-1 size-4 accent-violeta" />
          <span>
            <span className="block font-poppins text-[14px] text-branco">Publicado</span>
            <span className="block text-[13px] text-branco/50">Aparece na página de serviços. Desmarcado, fica salvo mas oculto.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="featured" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-1 size-4 accent-violeta" />
          <span>
            <span className="block font-poppins text-[14px] text-branco">Destaque na home</span>
            <span className="block text-[13px] text-branco/50">Entra na seção &quot;O que nós oferecemos&quot; da página inicial (ideal: de 3 a 5 destaques).</span>
          </span>
        </label>

        {/* Prévia do título como aparece na home */}
        <div className="mt-2 rounded-xl border border-branco/10 bg-[#0b0a10] p-5">
          <p className="font-poppins text-[11px] uppercase tracking-[0.25em] text-branco/40">Prévia na home</p>
          <p className="mt-2 font-poppins text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-branco">
            {line1} <br />
            <span className="text-roxo-luminoso">{line2}</span>
          </p>
          <p className="mt-3 max-w-[50ch] text-[14px] leading-relaxed text-branco/70">{values.description || values.summary || "Texto do serviço."}</p>
        </div>
      </section>

      {state.status === "invalid" && state.message && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-200">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-violeta px-8 py-3 font-poppins text-sm font-semibold text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] disabled:opacity-60"
        >
          {pending ? "Salvando…" : id ? "Salvar alterações" : "Criar serviço"}
        </button>
        <Link href="/admin/servicos" className="font-poppins text-sm text-branco/60 transition-colors hover:text-branco">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
