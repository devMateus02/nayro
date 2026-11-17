"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { whatsappLink } from "@/lib/contact";
import { EMPTY_FIELDS, LIMITS, PROJECT_TYPES, validateContact, whatsappMessage, type ContactErrors, type ContactFields } from "@/lib/contactForm";
import { ArrowRight, ChatIcon } from "../icons";

gsap.registerPlugin(useGSAP);

const inputClass = (invalid: boolean) =>
  `w-full rounded-xl border bg-branco/[0.03] px-4 py-3 text-[15px] text-branco outline-none transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-branco/35 focus:bg-branco/[0.05] focus:shadow-[0_0_0_4px_rgba(112,41,217,0.18)] ${
    invalid ? "border-[#ff7a8a]/70 focus:border-[#ff7a8a]" : "border-branco/12 hover:border-branco/25 focus:border-roxo-luminoso/70"
  }`;

/** Rótulo + campo + mensagem de erro */
function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div data-cf-field>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between font-poppins text-[13px] font-medium text-branco/85">
        {label}{" "}
        {optional && <span className="text-[12px] font-normal text-branco/40">opcional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-erro`} role="alert" className="mt-1.5 text-[13px] text-[#ff9aa6]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Tela depois do envio: confirmação com o check se desenhando e o atalho para abrir o WhatsApp de novo */
function Success({ values, onReset }: { values: ContactFields; onReset: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo("[data-ok-ring]", { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(1.8)" })
        .fromTo("[data-ok-check]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 0.25)
        .fromTo("[data-ok-text]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.35);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col items-center py-6 text-center" role="status">
      <span data-ok-ring className="flex size-20 items-center justify-center rounded-full border border-violeta/60 bg-roxo-escuro/70 shadow-[0_0_40px_rgba(112,41,217,0.45)]">
        <svg viewBox="0 0 24 24" fill="none" className="size-9 text-lavanda" aria-hidden>
          <path
            data-ok-check
            d="M5 12.5 10 17.5 19 7"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
          />
        </svg>
      </span>
      <h2 data-ok-text className="mt-6 font-poppins text-2xl font-semibold text-branco">
        Quase lá, {values.name.split(" ")[0]}!
      </h2>
      <p data-ok-text className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-branco/70">
        Abrimos o WhatsApp com a sua mensagem já escrita: é só tocar em enviar. Se ele não abriu, use o botão abaixo.
      </p>
      <a
        data-ok-text
        href={whatsappLink(whatsappMessage(values))}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-8 inline-flex items-center gap-3 rounded-full bg-violeta px-6 py-3 font-poppins text-[14px] font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] hover:shadow-[0_0_34px_rgba(164,91,255,0.55)]"
      >
        <ChatIcon className="size-4" />
        Abrir o WhatsApp
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </a>
      <button
        data-ok-text
        type="button"
        onClick={onReset}
        className="mt-5 font-poppins text-sm text-branco/60 underline decoration-branco/25 underline-offset-4 transition-colors hover:text-branco"
      >
        Enviar outra mensagem
      </button>
    </div>
  );
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactFields>(EMPTY_FIELDS);
  // Mensagem enviada para o WhatsApp (mostra a confirmação)
  const [sent, setSent] = useState<ContactFields | null>(null);
  const [errors, setErrors] = useState<ContactErrors>({});
  // O erro de um campo some assim que ele é editado
  const [edited, setEdited] = useState<Partial<Record<keyof ContactFields, boolean>>>({});

  const error = (k: keyof ContactFields) => (edited[k] ? undefined : errors[k]);

  const set = (k: keyof ContactFields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setEdited((s) => ({ ...s, [k]: true }));
  };

  const described = (k: keyof ContactFields) => (error(k) ? `cf-${k}-erro` : undefined);

  /** Confere os campos e abre o WhatsApp com a mensagem pronta (no mesmo clique, para o navegador não bloquear) */
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEdited({});
    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])) as ContactFields;
    const found = validateContact(trimmed);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    window.open(whatsappLink(whatsappMessage(trimmed)), "_blank", "noopener,noreferrer");
    setSent(trimmed);
  }

  if (sent) {
    return (
      <Success
        values={sent}
        onReset={() => {
          setSent(null);
          setValues(EMPTY_FIELDS);
          setEdited({});
          setErrors({});
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="cf-name" label="Nome" error={error("name")}>
          <input
            id="cf-name"
            name="name"
            autoComplete="name"
            required
            maxLength={LIMITS.name.max}
            value={values.name}
            onChange={set("name")}
            placeholder="Como podemos te chamar?"
            aria-invalid={!!error("name")}
            aria-describedby={described("name")}
            className={inputClass(!!error("name"))}
          />
        </Field>
        <Field id="cf-company" label="Empresa" optional error={error("company")}>
          <input
            id="cf-company"
            name="company"
            autoComplete="organization"
            maxLength={LIMITS.company.max}
            value={values.company}
            onChange={set("company")}
            placeholder="Nome do seu negócio"
            aria-invalid={!!error("company")}
            aria-describedby={described("company")}
            className={inputClass(!!error("company"))}
          />
        </Field>
      </div>

      {/* Tipo de projeto: opções em pílulas (radio) */}
      <fieldset data-cf-field>
        <legend className="mb-2.5 font-poppins text-[13px] font-medium text-branco/85">O que você precisa?</legend>
        <div className="flex flex-wrap gap-2.5">
          {PROJECT_TYPES.map((type) => (
            <label key={type} className="cursor-pointer">
              <input
                type="radio"
                name="projectType"
                value={type}
                checked={values.projectType === type}
                onChange={set("projectType")}
                className="peer sr-only"
              />
              <span className="inline-flex rounded-full border border-branco/20 px-4 py-2 font-poppins text-[13px] text-branco/75 transition-[background-color,border-color,color,box-shadow] duration-300 hover:border-roxo-luminoso/60 hover:text-branco peer-checked:border-transparent peer-checked:bg-violeta peer-checked:text-branco peer-checked:shadow-[0_0_20px_rgba(112,41,217,0.5)] peer-focus-visible:ring-2 peer-focus-visible:ring-roxo-luminoso/70">
                {type}
              </span>
            </label>
          ))}
        </div>
        {error("projectType") && <p className="mt-1.5 text-[13px] text-[#ff9aa6]">{error("projectType")}</p>}
      </fieldset>

      <Field id="cf-message" label="Mensagem" error={error("message")}>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          maxLength={LIMITS.message.max}
          value={values.message}
          onChange={set("message")}
          placeholder="Conte sobre a sua ideia, o objetivo do projeto e, se já tiver, o prazo."
          aria-invalid={!!error("message")}
          aria-describedby={described("message")}
          className={`${inputClass(!!error("message"))} resize-none`}
        />
        <p className="mt-1.5 text-right text-[12px] text-branco/35" aria-hidden>
          {values.message.length}/{LIMITS.message.max}
        </p>
      </Field>

      <div data-cf-field className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[34ch] text-[12px] leading-relaxed text-branco/45">
          A mensagem abre no seu WhatsApp, pronta para enviar. Veja a{" "}
          <Link href="/privacidade" className="underline underline-offset-2 transition-colors hover:text-branco/80">
            Política de Privacidade
          </Link>
          .
        </p>
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-violeta px-7 py-3.5 font-poppins text-[14px] font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] hover:shadow-[0_0_34px_rgba(164,91,255,0.55)]"
        >
          <ChatIcon className="size-4" />
          Enviar pelo WhatsApp
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}
