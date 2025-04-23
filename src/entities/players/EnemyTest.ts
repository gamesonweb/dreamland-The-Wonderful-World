import * as BABYLON from "@babylonjs/core";
import { HealthBar } from "../../utils/HealthBar";

export class EnemyTest {
  public mesh: BABYLON.Mesh;
  private health: number;
  private healthBar: HealthBar;

  constructor(scene: BABYLON.Scene, position: BABYLON.Vector3) {
    // Use a simple sphere for testing
    this.mesh = BABYLON.MeshBuilder.CreateSphere("enemy", { diameter: 2 }, scene);
    this.mesh.position = position;

    this.health = 100;
    this.healthBar = new HealthBar(scene, this.mesh, this.health);
  }

  public takeDamage(amount: number) {
    this.health -= amount;
    this.healthBar.updateHealth(this.health);

    // Flash red feedback
    const mat = new BABYLON.StandardMaterial("enemyMat", this.mesh.getScene());
    mat.diffuseColor = BABYLON.Color3.Red();
    this.mesh.material = mat;

    setTimeout(() => {
      this.mesh.material = null;
    }, 100);

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    this.healthBar.dispose();
    this.mesh.dispose();
  }
}
