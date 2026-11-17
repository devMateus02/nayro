import { buildLlmsTxt, llmsResponse } from "@/lib/llms";

/** /llms-full.txt: o mesmo resumo com o texto completo de cada projeto e as respostas do FAQ */
export async function GET() {
  return llmsResponse(await buildLlmsTxt(true));
}
