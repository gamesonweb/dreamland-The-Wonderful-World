import { AdvancedDynamicTexture, Button, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { Scene } from "@babylonjs/core";

export class MainMenuUI {
    private advancedTexture: AdvancedDynamicTexture;
    private container: Rectangle;
    public onStartGame: () => void = () => {};
    public onHowToPlay: () => void = () => {};

    constructor(scene: Scene) {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("MainMenuUI");

        this.container = new Rectangle();
        this.container.width = "100%";
        this.container.height = "100%";
        this.container.background = "rgba(0, 0, 0, 0.7)";
        this.container.thickness = 0;
        this.container.zIndex = 100;
        this.advancedTexture.addControl(this.container);

        const title = new TextBlock();
        title.text = "MY AWESOME GAME";
        title.fontSize = 48;
        title.color = "white";
        title.top = "-150px";
        title.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.addControl(title);

        const startButton = Button.CreateSimpleButton("start", "Start Game");
        startButton.width = "200px";
        startButton.height = "60px";
        startButton.color = "white";
        startButton.cornerRadius = 10;
        startButton.background = "#28a745";
        startButton.top = "-40px";
        startButton.fontSize = 24;
        startButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        startButton.onPointerClickObservable.add(() => {
            this.dispose();
            this.onStartGame();
        });
        this.container.addControl(startButton);

        const howToPlayButton = Button.CreateSimpleButton("how", "How to Play");
        howToPlayButton.width = "200px";
        howToPlayButton.height = "60px";
        howToPlayButton.color = "white";
        howToPlayButton.cornerRadius = 10;
        howToPlayButton.background = "#007bff";
        howToPlayButton.top = "40px";
        howToPlayButton.fontSize = 24;
        howToPlayButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        howToPlayButton.onPointerClickObservable.add(() => {
            alert("Use arrow keys to move.\nSpace to attack.");
            this.onHowToPlay();
        });
        this.container.addControl(howToPlayButton);
    }

    public dispose(): void {
        this.advancedTexture.dispose();
    }
}
