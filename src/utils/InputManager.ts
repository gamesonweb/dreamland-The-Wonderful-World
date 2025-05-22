import { Scene, KeyboardEventTypes } from "@babylonjs/core";

export class InputManager {
    private static instance: InputManager;
    private scene: Scene;
    private inputMap: { [key: string]: boolean } = {};
    private keysPressed: { [key: string]: boolean } = {};

    private constructor(scene: Scene) {
        this.scene = scene;
        this.setupKeyboardListeners();
    }

    public static getInstance(scene?: Scene): InputManager {
        if (!InputManager.instance && scene) {
            InputManager.instance = new InputManager(scene);
        }
        return InputManager.instance;
    }

    private setupKeyboardListeners(): void {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[key] = true;
                    if (!this.keysPressed[key]) {
                        this.keysPressed[key] = true;
                    }
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[key] = false;
                    this.keysPressed[key] = false;
                    break;
            }
        });
    }

    public isKeyDown(key: string): boolean {
        return this.inputMap[key.toLowerCase()] || false;
    }

    public isKeyPressed(key: string): boolean {
        return this.keysPressed[key.toLowerCase()] || false;
    }

    public isRunning(): boolean {
        return this.isKeyDown("shift");
    }

    public isJumpPressed(): boolean {
        return this.isKeyPressed(" ");
    }

    public isAttackNormalPressed(): boolean {
        return this.isKeyPressed("g");
    }

    public isAttackSpecialPressed(): boolean {
        return this.isKeyPressed("f");
    }

    public isDefensePressed(): boolean {
        return this.isKeyPressed("c"); 
    }

    public isDefenseDown(): boolean {
        return this.isKeyDown("c");
    }


    

    public getMovementDirection(): { x: number; z: number } {
        let x = 0;
        let z = 0;
    
        if (this.isKeyDown("w") || this.isKeyDown("arrowup")) z += 1;
        if (this.isKeyDown("s") || this.isKeyDown("arrowdown")) z -= 1;
        if (this.isKeyDown("a") || this.isKeyDown("arrowleft")) x -= 1;
        if (this.isKeyDown("d") || this.isKeyDown("arrowright")) x += 1;
    
        // Normaliser le vecteur pour les déplacements diagonaux
        if (x !== 0 && z !== 0) {
            const length = Math.sqrt(x * x + z * z);
            x /= length;
            z /= length;
        }
    
        return { x, z };
    }

    public clear(): void {
        this.inputMap = {};
        this.keysPressed = {};
    }
}