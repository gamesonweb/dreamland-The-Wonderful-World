import {
    AdvancedDynamicTexture,
    Rectangle,
    TextBlock,
    Control,
    Image,
    StackPanel
} from "@babylonjs/gui";
import { Scene, Mesh } from "@babylonjs/core";

export class GameUI {
    private advancedTexture: AdvancedDynamicTexture;

    private playerHealthBar: Rectangle;
    private enemyHealthBar: Rectangle;

    private playerPortrait: Image;
    private enemyPortrait: Image;

    private playerPowerBar: Rectangle;
    private enemyPowerBar: Rectangle;

    private roundTimerText: TextBlock;
    private playerNameText: TextBlock;
    private enemyNameText: TextBlock;

    constructor(scene: Scene) {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GameUI");

        this.createHealthBars();
        this.createPortraits();
        this.createPowerBars();
        this.createTimer();
        this.createNames();

        // Initialize default full health (replace with your own max values)
        this.updatePlayerHealth(100, 100);
        this.updateEnemyHealth(100, 100);
    }

    private createHealthBars(): void {
        const createBar = (align: number, name: string, color: string) => {
            const container = new Rectangle(name + "HealthContainer");
            container.width = "400px";
            container.height = "25px";
            container.thickness = 0; // no visible border
            container.background = "#111"; // darker background as base
            container.cornerRadius = 8;
            container.horizontalAlignment = align;
            container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            container.top = "30px";
            container.left = align === Control.HORIZONTAL_ALIGNMENT_LEFT ? "80px" : "-80px";

            const bar = new Rectangle(name + "HealthBar");
            bar.width = "100%";
            bar.height = "100%";
            bar.background = color;
            bar.horizontalAlignment = align;
            bar.cornerRadius = 8;

            container.addControl(bar);
            this.advancedTexture.addControl(container);

            return bar;
        };

        this.playerHealthBar = createBar(Control.HORIZONTAL_ALIGNMENT_LEFT, "player", "limegreen");
        this.enemyHealthBar = createBar(Control.HORIZONTAL_ALIGNMENT_RIGHT, "enemy", "crimson");
    }

    private createPortraits(): void {
        const createPortrait = (align: number, name: string, src: string) => {
            const image = new Image(name + "Portrait", src);
            image.width = "80px";
            image.height = "80px";
            image.horizontalAlignment = align;
            image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            image.top = "25px";
            image.left = align === Control.HORIZONTAL_ALIGNMENT_LEFT ? "10px" : "-10px";

            const frame = new Rectangle(name + "Frame");
            frame.width = "90px";
            frame.height = "90px";
            frame.background = "black";
            frame.cornerRadius = 10;
            frame.thickness = 3;
            frame.color = "gold";
            frame.horizontalAlignment = align;
            frame.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            frame.top = "20px";
            frame.left = image.left;
            frame.addControl(image);

            this.advancedTexture.addControl(frame);
            return image;
        };

        this.playerPortrait = createPortrait(Control.HORIZONTAL_ALIGNMENT_LEFT, "player", "path/to/knight_portrait.png");
        this.enemyPortrait = createPortrait(Control.HORIZONTAL_ALIGNMENT_RIGHT, "enemy", "path/to/beholder_portrait.png");
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
            container.left = align === Control.HORIZONTAL_ALIGNMENT_LEFT ? "20px" : "-20px";

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

    private createTimer(): void {
        this.roundTimerText = new TextBlock("timer", "99");
        this.roundTimerText.color = "white";
        this.roundTimerText.fontSize = 48;
        this.roundTimerText.top = "25px";
        this.roundTimerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.roundTimerText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.roundTimerText.shadowColor = "black";
        this.roundTimerText.shadowOffsetX = 2;
        this.roundTimerText.shadowOffsetY = 2;

        this.advancedTexture.addControl(this.roundTimerText);
    }

    private createNames(): void {
        this.playerNameText = new TextBlock("playerName", "YOU");
        this.playerNameText.color = "white";
        this.playerNameText.fontSize = 20;
        this.playerNameText.top = "5px";
        this.playerNameText.left = "90px";
        this.playerNameText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.playerNameText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(this.playerNameText);

        this.enemyNameText = new TextBlock("enemyName", "ENEMY");
        this.enemyNameText.color = "white";
        this.enemyNameText.fontSize = 20;
        this.enemyNameText.top = "5px";
        this.enemyNameText.left = "-90px";
        this.enemyNameText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.enemyNameText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(this.enemyNameText);
    }

    public updatePlayerHealth(current: number, max: number): void {
        const ratio = Math.max(current / max, 0);
        this.playerHealthBar.width = `${ratio * 100}%`;
        this.playerHealthBar.background =
            current > max * 0.5 ? "limegreen" :
            current > max * 0.2 ? "orange" : "red";
    }

    public updateEnemyHealth(current: number, max: number): void {
        const ratio = Math.max(current / max, 0);
        this.enemyHealthBar.width = `${ratio * 100}%`;
        this.enemyHealthBar.background =
            current > max * 0.5 ? "crimson" :
            current > max * 0.2 ? "orange" : "darkred";
    }

    public updatePlayerPower(current: number, max: number): void {
        this.playerPowerBar.width = `${Math.max(current / max, 0) * 100}%`;
    }

    public updateEnemyPower(current: number, max: number): void {
        this.enemyPowerBar.width = `${Math.max(current / max, 0) * 100}%`;
    }

    public updateTimer(time: number): void {
        this.roundTimerText.text = Math.ceil(time).toString();
    }

    public dispose(): void {
        this.advancedTexture.dispose();
    }

    // Optional floating name labels
    /*
    public attachFloatingLabel(text: string, targetMesh: Mesh): void {
        const label = new TextBlock();
        label.text = text;
        label.color = "white";
        label.fontSize = 24;
        label.shadowColor = "black";
        label.shadowOffsetX = 2;
        label.shadowOffsetY = 2;
        label.linkWithMesh(targetMesh);
        label.linkOffsetY = -100;
        this.advancedTexture.addControl(label);
    }
    */
}
