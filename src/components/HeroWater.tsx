"use client";

import { useEffect, useRef } from "react";

/*
 * Água calma sobre o fundo da Hero: o mouse (ou o dedo) cria ondulações que se espalham e somem.
 * Simulação da equação de onda numa malha de alturas em baixa resolução (ping-pong na GPU);
 * a renderização refrata a foto do fundo pelo gradiente da superfície e soma um reflexo discreto.
 * A foto em <Image> continua por baixo: sem WebGL2 o efeito simplesmente não aparece.
 */

const IMAGE_URL = "/images/hero-bg.webp";
const BLUR_PX = 8; // mesmo desfoque da foto em CSS
const SIM_DOWNSCALE = 5; // malha da água = 1/4 da tela
const STEPS_PER_FRAME = 2;
const IDLE_FRAMES = 200; // ~5 s depois do último movimento a animação para

const VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Passo da simulação: altura (r) e velocidade (g) + perturbação ao longo do trajeto do cursor
const SIMULATE = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uStrength;
uniform float uAspect;
in vec2 vUv;
out vec4 outColor;

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - (a + ab * t));
}

void main() {
  vec4 s = texture(uState, vUv);
  float avg = (
    texture(uState, vUv - vec2(uTexel.x, 0.0)).r +
    texture(uState, vUv + vec2(uTexel.x, 0.0)).r +
    texture(uState, vUv - vec2(0.0, uTexel.y)).r +
    texture(uState, vUv + vec2(0.0, uTexel.y)).r
  ) * 0.25;
  s.g += (avg - s.r) * 2.0;
  s.g *= 0.985;   // amortecimento: água calma, as ondas morrem suavemente
  s.r += s.g;
  s.r *= 0.997;

  if (uStrength != 0.0) {
    vec2 aspect = vec2(uAspect, 1.0);
    float d = segmentDistance(vUv * aspect, uFrom * aspect, uTo * aspect);
    float drop = max(0.0, 1.0 - d / uRadius);
    drop = 0.5 - cos(drop * 3.14159265) * 0.5;
    s.r -= drop * uStrength;
  }
  outColor = s;
}`;

// Renderização: refração da foto pelo gradiente da água + reflexo de luz suave
const RENDER = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform sampler2D uImage;
uniform vec2 uTexel;
uniform vec4 uCover; // escala.xy, deslocamento.zw (object-fit: cover)
in vec2 vUv;
out vec4 outColor;

void main() {
  float hl = texture(uState, vUv - vec2(uTexel.x, 0.0)).r;
  float hr = texture(uState, vUv + vec2(uTexel.x, 0.0)).r;
  float hd = texture(uState, vUv - vec2(0.0, uTexel.y)).r;
  float hu = texture(uState, vUv + vec2(0.0, uTexel.y)).r;
  vec2 grad = vec2(hr - hl, hu - hd);

  // Refração: a foto é deslocada pela inclinação da superfície
  vec2 uv = vUv * uCover.xy + uCover.zw + grad * 0.9;
  vec3 col = texture(uImage, uv).rgb;

  // Cristas claras e vales escuros, como luz rasante na água
  col += (grad.x - grad.y) * 1.6 * vec3(0.85, 0.8, 1.0);

  // Reflexo suave de luz nas ondas
  vec3 n = normalize(vec3(-grad * 30.0, 1.0));
  float spec = pow(max(dot(n, normalize(vec3(-0.35, 0.55, 1.0))), 0.0), 60.0);
  col += vec3(0.96, 0.94, 1.0) * spec * 0.22 * clamp(length(grad) * 60.0, 0.0, 1.0);
  outColor = vec4(max(col, 0.0), 1.0);
}`;

// Variante "leds": manchas de luz desfocadas que derivam e pulsam devagar (como LED), refratadas pela água
const RENDER_LEDS = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uTime;
uniform float uAspect;
in vec2 vUv;
out vec4 outColor;

vec3 glow(vec2 p, vec2 c, float r, vec3 col) {
  vec2 d = (p - c) * vec2(uAspect, 1.0);
  return col * exp(-dot(d, d) / (r * r));
}

void main() {
  float hl = texture(uState, vUv - vec2(uTexel.x, 0.0)).r;
  float hr = texture(uState, vUv + vec2(uTexel.x, 0.0)).r;
  float hd = texture(uState, vUv - vec2(0.0, uTexel.y)).r;
  float hu = texture(uState, vUv + vec2(0.0, uTexel.y)).r;
  vec2 grad = vec2(hr - hl, hu - hd);

  // Refração: as luzes são amostradas no ponto deslocado pela superfície da água
  vec2 p = vUv + grad * 0.9;
  float t = uTime;

  vec3 col = vec3(0.043, 0.039, 0.063); // #0b0a10
  // Violeta no canto inferior esquerdo
  col += glow(p, vec2(0.12 + 0.06 * sin(t * 0.13), 0.18 + 0.08 * cos(t * 0.11)), 0.34, vec3(0.44, 0.16, 0.85) * 0.42 * (0.8 + 0.2 * sin(t * 0.9)));
  // Âmbar quente no alto à esquerda e à direita
  col += glow(p, vec2(0.22 + 0.07 * cos(t * 0.09), 0.92 + 0.04 * sin(t * 0.12)), 0.26, vec3(0.62, 0.38, 0.22) * 0.18 * (0.8 + 0.2 * sin(t * 0.7 + 1.0)));
  col += glow(p, vec2(0.86 + 0.06 * sin(t * 0.1 + 2.0), 0.2 + 0.07 * cos(t * 0.08)), 0.28, vec3(0.6, 0.34, 0.22) * 0.2 * (0.75 + 0.25 * sin(t * 0.8 + 2.0)));
  // Lilás e rosado discretos à direita
  col += glow(p, vec2(0.7 + 0.1 * sin(t * 0.07 + 1.0), 0.62 + 0.08 * cos(t * 0.1)), 0.3, vec3(0.64, 0.36, 1.0) * 0.16 * (0.7 + 0.3 * sin(t * 1.1 + 3.0)));
  col += glow(p, vec2(0.96 + 0.03 * sin(t * 0.15), 0.85 + 0.06 * cos(t * 0.09 + 1.0)), 0.2, vec3(0.85, 0.35, 0.75) * 0.12 * (0.7 + 0.3 * sin(t * 0.6)));

  // Ondas: cristas claras, vales escuros e reflexo suave
  col += (grad.x - grad.y) * 1.6 * vec3(0.85, 0.8, 1.0);
  vec3 n = normalize(vec3(-grad * 30.0, 1.0));
  float spec = pow(max(dot(n, normalize(vec3(-0.35, 0.55, 1.0))), 0.0), 60.0);
  col += vec3(0.96, 0.94, 1.0) * spec * 0.22 * clamp(length(grad) * 60.0, 0.0, 1.0);

  // Pontilhado leve: evita faixas nos degradês escuros
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  outColor = vec4(max(col, 0.0), 1.0);
}`;


function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
  return shader;
}

function program(gl: WebGL2RenderingContext, fragment: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fragment));
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "program");
  const uniforms = new Proxy({} as Record<string, WebGLUniformLocation | null>, {
    get: (cache, name: string) => (name in cache ? cache[name] : (cache[name] = gl.getUniformLocation(p, name))),
  });
  return { p, u: uniforms };
}

/** Foto pré-desfocada (uma vez só) para bater com o blur do fundo em CSS */
function blurredImage(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  if (typeof ctx.filter === "string") {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.filter = `blur(${BLUR_PX}px)`;
    ctx.drawImage(img, 0, 0);
  } else {
    // Sem ctx.filter (Safari antigo): reduzir e ampliar com filtro linear desfoca de forma parecida
    canvas.width = Math.round(img.naturalWidth / 4);
    canvas.height = Math.round(img.naturalHeight / 4);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

type Props = {
  sectionId: string;
  /** "photo": refrata a foto da Hero; "leds": manchas de luz animadas desenhadas no próprio shader */
  variant?: "photo" | "leds";
  className?: string;
};

export default function HeroWater({ sectionId, variant = "photo", className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = document.getElementById(sectionId);
    if (!canvas || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;
    // Alvos de render em ponto flutuante (half float) para a simulação
    if (!gl.getExtension("EXT_color_buffer_float") && !gl.getExtension("EXT_color_buffer_half_float")) return;

    const leds = variant === "leds";
    let sim: ReturnType<typeof program>;
    let render: ReturnType<typeof program>;
    try {
      sim = program(gl, SIMULATE);
      render = program(gl, leds ? RENDER_LEDS : RENDER);
    } catch {
      return;
    }

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Estado da água: duas texturas que se alternam (ping-pong)
    let simW = 0;
    let simH = 0;
    let targets: { tex: WebGLTexture; fbo: WebGLFramebuffer }[] = [];
    let current = 0;

    const createTarget = () => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fbo };
    };

    const startTime = performance.now();
    const imageTex = gl.createTexture()!;
    let imageAspect = 16 / 9;
    let imageReady = false;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      // O fundo é desfocado: 1x já basta (os LEDs são tão suaves que meia resolução não perde nada)
      canvas.width = leds ? Math.round(w / 2) : w;
      canvas.height = leds ? Math.round(h / 2) : h;
      simW = Math.max(32, Math.round(w / SIM_DOWNSCALE));
      simH = Math.max(32, Math.round(h / SIM_DOWNSCALE));
      targets.forEach(({ tex, fbo }) => {
        gl.deleteTexture(tex);
        gl.deleteFramebuffer(fbo);
      });
      targets = [createTarget(), createTarget()];
      current = 0;
      wake();
    };

    // Entrada do mouse/dedo: trajeto desde o último quadro, força proporcional à velocidade
    const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, moved: false, fresh: true };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = 1 - (e.clientY - rect.top) / rect.height;
      // Ao entrar na Hero o rastro começa no próprio cursor (sem risco desde o último ponto)
      if (pointer.fresh) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.fresh = false;
      }
      pointer.moved = true;
      wake();
    };
    const onLeave = () => {
      pointer.fresh = true;
    };

    let frame = 0;
    let idle = 0;
    let visible = true;

    const step = () => {
      gl.useProgram(sim.p);
      gl.viewport(0, 0, simW, simH);
      gl.uniform2f(sim.u.uTexel, 1 / simW, 1 / simH);
      gl.uniform1f(sim.u.uAspect, simW / simH);
      gl.uniform1f(sim.u.uRadius, 0.035);
      gl.uniform1i(sim.u.uState, 0);

      for (let i = 0; i < STEPS_PER_FRAME; i++) {
        let strength = 0;
        if (i === 0 && pointer.moved) {
          const speed = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
          strength = Math.min(0.012 + speed * 0.6, 0.05);
        }
        gl.uniform2f(sim.u.uFrom, pointer.px, pointer.py);
        gl.uniform2f(sim.u.uTo, pointer.x, pointer.y);
        gl.uniform1f(sim.u.uStrength, strength);
        const src = targets[current];
        const dst = targets[1 - current];
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src.tex);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        current = 1 - current;
      }
      if (pointer.moved) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.moved = false;
        idle = 0;
      }
    };

    const draw = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(render.p);
      if (leds) {
        gl.uniform1f(render.u.uTime, (performance.now() - startTime) / 1000);
        gl.uniform1f(render.u.uAspect, canvas.width / canvas.height);
        gl.uniform2f(render.u.uTexel, 1 / simW, 1 / simH);
        gl.uniform1i(render.u.uState, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, targets[current].tex);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return;
      }
      // object-fit: cover
      const canvasAspect = canvas.width / canvas.height;
      const sx = canvasAspect > imageAspect ? 1 : canvasAspect / imageAspect;
      const sy = canvasAspect > imageAspect ? imageAspect / canvasAspect : 1;
      gl.uniform4f(render.u.uCover, sx, sy, (1 - sx) / 2, (1 - sy) / 2);
      gl.uniform2f(render.u.uTexel, 1 / simW, 1 / simH);
      gl.uniform1i(render.u.uState, 0);
      gl.uniform1i(render.u.uImage, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[current].tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, imageTex);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = () => {
      frame = 0;
      if (!imageReady || !visible || !targets.length) return;
      step();
      draw();
      // Só aparece por cima da foto depois de desenhar de verdade
      if (canvas.style.opacity !== "1") canvas.style.opacity = "1";
      // Água parada: para o loop até o próximo movimento (os LEDs seguem animando enquanto visíveis)
      if (++idle < IDLE_FRAMES || leds) frame = requestAnimationFrame(loop);
    };

    function wake() {
      if (!frame && imageReady && visible) frame = requestAnimationFrame(loop);
    }

    let disposed = false;
    const img = new Image();
    img.onload = () => {
      // Em dev o React monta o efeito duas vezes: ignora o carregamento de uma montagem já desfeita
      if (disposed) return;
      imageAspect = img.naturalWidth / img.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, imageTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, blurredImage(img));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      imageReady = true;
      idle = IDLE_FRAMES - 2; // desenha a água parada uma vez
      wake();
    };
    if (leds) {
      // Sem foto: já pode desenhar
      imageReady = true;
      wake();
    } else {
      img.src = IMAGE_URL;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    // Pausa quando a Hero sai da tela
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    intersection.observe(section);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    section.addEventListener("pointercancel", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointercancel", onLeave);
      // Libera só os recursos: destruir o contexto quebraria uma nova montagem no mesmo canvas
      disposed = true;
      img.onload = null;
      targets.forEach(({ tex, fbo }) => {
        gl.deleteTexture(tex);
        gl.deleteFramebuffer(fbo);
      });
      gl.deleteTexture(imageTex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(sim.p);
      gl.deleteProgram(render.p);
      canvas.style.opacity = "0";
    };
  }, [sectionId, variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={
        className ??
        "pointer-events-none absolute inset-0 -z-30 size-full animate-approach opacity-0 transition-opacity duration-700 will-change-transform"
      }
    />
  );
}
