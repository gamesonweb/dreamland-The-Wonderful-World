import { AdvancedDynamicTexture, Rectangle, TextBlock, Button, Control } from "@babylonjs/gui";
import { Scene } from "@babylonjs/core";

export class MainMenuUI {
    private advancedTexture: AdvancedDynamicTexture;
    private isGameStarted: boolean = false;
    private onStartCallback: () => void;

    constructor(scene: Scene) {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("MainMenuUI");

        const background = new Rectangle("menuBackground");
        background.width = "400px";
        background.height = "300px";
        background.background = "rgba(0, 0, 0, 0.8)";
        background.thickness = 2;
        background.color = "white";
        background.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        background.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTexture.addControl(background);

        const title = new TextBlock("title", "Knight vs. Monsters");
        title.color = "red";
        title.fontSize = 36;
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        title.top = "-80px";
        background.addControl(title);

        const startButton = Button.CreateSimpleButton("startButton", "Start Game");
        startButton.width = "200px";
        startButton.height = "50px";
        startButton.color = "white";
        startButton.background = "green";
        startButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        startButton.top = "-10px";
        startButton.onPointerClickObservable.add(() => {
            this.isGameStarted = true;
            this.advancedTexture.dispose();
            if (this.onStartCallback) this.onStartCallback();
        });
        background.addControl(startButton);
    }

    public setOnStartCallback(callback: () => void): void {
        this.onStartCallback = callback;
    }

    public isStarted(): boolean {
        return this.isGameStarted;
    }

    public dispose(): void {
        this.advancedTexture.dispose();
    }
}