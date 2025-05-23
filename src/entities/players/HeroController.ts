import { AbstractMesh, AnimationGroup, Vector3, Scene, Ray } from "@babylonjs/core";
import { InputManager } from "../../utils/InputManager";
import { AnimationManager } from "../../utils/AnimationManager";
import { Character } from "../Character";
import { HeroState } from "../../enum/HeroState";
import { CameraController } from "./CameraController"; // Adjust path as needed
import { MovementUtils } from "../../utils/MovementUtils"; // Adjust path as needed
import { BoundingBox } from "@babylonjs/core";

const HERO_CONFIG = {
    MOVE_SPEED: 3,
    RUN_SPEED: 6,
    JUMP_FORCE: 8,
    GRAVITY: -9.81,
    TERMINAL_VELOCITY: -30,
    GROUND_RAY_LENGTH: 1.1,
    AIR_CONTROL: 0.5, // Contrôle en l'air (0 = aucun, 1 = plein)
    ROTATION_SPEED: 10, // Vitesse de rotation du personnage
    ACCELERATION: 15, // Vitesse d'accélération
    DECELERATION: 20, // Vitesse de décélération
};

export abstract class HeroController extends Character {
    private inputManager: InputManager;
    public animationManager: AnimationManager;
    public scene: Scene;
    private cameraController: CameraController;
    public currentState: HeroState = HeroState.IDLE;
    protected isOnGround: boolean = true;
    private isJumping: boolean = false;

    private velocity: Vector3 = Vector3.Zero();
    private moveSpeed: number = HERO_CONFIG.MOVE_SPEED;
    private jumpForce: number = HERO_CONFIG.JUMP_FORCE;
    private gravity: number = HERO_CONFIG.GRAVITY;
    private terminalVelocity: number = HERO_CONFIG.TERMINAL_VELOCITY;

    private targetVelocity: Vector3 = Vector3.Zero();
    private currentVelocity: Vector3 = Vector3.Zero();
    private isRunning: boolean = false;
    private jumpStartTime: number = 0;
    private canDoubleJump: boolean = false;

    public isAttacking: boolean = false;
    public attackCoolDown: boolean = false;
    public isDefending: boolean = false;
    public isGettingHit: boolean = false;

    // pour la gestion des collisions 
    public bodyBoundingBox: BoundingBox;
    private bodyMeshes: AbstractMesh[] = []; // Stocke les meshes du corps

    // Power properties
    public maxPower: number = 100; // Maximum power value
    public currentPower: number = 100; // Start with full power
    private powerRegenRate: number = 10; // Power regen per second
    public powerDrainPerAttack: number = 20; // Power drained per special attack

     // Mana properties
    public maxMana: number = 100;
    public currentMana: number = 100;
    private manaRegenRate: number = 5; // Mana regen per second

    constructor(name: string, mesh: AbstractMesh, animationGroups: AnimationGroup[], canvas: HTMLCanvasElement) {
        super(name, mesh, HERO_CONFIG.MOVE_SPEED, HERO_CONFIG.RUN_SPEED, 0.1);
        this.scene = mesh.getScene();
        this.inputManager = InputManager.getInstance(this.scene);
        this.animationManager = new AnimationManager(animationGroups, this.scene);
        this.cameraController = new CameraController(this.scene, canvas, this.mesh.position);

        // Initialize health values
        this.maxHealth = 100; // Set a default max health
        this.currentHealth = this.maxHealth; // Start with full health
        this.currentPower = this.maxPower;
        this.currentMana = this.maxMana;
    }

    public update(deltaTime: number): void {
        this.cameraController.update(deltaTime);

        this.checkGroundStatus();
        this.handleInput(deltaTime);
        this.applyGravity(deltaTime);
        this.applyMovement(deltaTime);
        this.updateState();
        this.updateAnimation();
        this.regeneratePower(deltaTime); // Regenerate power over time
        this.regenerateMana(deltaTime);
    }

    private regeneratePower(deltaTime: number): void {
        if (this.currentPower < this.maxPower) {
            this.currentPower = Math.min(this.currentPower + this.powerRegenRate * deltaTime, this.maxPower);
        }
    }

    private regenerateMana(deltaTime: number): void {
        if (this.currentMana < this.maxMana) {
            this.currentMana = Math.min(this.currentMana + this.manaRegenRate * deltaTime, this.maxMana);
        }
    }

    private checkGroundStatus(): void {
        // Ne pas vérifier pendant le saut
        if (this.isJumping && this.currentVelocity.y > 0) {
            return;
        }
    
        const ray = new Ray(
            this.mesh.position.add(new Vector3(0, 0.5, 0)), // Commencer plus haut
            new Vector3(0, -1, 0),
            HERO_CONFIG.GROUND_RAY_LENGTH + 0.5 // Rayon plus long
        );
        
        const hit = this.scene.pickWithRay(ray, (mesh) => mesh.name === "ground");
    
        if (hit?.hit && hit.distance <= HERO_CONFIG.GROUND_RAY_LENGTH) {
            if (!this.isOnGround) {
                this.handleLanding(hit.pickedPoint!.y);
            }
        } else {
            this.isOnGround = false;
        }
    }

    private handleInput(deltaTime: number): void {
        // Bloquer l'entrée si le personnage est dans un état critique
        if (this.currentState === HeroState.DIZZY || 
            this.currentState === HeroState.DYING || 
            this.currentState === HeroState.DEAD) {
            this.targetVelocity.set(0, 0, 0); // Arrêter tout mouvement
            return;
        }

        // Gestion de la course
        this.isRunning = this.inputManager.isRunning();

        // Calcul de la direction de mouvement basée sur l'input et la caméra
        const movement = this.inputManager.getMovementDirection();
        const camera = this.cameraController.getCamera();
        
        // Calcul des directions forward/right en fonction de la caméra
        const forward = camera.getForwardRay().direction.clone();
        forward.y = 0;
        forward.normalize();
        
        const right = Vector3.Cross(Vector3.Up(), forward).normalize();
        
        // Calcul de la direction cible
        const targetDirection = forward.scale(movement.z).add(right.scale(movement.x));
        if (targetDirection.lengthSquared() > 0) {
            targetDirection.normalize();
        }

        // Calcul de la vitesse cible
        const targetSpeed = this.isRunning ? this.runSpeed : this.moveSpeed;
        this.targetVelocity.x = targetDirection.x * targetSpeed;
        this.targetVelocity.z = targetDirection.z * targetSpeed;

        // Interpolation vers la vitesse cible
        const acceleration = this.isOnGround ? HERO_CONFIG.ACCELERATION : HERO_CONFIG.ACCELERATION * HERO_CONFIG.AIR_CONTROL;
        this.currentVelocity.x = this.lerp(this.currentVelocity.x, this.targetVelocity.x, acceleration * deltaTime);
        this.currentVelocity.z = this.lerp(this.currentVelocity.z, this.targetVelocity.z, acceleration * deltaTime);

        // Rotation du personnage vers la direction de mouvement
        if (targetDirection.lengthSquared() > 0) {
            // Calculer la position cible pour le regard
            const lookAtTarget = this.mesh.position.add(targetDirection.scale(10));
            
            // Appliquer une rotation douce
            MovementUtils.applyLookAtSmooth(
                this.mesh, 
                lookAtTarget, 
                HERO_CONFIG.ROTATION_SPEED * deltaTime
            );
        }

        // Gestion des Attaques 
        if (this.inputManager.isAttackSpecialPressed() && !this.isAttacking && !this.attackCoolDown) {
            this.specialAttack();
        }
        else if (this.inputManager.isAttackNormalPressed() && !this.isAttacking && !this.attackCoolDown) {
            console.log("Attack normal pressed");
            this.attack();
        }
        else if (this.inputManager.isDefenseDown()) {
            console.log("Defense down");
            this.defend();
        }

        if (!this.inputManager.isDefenseDown()) {
            this.stopDefend();
        }

        // Gestion du saut
        if (this.inputManager.isJumpPressed()) {
            if (this.isOnGround) {
                this.jump();
            } else if (this.canDoubleJump) {
                this.doubleJump();
            }
        }
    }

    private jump(): void {
        // Forcer le décollage
        this.mesh.position.y += 0.2; // Petit "boost" pour éviter les collisions
        
        // Réinitialiser complètement l'état de saut
        this.isOnGround = false;
        this.isJumping = true;
        this.canDoubleJump = true; // Réactiver le double saut
        
        // Appliquer la force de saut
        this.currentVelocity.y = HERO_CONFIG.JUMP_FORCE;
        this.jumpStartTime = Date.now();
        
        // Gestion des animations
        this.animationManager.play("JumpStartNormal", false, () => {
            return;
        });
    }

    private doubleJump(): void {
        this.currentVelocity.y = HERO_CONFIG.JUMP_FORCE * 0.8;
        this.canDoubleJump = false;
        this.animationManager.play("JumpStartNormal", false, () => {
            return;
        });
    }

    private handleLanding(groundY: number): void {
        this.isOnGround = true;
        this.isJumping = false;
        this.currentVelocity.y = 0;
        this.mesh.position.y = groundY + 0.1;
        
        // Animation d'atterrissage
        this.animationManager.play("JumpEndNormal", false, () => {
            if (this.currentState === HeroState.IDLE) {
                this.animationManager.play("idleBattle", true);
            } else {
                this.animationManager.play("movefowardnormal", true);
            }
        });
    }

    private applyGravity(deltaTime: number): void {
        if (!this.isOnGround) {
            // Appliquer la gravité seulement si on n'est pas au sol
            this.currentVelocity.y += this.gravity * deltaTime;
            
            // Limiter la vitesse de chute
            if (this.currentVelocity.y < this.terminalVelocity) {
                this.currentVelocity.y = this.terminalVelocity;
            }
        } else if (!this.isJumping) {
            // S'assurer qu'on reste bien collé au sol quand on ne saute pas
            this.currentVelocity.y = 0;
        }
    }

    private applyMovement(deltaTime: number): void {
        const movement = this.currentVelocity.scale(deltaTime);
        this.mesh.position.addInPlace(movement);
    }

    private updateState(): void {
        // Si le personnage est dans un état critique, ne pas le changer
        if (this.currentState === HeroState.DIZZY || 
            this.currentState === HeroState.DYING || 
            this.currentState === HeroState.DEAD  ||
            this.currentState === HeroState.GETHIT) {
            return;
        }

        // Seuil de vitesse pour considérer qu'on bouge
        const MOVEMENT_THRESHOLD = 0.1;
        const isMoving = this.currentVelocity.length() > MOVEMENT_THRESHOLD;
    
        if (!this.isOnGround) {
            this.currentState = HeroState.JUMPING;
        } else if (isMoving) {
            this.currentState = this.isRunning ? HeroState.RUNNING : HeroState.WALKING;
        } else {
            this.currentState = HeroState.IDLE;
        }
    }

    private updateAnimation(): void {
        if (this.isAttacking || this.isDefending) {
            return;
        }

        // Ne pas interrompre les animations d'attaque, de dégâts ou de mort
        if (this.currentState === HeroState.DYING || this.currentHealth == HeroState.GETHIT) {
            return;
        }

        switch (this.currentState) {
            case HeroState.IDLE:
                this.animationManager.play("idleBattle", true);
                break;
            case HeroState.WALKING:
                this.animationManager.play("movefowardnormal", true);
                break;
            case HeroState.RUNNING:
                this.animationManager.play("runfowardbattle", true);
                break;
            case HeroState.JUMPING:
                this.animationManager.play("JumpAirNormal", true);
                break;
            case HeroState.DIZZY:
                this.animationManager.play("Dizzy", true);
                break;
            case HeroState.DEAD:
                this.animationManager.play("DieStay", true);
                break;
            default:
                break; 
        }
    }

    // --- Gestions attaques et defense --- 
    public abstract attack(): void;
    public abstract specialAttack(): void; 

    public defend(): void {
        this.isDefending = true; 
        if (this.isGettingHit) {
            this.animationManager.play("DenfendHit", false);
        } else {
            this.animationManager.play("Defend", true);
        }      
    }

    public stopDefend(): void {
        this.isDefending = false;
    }

    // Gestions de getHit et die 
    public takeDamage(amount: number): void {
        this.isGettingHit = true;
        this.currentHealth = Math.max(this.currentHealth - amount, 0);
        
        this.currentState = HeroState.GETHIT;
        this.animationManager.play("GetHit", false, () => {
            if (this.currentHealth <= 0) {
                this.currentlife = Math.max(this.currentlife - 1, 0); 
                if (this.currentlife <= 0) {
                    this.die();
                } else {
                    this.respawn();
                } 
            }
            this.isGettingHit = false;
            this.currentState = HeroState.IDLE;
        });
    }

    public die(): void {
        this.currentState = HeroState.DYING;
        this.animationManager.play("die", false, () => {
            this.currentState = HeroState.DEAD;
        }); 
    }

    public respawn(): void {
        this.currentHealth = this.maxHealth; 
        this.currentMana = this.maxMana;
        this.currentPower = this.maxPower;
        this.isAttacking = false; 
        this.attackCoolDown = false; 
        this.isDefending = false; 

        this.currentState = HeroState.DIZZY;
        setTimeout(() => {
            this.currentState = HeroState.IDLE;
        }, 5000);
    }

    // Helper functions
    private lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t;
    }

    // Method to drain power (called by specialAttack)
    protected drainPower(amount: number): boolean {
        if (this.currentPower >= amount) {
            this.currentPower -= amount;
            return true;
        }
        return false;
    }
}