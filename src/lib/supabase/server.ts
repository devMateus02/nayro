import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Cliente com a sessão de quem está acessando (cookies do login do painel) */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado durante a renderização (cookies só podem ser gravados em actions); o proxy renova a sessão
        }
      },
    },
  });
}

/** Cliente com a chave secreta: só no servidor, para o Storage (criar links de envio e apagar imagens) */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !secret) return null;
  return createSupabaseClient(SUPABASE_URL, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
