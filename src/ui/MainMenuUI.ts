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

        const buttonStyle = {
            width: "220px",
            height: "60px",
            color: "white",
            cornerRadius: 12,
            fontSize: 26,
            thickness: 0,
            paddingLeft: "10px",
            paddingRight: "10px",
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowBlur: 4,
            shadowColor: "black",
        };
        this.container.addControl(title);

        const startButton = Button.CreateSimpleButton("start", "▶ Start Game");
        Object.assign(startButton, buttonStyle);
        startButton.background = "linear-gradient(135deg, #28a745 0%, #218838 100%)";
        startButton.top = "-40px";
        startButton.onPointerEnterObservable.add(() => startButton.background = "linear-gradient(135deg, #34d058 0%, #28a745 100%)");
        startButton.onPointerOutObservable.add(() => startButton.background = "linear-gradient(135deg, #28a745 0%, #218838 100%)");
        startButton.onPointerClickObservable.add(() => {
            this.dispose();
            this.onStartGame();
        });
        this.container.addControl(startButton);

        const howToPlayButton = Button.CreateSimpleButton("how", "❓ How to Play");
        Object.assign(howToPlayButton, buttonStyle);
        howToPlayButton.background = "linear-gradient(135deg, #007bff 0%, #0056b3 100%)";
        howToPlayButton.top = "40px";
        howToPlayButton.onPointerEnterObservable.add(() => howToPlayButton.background = "linear-gradient(135deg, #339af0 0%, #007bff 100%)");
        howToPlayButton.onPointerOutObservable.add(() => howToPlayButton.background = "linear-gradient(135deg, #007bff 0%, #0056b3 100%)");
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
