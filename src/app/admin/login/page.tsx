import Image from "next/image";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import SetupNotice, { missingSetup } from "@/components/admin/SetupNotice";
import { getAdmin } from "@/lib/auth";

// Depende da sessão do usuário: a navegação pode esperar o servidor
export const instant = false;

export default async function LoginPage() {
  const missing = missingSetup();
  if (missing) return <SetupNotice missing={missing} />;
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="mx-auto mt-[8vh] max-w-sm">
      <div className="flex justify-center">
        <Image src="/images/logo-navbar.webp" alt="NAYRO" width={2172} height={724} sizes="180px" loading="eager" className="h-[60px] w-auto" />
      </div>
      <div className="mt-6 rounded-3xl border border-branco/10 bg-[#0e0c15]/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(112,41,217,0.12)]">
        <h1 className="font-poppins text-xl font-semibold text-branco">Entrar no painel</h1>
        <p className="mt-1.5 text-[14px] text-branco/60">Gerencie os projetos do site.</p>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
