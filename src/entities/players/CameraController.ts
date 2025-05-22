import { FreeCamera, Scene, Vector3, Matrix, Tools, Scalar } from "@babylonjs/core";

export class CameraController {
    private scene: Scene;
    private camera: FreeCamera;
    private target: Vector3; // Character's position to follow
    private canvas: HTMLCanvasElement;

    // Camera parameters
    private distance: number = 3; // Distance from character
    private height: number = 2; // Height above character
    private yaw: number = 0; // Horizontal rotation (radians)
    private pitch: number = Math.PI / 6; // Vertical rotation (radians, ~30° upward)
    private smoothing: number = 0.1; // Smoothing factor (lower = smoother)
    private pitchMin: number = -Math.PI / 18; // ~ -10°
    private pitchMax: number = Math.PI / 3; // ~60°

    // Mouse input
    private isMouseDown: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private mouseSensitivity: number = 0.005; // Adjust for rotation speed

    // Nouveaux paramètres
    private cameraLag = 0.1; // Retard de suivi (plus élevé = plus fluide)
    private lookAtOffset = new Vector3(0, 1.5, 0); // Point de regard légèrement au-dessus du personnage
    private collisionRadius = 0.5; // Prévention des collisions avec les murs
    private currentRotation = 0; // Rotation actuelle pour l'interpolation

    constructor(scene: Scene, canvas: HTMLCanvasElement, target: Vector3) {
        this.scene = scene;
        this.canvas = canvas;
        this.target = target;

        // Create FreeCamera
        this.camera = new FreeCamera("thirdPersonCam", Vector3.Zero(), scene);
        this.camera.fov = 0.8; // Field of view (radians)
        this.scene.activeCamera = this.camera;

        // Lock camera to prevent default Babylon.js input handling
        this.camera.inputs.clear();

        // Setup mouse input
        this.setupInput();
        
        // Initial camera position
        this.updateCameraPosition(this.scene.getEngine().getDeltaTime() / 1000 ); // No smoothing for initial position

         // Configurer la caméra pour le style Genshin
         this.camera.fov = Tools.ToRadians(70); // Champ de vision plus large
         this.camera.minZ = 0.1;
         this.camera.speed = 0; // Désactiver le déplacement clavier
 
         // Activer le verrouillage du pointeur pour un contrôle fluide
         this.setupPointerLock();
    }

    private setupPointerLock(): void {
        this.canvas.addEventListener("click", () => {
            if (!document.pointerLockElement) {
                this.canvas.requestPointerLock = this.canvas.requestPointerLock;
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener("pointerlockchange", this.handlePointerLockChange.bind(this));
    }

    private handlePointerLockChange(): void {
        if (document.pointerLockElement === this.canvas) {
            this.isMouseDown = true;
            this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        } else {
            this.isMouseDown = false;
            this.canvas.removeEventListener("mousemove", this.handleMouseMove.bind(this));
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        if (!this.isMouseDown) return;

        const deltaX = e.movementX || 0;
        const deltaY = e.movementY || 0;

        // Rotation horizontale plus fluide
        this.yaw -= deltaX * this.mouseSensitivity * 0.5;
        
        // Rotation verticale avec limites avec un equivalent de Clamp 
        this.pitch = Math.max(
            this.pitchMin,
            Math.min(this.pitchMax, this.pitch + deltaY * this.mouseSensitivity * 0.5)
        );
    }

    private setupInput(): void {
        // Mouse down to start rotating
        this.canvas.addEventListener("mousedown", (event) => {
            if (event.button === 0) { // Left click
                this.isMouseDown = true;
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
            }
        });

        // Mouse up to stop rotating
        this.canvas.addEventListener("mouseup", () => {
            this.isMouseDown = false;
        });

        // Mouse move to update yaw and pitch
        this.canvas.addEventListener("mousemove", (event) => {
            if (this.isMouseDown) {
                const deltaX = event.clientX - this.lastMouseX;
                const deltaY = event.clientY - this.lastMouseY;

                // Update yaw (horizontal) and pitch (vertical)
                this.yaw += deltaX * this.mouseSensitivity;
                this.pitch += deltaY * this.mouseSensitivity;

                // Clamp pitch to prevent flipping
                this.pitch = Math.max(this.pitchMin, Math.min(this.pitchMax, this.pitch));

                // Update last mouse position
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
            }
        });

        // Prevent context menu on right-click (optional)
        this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    }

    public update(deltaTime: number): void {
        // Interpolation de la rotation pour plus de douceur
        this.currentRotation = Scalar.Lerp(this.currentRotation, this.yaw, 0.1);
        
        // Mise à jour de la position avec retard
        this.updateCameraPosition(deltaTime);
    }

    private updateCameraPosition(deltaTime: number): void {
        // Calcul de la position idéale avec interpolation
        const rotationMatrix = Matrix.RotationYawPitchRoll(this.currentRotation, this.pitch, 0);
        const offset = new Vector3(0, this.height, -this.distance);
        const rotatedOffset = Vector3.TransformCoordinates(offset, rotationMatrix);
        
        // Position cible avec lissage
        const targetPosition = this.target.add(rotatedOffset);
        const newPosition = Vector3.Lerp(
            this.camera.position, 
            targetPosition, 
            this.cameraLag
        );

        // Appliquer la position
        this.camera.position = newPosition;
        
        // Regarder vers le personnage avec un léger offset vertical
        this.camera.setTarget(this.target.add(this.lookAtOffset));
    }

    public getCamera(): FreeCamera {
        return this.camera;
    }
}