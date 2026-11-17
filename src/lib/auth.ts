import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminEmails, supabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

export const LOGIN_PATH = "/admin/login";

/** Quem está logado no painel, se for um administrador (e-mail em ADMIN_EMAILS) */
export async function getAdmin(): Promise<{ email: string } | null> {
  if (!supabaseConfigured) return null;
  // Sessão é sempre por requisição: nada aqui pode ser pré-renderizado
  await connection();
  const supabase = await createClient();
  // getUser confirma a sessão no servidor do Supabase (não confia só no cookie)
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) return null;
  return { email };
}

/** Garante um administrador logado; senão, manda para o login. Usar em toda página e action do painel. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}
