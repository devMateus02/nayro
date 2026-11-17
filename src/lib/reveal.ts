import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// A saída desfaz mais rápido que a entrada: quem já está rolando não fica esperando
const UNDO_SPEED = 1.8;

type RevealOptions = {
  start?: ScrollTrigger.Vars["start"];
  end?: ScrollTrigger.Vars["end"];
  onEnter?: () => void;
  onLeave?: () => void;
};

/**
 * Liga uma timeline de entrada a uma seção: faz ao entrar (rolando para baixo ou para cima)
 * e desfaz ao sair (por qualquer lado).
 */
export function revealOnView(
  tl: gsap.core.Timeline,
  trigger: Element,
  { start = "top 60%", end = "bottom 40%", onEnter, onLeave }: RevealOptions = {},
) {
  tl.pause(0);
  const enter = () => {
    onEnter?.();
    tl.timeScale(1).play();
  };
  const leave = () => {
    onLeave?.();
    tl.timeScale(UNDO_SPEED).reverse();
  };
  return ScrollTrigger.create({
    trigger,
    start,
    end,
    onEnter: enter,
    onEnterBack: enter,
    onLeave: leave,
    onLeaveBack: leave,
  });
}
