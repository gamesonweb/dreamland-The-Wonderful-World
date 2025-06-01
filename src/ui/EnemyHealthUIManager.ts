import {
    AdvancedDynamicTexture,
    Rectangle,
    Control,
    TextBlock
} from "@babylonjs/gui";
import { Mesh, Scene, Vector3, Color3, Animation, Animatable, AbstractMesh, Matrix } from "@babylonjs/core";
import { Enemy } from "../entities/enemies/Enemy";

interface EnemyUI {
    enemy: Enemy;
    mesh: AbstractMesh;
    healthBar: Rectangle;
    innerBar: Rectangle;
    lastHealth: number;
    isDead: boolean;
}

export class EnemyHealthUIManager {
    private advancedTexture: AdvancedDynamicTexture;
    private scene: Scene;
    private enemiesUI: EnemyUI[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("EnemyUI", true, scene);
    }

    public addEnemy(enemy: Enemy): void {
        const container = new Rectangle();
        container.width = "60px";
        container.height = "8px";
        container.background = "#000";
        container.thickness = 0;
        container.cornerRadius = 4;
        container.alpha = 1;
        container.isVisible = true;
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        const innerBar = new Rectangle();
        innerBar.width = "100%";
        innerBar.height = "100%";
        innerBar.background = "green";
        innerBar.cornerRadius = 4;
        innerBar.thickness = 0;

        container.addControl(innerBar);
        this.advancedTexture.addControl(container);

        this.enemiesUI.push({
            enemy,
            mesh: enemy.mesh,
            healthBar: container,
            innerBar,
            lastHealth: enemy.currentHealth,
            isDead: false,
        });
    }

    public update(): void {
    const engine = this.scene.getEngine();
    const camera = this.scene.activeCamera!;
    const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());

    for (const ui of this.enemiesUI) {
        const { enemy, mesh, healthBar, innerBar } = ui;

        const worldPos = mesh.getBoundingInfo().boundingBox.centerWorld.clone();
        worldPos.y += 1.8; // Slightly above the head (adjust for your model)

        const screenPos = Vector3.Project(
            worldPos,
            Matrix.Identity(),               // ✅ Correct matrix
            this.scene.getTransformMatrix(),
            viewport
        );

        healthBar.left = `${screenPos.x - 30}px`; // Half of 60px width
        healthBar.top = `${screenPos.y - 20}px`;  // Slightly above the head

        // Health bar update
        const targetRatio = Math.max(enemy.currentHealth / enemy.maxHealth, 0);
        const currentRatio = parseFloat(innerBar.width!.toString()) / 100;
        const newRatio = currentRatio + (targetRatio - currentRatio) * 0.1; // Smooth
        innerBar.width = `${newRatio * 100}%`;

        innerBar.background = newRatio > 0.5
            ? "green"
            : newRatio > 0.2
            ? "yellow"
            : "red";

        // Damage text
        if (enemy.currentHealth < ui.lastHealth) {
            const damage = ui.lastHealth - enemy.currentHealth;
            this.showDamageText(damage.toString(), screenPos.x, screenPos.y - 20);
            ui.lastHealth = enemy.currentHealth;
        }

        if (!ui.isDead && enemy.currentHealth <= 0) {
            ui.isDead = true;
            this.fadeOut(healthBar);
        }
    }
}


    private fadeOut(rect: Rectangle): void {
        const anim = new Animation("fadeOut", "alpha", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [
            { frame: 0, value: 1 },
            { frame: 30, value: 0 }
        ];
        anim.setKeys(keys);
        const animatable: Animatable = this.scene.beginDirectAnimation(rect, [anim], 0, 30, false);
        animatable.onAnimationEnd = () => {
            rect.isVisible = false;
        };
    }

    private showDamageText(damage: string, screenX: number, screenY: number): void {
    const text = new TextBlock();
    text.text = `-${damage}`;
    text.color = "white";
    text.fontSize = "16px";
    text.zIndex = 10;
    text.alpha = 1;
    text.fontWeight = "bold";
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    text.left = `${screenX}px`;

    const startY = screenY - 10;
    const endY = startY - 30;

    this.advancedTexture.addControl(text);

    // Animate 'alpha'
    const fadeAnim = new Animation("fade", "alpha", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    fadeAnim.setKeys([
        { frame: 0, value: 1 },
        { frame: 30, value: 0 }
    ]);

    // Animate manually in render loop (simulate top movement)
    let frame = 0;
    const totalFrames = 30;

    const update = () => {
        const ratio = frame / totalFrames;
        const currentY = startY + (endY - startY) * ratio;
        text.top = `${currentY}px`;

        frame++;
        if (frame <= totalFrames) {
            requestAnimationFrame(update);
        }
    };
    update();

    const animatable = this.scene.beginDirectAnimation(text, [fadeAnim], 0, 30, false);
    animatable.onAnimationEnd = () => {
        this.advancedTexture.removeControl(text);
    };
}


    public removeEnemy(enemy: Enemy): void {
        const uiIndex = this.enemiesUI.findIndex(ui => ui.enemy === enemy);
        if (uiIndex >= 0) {
            const ui = this.enemiesUI[uiIndex];
            ui.healthBar.dispose();
            this.enemiesUI.splice(uiIndex, 1);
        }
    }

    public dispose(): void {
        this.advancedTexture.dispose();
    }
}
