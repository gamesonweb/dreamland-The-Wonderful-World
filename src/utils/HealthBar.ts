import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

export class HealthBar {
  private rect: GUI.Rectangle;
  private healthBar: GUI.Rectangle;
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private maxHealth: number;

  constructor(scene: BABYLON.Scene, mesh: BABYLON.Mesh, maxHealth: number) {
    this.maxHealth = maxHealth;

    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    this.rect = new GUI.Rectangle();
    this.rect.width = "80px";
    this.rect.height = "10px";
    this.rect.cornerRadius = 5;
    this.rect.color = "white";
    this.rect.thickness = 1;
    this.rect.background = "black";
    this.advancedTexture.addControl(this.rect);

    this.healthBar = new GUI.Rectangle();
    this.healthBar.width = "100%";
    this.healthBar.height = "100%";
    this.healthBar.cornerRadius = 5;
    this.healthBar.color = "transparent";
    this.healthBar.background = "red";
    this.rect.addControl(this.healthBar);

    // Position health bar above the mesh
    this.rect.linkWithMesh(mesh);
    this.rect.linkOffsetY = -100;
  }

  public updateHealth(currentHealth: number) {
    const percentage = Math.max(currentHealth / this.maxHealth, 0);
    this.healthBar.width = `${percentage * 100}%`;
  }

  public dispose() {
    this.advancedTexture.removeControl(this.rect);
    this.rect.dispose();
  }
}
