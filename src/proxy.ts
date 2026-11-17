import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";

/**
 * Painel (/admin): renova a sessão do Supabase a cada acesso e manda quem não está logado para o login.
 * A checagem de administrador (ADMIN_EMAILS) é feita de novo nas páginas e actions.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  // Sem Supabase configurado, o painel mostra o que falta preencher
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  // A página de login decide sozinha o que mostrar para quem já está logado (admin ou não)
  if (!data.user && request.nextUrl.pathname !== LOGIN_PATH) return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
