import { HeroController } from "./HeroController";
import { AnimationGroup, AbstractMesh, Mesh, Scene, TransformNode } from "@babylonjs/core";
import { InputManager } from "../../utils/InputManager";
import { GPUParticleSystem, Color4, Texture, Vector3, ParticleSystem, MeshBuilder, TrailMesh } from "@babylonjs/core";
import { StandardMaterial, Color3 , ShaderMaterial, DynamicTexture, GlowLayer} from "@babylonjs/core"
import { HeroState } from "../../enum/HeroState";

export class Knight extends HeroController {
    public currentAttackDamage = 0;
    
    public swordMesh: Mesh;
    public shieldMesh: Mesh;

    private isSwordOnFire: boolean = false;
    

    // --- Particles System --- 
    private coreFlames: GPUParticleSystem;
    private outerFlames: GPUParticleSystem;
    private flameEmitter: TransformNode;
    private particleSystem: ParticleSystem 

    // --- Other Effect ---- 
    private trailEffect: TrailMesh;

    
    public constructor( mesh: AbstractMesh,animationGroups: AnimationGroup[], canvas: HTMLCanvasElement){
        super('Knight', mesh, animationGroups, canvas); 

        this.setupWeapons();
        

        
    }

    // --- Gestion des armes ---
    private setupWeapons(): void {
        // Récupère l'épée et le bouclier par leur nom dans le modèle
        this.swordMesh = this.mesh.getChildMeshes().find(m => m.name === "OHS06_Sword_R") as Mesh;
        this.shieldMesh = this.mesh.getChildMeshes().find(m => m.name === "Shield08") as Mesh;

        this.mesh.getChildMeshes().forEach((childMesh) => {
            console.log(childMesh.name); // Logs the name of each child mesh
            console.log("position locale : ", childMesh.position); // Logs the position of each child mesh
            console.log("position monde : ", childMesh.getAbsolutePosition()); // Logs the world position of each child mesh
        });    
    }

    // --- Gestion des collisions --- 
    public updateCollisions() : void {}

    private attackCollisionCheck(): void {

    }

    private interactiveItemCollisionCheck() {}


    // --- Gestion des attaques --- 
    public attack(): void {
        this.currentAttackDamage = 2;

        this.isAttacking = true;
        this.attackCoolDown = true; 

        
        this.animationManager.play("Attack 2", false, () => {
            this.isAttacking = false;
        })


        // Cooldown pour éviter le spam
        setTimeout(() => {
            this.attackCoolDown = false;
        }, 800);
    }


    public specialAttack(): void {
        const manaCost = 10;
        const powerCost = this.powerDrainPerAttack;

        if (this.currentMana - manaCost < 0 || !this.drainPower(powerCost)) {
            this.attack(); 
            return; 
        }

        this.currentMana -= manaCost ; 
        this.currentAttackDamage = 10; 

        this.isAttacking = true;
        this.attackCoolDown = true; 

        
        this.animationManager.play("Attack 4", false, () => {
            this.isAttacking = false;
        })

        

        // Cooldown pour éviter le spam
        setTimeout(() => {
            this.attackCoolDown = false;
        }, 800);
    }


}