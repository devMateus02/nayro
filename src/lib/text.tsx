import type { ReactNode } from "react";

/**
 * Mantém inteiras as palavras com hífen (ex.: "E-commerce"): o navegador pode quebrar a linha no hífen e deixar
 * "E-" sozinho no fim de uma linha. Assim a palavra inteira passa para a linha de baixo.
 * Usar em títulos que vêm do painel (nomes de serviços e projetos).
 */
export function keepHyphens(text: string): ReactNode {
  const parts = text.split(/(\S*\p{L}-\p{L}\S*)/u);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
