import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Rectangle,
    StackPanel,
    TextBlock,
    Image
} from "@babylonjs/gui";
import {
    Scene,
    Sound,
    Animation,
    Vector3,
    DefaultRenderingPipeline,
    ParticleSystem,
    Texture,
    Color4
} from "@babylonjs/core";

export class StartMenuUI {
    private ui: AdvancedDynamicTexture;
    private panel: StackPanel;
    private selectedButtonIndex: number = 0;
    private buttons: Button[] = [];
    private music: Sound;
    private bgImage: Image;
    private background: Rectangle;


    constructor(scene: Scene, startCallback: () => void, showHowTo: () => void, showSettings: () => void, showCredits: () => void, restartCallback: () => void) {
        this.ui = AdvancedDynamicTexture.CreateFullscreenUI("StartMenuUI", true, scene);

        // Background image
        this.bgImage = new Image("bg", "assets/textures/menuBackground.jpg");
        this.bgImage.stretch = Image.STRETCH_UNIFORM;
        this.bgImage.width = "100%";
        this.bgImage.height = "100%";
        this.bgImage.alpha = 0.4;
        this.bgImage.zIndex = -2;
        this.ui.addControl(this.bgImage);

        this.background = new Rectangle();
        this.background.width = "100%";
        this.background.height = "100%";
        this.background.background = "#1a2a4488"; // Deep blue semi-transparent
        this.background.thickness = 0;
        this.background.zIndex = -1;
        this.ui.addControl(this.background);

        this.panel = new StackPanel();
        this.panel.width = "80%";
        this.panel.adaptHeightToChildren = true;
        this.panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.panel.alpha = 0;
        this.ui.addControl(this.panel);

        const title = new TextBlock();
        title.text = "⚔️ Knight's Quest";
        title.fontSize = 60; 
        title.color = "white"; 
        title.height = "100px";
        title.paddingBottom = "30px";
        title.shadowOffsetX = 0;
        title.shadowOffsetY = 0;
        title.shadowBlur = 10;
        title.shadowColor = "rgba(255, 255, 255, 0.7)"; // White glow
        title.fontFamily = "Papyrus, fantasy"; 
        this.panel.addControl(title);

        // Bounce animation for title
        const bounce = new Animation("bounce", "top", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        bounce.setKeys([
            { frame: 0, value: 0 },
            { frame: 30, value: -10 },
            { frame: 60, value: 0 }
        ]);
        scene.beginDirectAnimation(title, [bounce], 0, 60, true);

        // Fade-in animation for panel
        const anim = new Animation("fadeIn", "alpha", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        anim.setKeys([ { frame: 0, value: 0 }, { frame: 60, value: 1 } ]);
        scene.beginDirectAnimation(this.panel, [anim], 0, 60, false);

        // Buttons
        this.buttons.push(this.createButton("🛡️  Begin Adventure", () => {
            this.hide();
            const pipeline = scene.postProcessRenderPipelineManager.supportedPipelines[0] as DefaultRenderingPipeline;
            if (pipeline) {
                pipeline.imageProcessingEnabled = true;
                pipeline.bloomEnabled = true;
                pipeline.depthOfFieldEnabled = true;
            }
            startCallback();
        }));

        //this.buttons.push(this.createModalButton("❓ How to Play", "Use WASD to move\nClick to attack\nShift to dash."));
        //this.buttons.push(this.createModalButton("🛠️ Options", "Settings are not available in this demo."));
        //this.buttons.push(this.createModalButton("🎨 Credits", "Game by LG NB RM.\nAssets from XYZ sources."));
        this.buttons.push(this.createButton("🔁 Restart", restartCallback));
        this.buttons.push(this.createButton("🖥️ Toggle Fullscreen", () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        }));

        // Add buttons to panel and animate
        this.buttons.forEach((btn, index) => {
            this.panel.addControl(btn);
            // Slide-in animation for each button
            btn.alpha = 0;
            btn.leftInPixels = 200; // Start off-screen to the right (as number)
            const slideIn = new Animation(`slideIn${index}`, "leftInPixels", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
            slideIn.setKeys([
                { frame: 0, value: 200 },
                { frame: 30, value: 0 }
            ]);
            const fadeIn = new Animation(`fadeIn${index}`, "alpha", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
            fadeIn.setKeys([
                { frame: 0, value: 0 },
                { frame: 30, value: 1 }
            ]);
            scene.beginDirectAnimation(btn, [slideIn, fadeIn], index * 10, 30 + index * 10, false);
        });

        // Keyboard navigation
        window.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown") {
                this.updateButtonFocus(1);
            } else if (e.key === "ArrowUp") {
                this.updateButtonFocus(-1);
            } else if (e.key === "Enter") {
                this.buttons[this.selectedButtonIndex].onPointerClickObservable.notifyObservers(undefined);
            }
        });

        this.updateButtonFocus(0);

        // Menu music
        this.music = new Sound("menuMusic", "assets/sounds/menu.mp3", scene, null, { loop: true, autoplay: true, volume: 0.4 });

        // Parallax effect for background
        this.bgImage.left = 0;
        this.bgImage.top = 0;
        scene.onPointerMove = (evt) => {
            const x = scene.getEngine().getRenderWidth();
            const y = scene.getEngine().getRenderHeight();
            const moveX = (evt.clientX / x - 0.5) * 20; // Max 20px movement
            const moveY = (evt.clientY / y - 0.5) * 20;
            this.bgImage.left = `${moveX}px`;
            this.bgImage.top = `${moveY}px`;
        };
    }

    private updateButtonFocus(direction: number): void {
        const prevButton = this.buttons[this.selectedButtonIndex];
        prevButton.background = (prevButton as any)._defaultBackground;
        prevButton.thickness = 2;
        if (prevButton.children[0] instanceof TextBlock) {
            (prevButton.children[0] as TextBlock).color = "white"; 
        }
        Animation.CreateAndStartAnimation("scaleDown", prevButton, "scaleX", 60, 10, 1.05, 1, Animation.ANIMATIONLOOPMODE_CONSTANT);
        Animation.CreateAndStartAnimation("scaleDown", prevButton, "scaleY", 60, 10, 1.05, 1, Animation.ANIMATIONLOOPMODE_CONSTANT);

        this.selectedButtonIndex = (this.selectedButtonIndex + direction + this.buttons.length) % this.buttons.length;

        const currButton = this.buttons[this.selectedButtonIndex];
        currButton.background = "#E6E6FA";
        currButton.thickness = 2; // Highlight border
        if (currButton.children[0] instanceof TextBlock) {
            (currButton.children[0] as TextBlock).color = "#800080"; // purple for focused button text
        }
        Animation.CreateAndStartAnimation("scaleUp", currButton, "scaleX", 60, 10, 1, 1.05, Animation.ANIMATIONLOOPMODE_CONSTANT);
        Animation.CreateAndStartAnimation("scaleUp", currButton, "scaleY", 60, 10, 1, 1.05, Animation.ANIMATIONLOOPMODE_CONSTANT);
    }

    private createButton(text: string, callback: () => void): Button {
        const button = Button.CreateSimpleButton("", text);
        (button as any)._defaultBackground = "#d1c4e9";

        button.width = "40%"; 
        button.height = "50px";
        button.background = (button as any)._defaultBackground;
        button.shadowColor = "rgba(186, 104, 200, 0.7)"; // Soft purple glow
        button.thickness = 2;
        button.cornerRadius = 12;
        button.fontSize = 24;
        button.fontFamily = "Verdana, sans-serif";
        button.paddingTop = "5px";
        button.paddingBottom = "5px";
        button.shadowOffsetX = 0;
        button.shadowOffsetY = 0;
        button.shadowBlur = 15;
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER; // Center button

        // Set text color
        if (button.children[0] instanceof TextBlock) {
            (button.children[0] as TextBlock).color = "white"; 
        }

        // Hover animation
        button.onPointerEnterObservable.add(() => {
            button.background = "linear-gradient(145deg, #444, #666)";
            button.thickness = 3;
            button.color = "#d1c4e9";
            Animation.CreateAndStartAnimation("scaleUp", button, "scaleX", 60, 10, 1, 1.05, Animation.ANIMATIONLOOPMODE_CONSTANT);
            Animation.CreateAndStartAnimation("scaleUp", button, "scaleY", 60, 10, 1, 1.05, Animation.ANIMATIONLOOPMODE_CONSTANT);
        });
        button.onPointerOutObservable.add(() => {
            button.background = (button as any)._defaultBackground;
            Animation.CreateAndStartAnimation("scaleDown", button, "scaleX", 60, 10, 1.05, 1, Animation.ANIMATIONLOOPMODE_CONSTANT);
            Animation.CreateAndStartAnimation("scaleDown", button, "scaleY", 60, 10, 1.05, 1, Animation.ANIMATIONLOOPMODE_CONSTANT);
        });
        button.onPointerDownObservable.add(() => {
            button.background = (button as any)._defaultBackground;

        });
        button.onPointerUpObservable.add(() => {
            button.background = (button as any)._defaultBackground;
        });
        button.onPointerClickObservable.add(() => {
            new Sound("click", "assets/sounds/click.wav", null, null, { volume: 1 });
            callback();
        });
        return button;
    }

    private createModalButton(text: string, message: string): Button {
        const button = this.createButton(text, () => {
            // Background overlay
            const overlay = new Rectangle();
            overlay.width = "100%";
            overlay.height = "100%";
            overlay.background = "rgba(0, 0, 0, 0.7)";
            overlay.thickness = 0;
            overlay.zIndex = 1;
            this.ui.addControl(overlay);

            // Popup
            const popup = new Rectangle();
            popup.width = "80%";
            popup.height = "60%";
            popup.background = "linear-gradient(45deg, #2a2a2a, #4a4a4a)";
            popup.thickness = 2;
            if (button.children[0] instanceof TextBlock) {
                popup.color = (button.children[0] as TextBlock).color; //Match button font color
            }
            popup.cornerRadius = 15;
            popup.zIndex = 2;
            popup.alpha = 0;

            // Fade-in animation
            Animation.CreateAndStartAnimation("fadeIn", popup, "alpha", 60, 20, 0, 1, Animation.ANIMATIONLOOPMODE_CONSTANT);

            const content = new StackPanel();
            content.paddingTop = "20px";
            content.paddingBottom = "20px";

            const msg = new TextBlock();
            msg.text = message;
            if (button.children[0] instanceof TextBlock) {
                msg.color = (button.children[0] as TextBlock).color; //Match button font color
            }
            msg.fontSize = 24;
            msg.textWrapping = true;
            msg.paddingBottom = "30px";
            content.addControl(msg);

            const closeBtn = Button.CreateSimpleButton("close", "Close");
            closeBtn.width = "150px";
            closeBtn.height = "50px";
            if (button.children[0] instanceof TextBlock) {
                closeBtn.color = (button.children[0] as TextBlock).color; //Match button font color
            }
            closeBtn.background = "linear-gradient(45deg, #555, #777)";
            closeBtn.cornerRadius = 10;
            closeBtn.shadowOffsetX = 2;
            closeBtn.shadowOffsetY = 2;
            closeBtn.shadowBlur = 5;
            closeBtn.onPointerEnterObservable.add(() => {
                closeBtn.background = "linear-gradient(45deg, #777, #999)";
            });
            closeBtn.onPointerOutObservable.add(() => {
                closeBtn.background = "linear-gradient(45deg, #555, #777)";
            });
            closeBtn.onPointerClickObservable.add(() => {
                this.ui.removeControl(popup);
                this.ui.removeControl(overlay);
            });
            content.addControl(closeBtn);

            popup.addControl(content);
            this.ui.addControl(popup);
        });
        return button;
    }

    public dispose(): void {
        this.ui.dispose();
        if (this.music) {
            this.music.dispose();
        }
    }

    public show(): void {
        console.log("StartMenuUI.show() called");
        this.panel.isVisible = true;
        this.panel.alpha = 1;

        this.bgImage.isVisible = true;
        this.background.isVisible = true;

        Animation.CreateAndStartAnimation("fadeIn", this.panel, "alpha", 60, 30, 0, 1, Animation.ANIMATIONLOOPMODE_CONSTANT);

        if (this.music && !this.music.isPlaying) {
            this.music.play();
        }
    }


    public hide(): void {
        console.log("StartMenuUI.hide() called");

        this.panel.isVisible = false;
        this.panel.alpha = 0;

        this.bgImage.isVisible = false;
        this.background.isVisible = false;

        Animation.CreateAndStartAnimation("fadeOut", this.panel, "alpha", 60, 30, 1, 0, Animation.ANIMATIONLOOPMODE_CONSTANT);

        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }



}