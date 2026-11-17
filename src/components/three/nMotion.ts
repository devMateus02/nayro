import type { RefObject } from "react";

/**
 * Movimento do N controlado de fora do canvas (camada flutuante): lido a cada quadro pelo modelo 3D.
 * Passado como ref por propriedade, para valer o mesmo objeto nos dois pacotes (principal e 3D).
 */
export type NMotion = { rotationY: number };
export type NMotionRef = RefObject<NMotion>;
