/**
 * Computador = tela larga com mouse. Celular e tablet (tela estreita ou toque) recebem a versão leve:
 * o N vira imagem e a água 3D não roda.
 * A mesma regra existe em CSS na classe do N (LogoN): mudar nos dois lugares.
 */
export const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

/** Só faz sentido no navegador; no servidor responde "não" */
export const isLightDevice = () => typeof window !== "undefined" && !window.matchMedia(DESKTOP_QUERY).matches;
