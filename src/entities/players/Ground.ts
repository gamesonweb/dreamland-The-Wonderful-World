import { MeshBuilder, StandardMaterial, Color3, Scene } from "@babylonjs/core";

export function createGround(scene: Scene) {
  const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  const mat = new StandardMaterial("groundMat", scene);
  mat.diffuseColor = new Color3(0.4, 0.8, 0.4);
  ground.material = mat;
}
