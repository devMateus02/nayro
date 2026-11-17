import { dbConfigured } from "@/lib/db";
import { storageConfigured, supabaseConfigured } from "@/lib/supabase/config";

/** O que falta preencher no .env para o painel funcionar (null quando está tudo certo) */
export function missingSetup() {
  const missing: string[] = [];
  if (!dbConfigured) missing.push("DATABASE_URL e DIRECT_URL (conexão do banco)");
  if (!supabaseConfigured) missing.push("SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY (login do painel)");
  if (!storageConfigured) missing.push("SUPABASE_SECRET_KEY (envio de imagens)");
  if (!process.env.ADMIN_EMAILS?.trim()) missing.push("ADMIN_EMAILS (quem pode entrar no painel)");
  return missing.length ? missing : null;
}

export default function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-violeta/30 bg-[#0e0c15] p-8">
      <p className="font-poppins text-[12px] font-medium uppercase tracking-[0.3em] text-roxo-luminoso">Configuração</p>
      <h1 className="mt-3 font-poppins text-2xl font-semibold text-branco">Falta pouco para o painel funcionar</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-branco/70">Preencha no arquivo .env do site:</p>
      <ul className="mt-4 space-y-2">
        {missing.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] text-branco/85">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-roxo-luminoso" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[14px] leading-relaxed text-branco/55">
        O passo a passo completo está no arquivo PASSO-A-PASSO.md, na pasta do site. Depois de salvar o .env, reinicie o servidor.
      </p>
    </div>
  );
}
