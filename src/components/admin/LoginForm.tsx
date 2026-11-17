"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/admin/actions";

const input =
  "mt-2 w-full rounded-xl border border-branco/15 bg-[#0b0a10] px-4 py-3 font-poppins text-[15px] text-branco outline-none transition placeholder:text-branco/30 focus:border-roxo-luminoso focus:shadow-[0_0_0_3px_rgba(164,91,255,0.18)]";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="font-poppins text-[13px] font-medium text-branco/80">E-mail</span>
        <input name="email" type="email" autoComplete="email" required className={input} />
      </label>
      <label className="block">
        <span className="font-poppins text-[13px] font-medium text-branco/80">Senha</span>
        <input name="password" type="password" autoComplete="current-password" required className={input} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-violeta px-6 py-3 font-poppins text-sm font-semibold text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea] disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
