/**
 * Celular e tablet (tela estreita ou toque): recebem a versão leve dos efeitos 3D.
 * Só faz sentido no navegador; no servidor responde "não".
 */
export const isLightDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;
