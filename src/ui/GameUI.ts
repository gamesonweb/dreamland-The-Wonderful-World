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
    private playerPortrait: Image;
    private playerPowerBar: Rectangle;

    constructor(scene: Scene) {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GameUI");

        this.createHealthBar();
        this.createPortrait();
        this.createPowerBar();

        this.updatePlayerHealth(100, 100);
        this.updatePlayerPower(0, 100);
    }

    private createHealthBar(): void {
        const container = new Rectangle("playerHealthContainer");
        container.width = "400px";
        container.height = "16px";
        container.thickness = 0;
        container.background = "#111";
        container.cornerRadius = 8;
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        container.top = "40px";
        container.left = "100px";

        const bar = new Rectangle("playerHealthBar");
        bar.width = "100%";
        bar.height = "100%";
        bar.background = "limegreen";
        bar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        bar.cornerRadius = 8;

        container.addControl(bar);
        this.advancedTexture.addControl(container);

        this.playerHealthBar = bar;
    }

    private createPortrait(): void {
        const image = new Image("playerPortrait", "/assets/models/hero/hero.png");
        image.width = "80px";
        image.height = "80px";
        image.stretch = Image.STRETCH_UNIFORM;
        image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        image.top = "30px";
        image.left = "10px";

        this.advancedTexture.addControl(image);
        this.playerPortrait = image;
    }

    private createPowerBar(): void {
        const container = new Rectangle("playerPowerContainer");
        container.width = "200px";
        container.height = "15px";
        container.color = "#444";
        container.thickness = 1;
        container.background = "#000";
        container.cornerRadius = 4;
        container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        container.top = "-20px";
        container.left = "30px";

        const bar = new Rectangle("playerPowerBar");
        bar.width = "0%";
        bar.height = "100%";
        bar.background = "#00BFFF";
        bar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        container.addControl(bar);
        this.advancedTexture.addControl(container);

        this.playerPowerBar = bar;
    }

    public updatePlayerHealth(current: number, max: number): void {
        const ratio = Math.max(current / max, 0);
        this.playerHealthBar.width = `${ratio * 100}%`;
        this.playerHealthBar.background =
            ratio > 0.5 ? "limegreen" :
            ratio > 0.2 ? "orange" : "red";
    }

    public updatePlayerPower(current: number, max: number): void {
        this.playerPowerBar.width = `${Math.max(current / max, 0) * 100}%`;
    }

    public dispose(): void {
        this.advancedTexture.dispose();
    }

    public hide(): void {
    this.advancedTexture.rootContainer.isVisible = false;
    }

    public show(): void {
        this.advancedTexture.rootContainer.isVisible = true;
    }

}
