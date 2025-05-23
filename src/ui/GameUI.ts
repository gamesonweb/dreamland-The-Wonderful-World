import {
    AdvancedDynamicTexture,
    Rectangle,
    Control,
    Image
} from "@babylonjs/gui";
import { Scene } from "@babylonjs/core";

export class GameUI {
    private advancedTexture: AdvancedDynamicTexture;

    private playerHealthBar: Rectangle;
    private enemyHealthBar: Rectangle;

    private playerPortrait: Image;
    private enemyPortrait: Image;

    private playerPowerBar: Rectangle;
    private enemyPowerBar: Rectangle;

    constructor(scene: Scene) {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GameUI");

        this.createHealthBars();
        this.createPortraits();
        this.createPowerBars();

        this.updatePlayerHealth(100, 100);
        this.updateEnemyHealth(100, 100);
    }

    private createHealthBars(): void {
        const createBar = (align: number, name: string) => {
            const container = new Rectangle(name + "HealthContainer");
            container.width = "400px";
            container.height = "16px";
            container.thickness = 0;
            container.background = "#111";
            container.cornerRadius = 8;
            container.horizontalAlignment = align;
            container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            container.top = "40px";
            container.left = align === Control.HORIZONTAL_ALIGNMENT_LEFT ? "100px" : "-100px";

            const bar = new Rectangle(name + "HealthBar");
            bar.width = "100%";
            bar.height = "100%";
            bar.background = "limegreen";
            bar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            bar.cornerRadius = 8;

            container.addControl(bar);
            this.advancedTexture.addControl(container);

            return bar;
        };

        this.playerHealthBar = createBar(Control.HORIZONTAL_ALIGNMENT_LEFT, "player");
        this.enemyHealthBar = createBar(Control.HORIZONTAL_ALIGNMENT_RIGHT, "enemy");
    }

    private createPortraits(): void {
        const createPortrait = (align: number, name: string, src: string) => {
            const image = new Image(name + "Portrait", src);
            image.width = "80px";
            image.height = "80px";
            image.stretch = Image.STRETCH_UNIFORM;
            image.horizontalAlignment = align;
            image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            image.top = "30px";
            image.left = align === Control.HORIZONTAL_ALIGNMENT_LEFT ? "10px" : "-10px";

            this.advancedTexture.addControl(image);
            return image;
        };

        this.playerPortrait = createPortrait(Control.HORIZONTAL_ALIGNMENT_LEFT, "player", "/assets/models/hero/hero.png");
        this.enemyPortrait = createPortrait(Control.HORIZONTAL_ALIGNMENT_RIGHT, "enemy", "/assets/models/enemy/enemy.png");
    }

    private createPowerBars(): void {
        const createPower = (align: number, name: string) => {
            const container = new Rectangle(name + "PowerContainer");
            container.width = "200px";
            container.height = "15px";
            container.color = "#444";
            container.thickness = 1;
            container.background = "#000";
            container.cornerRadius = 4;
            container.horizontalAlignment = align;
            container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            container.top = "-20px";
            container.left = align === Control.HORIZONTAL_ALIGNMENT_LEFT ? "30px" : "-30px";

            const bar = new Rectangle(name + "PowerBar");
            bar.width = "0%";
            bar.height = "100%";
            bar.background = "#00BFFF";
            bar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            container.addControl(bar);

            this.advancedTexture.addControl(container);
            return bar;
        };

        this.playerPowerBar = createPower(Control.HORIZONTAL_ALIGNMENT_LEFT, "player");
        this.enemyPowerBar = createPower(Control.HORIZONTAL_ALIGNMENT_RIGHT, "enemy");
    }

    public updatePlayerHealth(current: number, max: number): void {
        const ratio = Math.max(current / max, 0);
        this.playerHealthBar.width = `${ratio * 100}%`;
        this.playerHealthBar.background =
            ratio > 0.5 ? "limegreen" :
            ratio > 0.2 ? "orange" : "red";
    }

    public updateEnemyHealth(current: number, max: number): void {
        const ratio = Math.max(current / max, 0);
        this.enemyHealthBar.width = `${ratio * 100}%`;
        this.enemyHealthBar.background =
            ratio > 0.5 ? "crimson" :
            ratio > 0.2 ? "orange" : "darkred";
    }

    public updatePlayerPower(current: number, max: number): void {
        this.playerPowerBar.width = `${Math.max(current / max, 0) * 100}%`;
    }

    public updateEnemyPower(current: number, max: number): void {
        this.enemyPowerBar.width = `${Math.max(current / max, 0) * 100}%`;
    }

    public dispose(): void {
        this.advancedTexture.dispose();
    }
}
