import "server-only";

// Supabase: só no servidor (nada disso vai para o navegador)
export const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
export const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

/** Login do painel disponível (URL e chave pública preenchidas no .env) */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Envio de imagens disponível (precisa também da chave secreta) */
export const storageConfigured = Boolean(SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

/** E-mails com acesso ao painel */
export const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
