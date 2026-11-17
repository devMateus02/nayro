import { buildLlmsTxt, llmsResponse } from "@/lib/llms";

/** /llms.txt: resumo do site para IAs (atualiza junto com os projetos) */
export async function GET() {
  return llmsResponse(await buildLlmsTxt(false));
}
