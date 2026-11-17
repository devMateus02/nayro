// Sinal de fim da tela de load: as animações de entrada do site esperam por ele
let done = false;
const listeners = new Set<() => void>();

/** Chama `cb` quando o load abrir (na hora, se já abriu). Retorna a função para cancelar. */
export function onLoaderDone(cb: () => void) {
  if (done) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function finishLoader() {
  if (done) return;
  done = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}
