import type Lenis from "lenis";

// Instância única do Lenis, para outros componentes rolarem a página com a mesma suavização
let instance: Lenis | null = null;
// Rolagem travada (ex.: durante a tela de load); vale também para um Lenis criado depois
let locked = false;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
  if (lenis && locked) lenis.stop();
};

/** Trava/destrava a rolagem da página (Lenis e rolagem nativa) */
export function setScrollLocked(value: boolean) {
  locked = value;
  document.documentElement.style.overflow = value ? "hidden" : "";
  if (value) instance?.stop();
  else instance?.start();
}

/** Vai direto a uma posição (px), sem animação (ex.: ao chegar de outra página com #seção) */
export function jumpToY(top: number) {
  if (instance) instance.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo(0, top);
}

/** Rola até uma posição (px) usando o Lenis quando ativo; senão, rolagem nativa suave */
export function scrollToY(top: number) {
  if (instance) instance.scrollTo(top, { duration: 1.1 });
  else window.scrollTo({ top, behavior: "smooth" });
}
