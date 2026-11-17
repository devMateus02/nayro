import * as THREE from "three";

type BakeOptions = {
  /** Giro em Y para colocar o modelo de frente para a câmera */
  rotationY: number;
  /** Tamanho final da maior dimensão (ou da dimensão escolhida em `fitAxis`) */
  size: number;
  fitAxis?: "x" | "y" | "z" | "max";
};

/**
 * Aplica transformações direto na geometria de um modelo GLB (uma vez só por geometria):
 * converte posições quantizadas para float, aplica a matriz do nó, gira, centraliza e escala.
 * Depois disso o espaço do objeto coincide com o espaço da cena.
 */
export function bakeMesh(mesh: THREE.Mesh, { rotationY, size, fitAxis = "max" }: BakeOptions) {
  const geo = mesh.geometry;
  if (!geo.userData.nayroBaked) {
    // Arquivos otimizados guardam posições em inteiros: em float a transformação não satura
    const pos = geo.getAttribute("position");
    if (!(pos.array instanceof Float32Array)) {
      const floats = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        floats[i * 3] = pos.getX(i);
        floats[i * 3 + 1] = pos.getY(i);
        floats[i * 3 + 2] = pos.getZ(i);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(floats, 3));
    }
    mesh.updateMatrix();
    geo.applyMatrix4(mesh.matrix);
    geo.rotateY(rotationY);
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const center = box.getCenter(new THREE.Vector3());
    geo.translate(-center.x, -center.y, -center.z);
    const dims = box.getSize(new THREE.Vector3());
    const ref = fitAxis === "max" ? Math.max(dims.x, dims.y, dims.z) : dims[fitAxis];
    const s = size / ref;
    geo.scale(s, s, s);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    geo.userData.nayroBaked = true;
  }
  mesh.position.set(0, 0, 0);
  mesh.rotation.set(0, 0, 0);
  mesh.scale.set(1, 1, 1);
  return geo.boundingBox!.clone();
}
