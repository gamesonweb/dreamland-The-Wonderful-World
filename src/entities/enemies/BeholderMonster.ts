import { AbstractMesh } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { RecastJSPlugin } from "@babylonjs/core/Navigation";
import { Character } from "../Character";
import { HeroController} from "../players/HeroController";
import { BasicAiEnemy } from "./BasicAiEnemy";
import { Scene } from "@babylonjs/core/scene";
import { AnimationGroup } from "@babylonjs/core";
import { MovementUtils } from "../../utils/MovementUtils";
import { EnemyState } from "../../enum/EnemyState";
import { ParticleSystem } from "@babylonjs/core";
import { Color3, Color4, MeshBuilder, GlowLayer, StandardMaterial, Texture } from "@babylonjs/core";


export class BeholderMonster extends BasicAiEnemy {
    scene : Scene;
    constructor(
        name: string,
        mesh: AbstractMesh,
        animationGroups: AnimationGroup[],
        initialPosition: Vector3,
        player: HeroController,
        navPlugin: RecastJSPlugin,
        patrolAreaRadius: number,
        patrolPoints: Vector3[],
        sightRange: number,
        scene: Scene
    ) {
        super(name, mesh, animationGroups, initialPosition, player, navPlugin, patrolAreaRadius, patrolPoints, sightRange,scene);
        this.scene = scene;
        this.maxHealth = 70; // Points de vie maximum
        this.currentHealth = this.maxHealth; // Points de vie actuel
        this.attackDamage = 7;
    }

    public attackPlayer(player: HeroController): void {
        // Rotate enemy toward player 
        MovementUtils.applyLookAtSmooth(this.mesh, player.mesh.position.clone() , 0.02);

        // Check if player is in attack range 
        if(!this.isPlayerInAttackRange()) {
            this.isAttacking = false;
            this.state = EnemyState.STATE_PATROL; 
            return;
        }

        // Check if the enemy is attacking 
        if (this.isAttacking ) {
            return; // Ne pas attaquer si déjà en train d'attaquer
        }

        if (this.attackCooldown) {
            this.playAnimationIdle();
            return; // Ne pas attaquer si le cooldown est actif
        }
        // Attack the player
        this.isAttacking = true; 
        this.attackCooldown = true; // Démarrer le cooldown
        
        this.animationManager.play("Attack 1", false, () => {
            const startPosition = this.mesh.position.clone().add(new Vector3(0, 2, 0));
            const targetPosition = this.player.mesh.position.clone(); 
            const direction = targetPosition.subtract(startPosition).normalize();

            // Decalage vers l'avant 
            const offsetDistance = 1; // combien d'unités devant
            const startPositionWithOffset = startPosition.add(direction.scale(offsetDistance));

            this.createElectricBall(this.scene, startPositionWithOffset, direction);

            this.isAttacking = false;
            this.state = EnemyState.STATE_PATROL; // Revenir à PATROL après l'attaque

            // Cooldown avant prochaine attaque
            setTimeout(() => {
                this.attackCooldown = false;
            }, 1000); // 1 secondes de cooldown
        });
        

    }

    public createElectricBall(scene: Scene, startPosition: Vector3, direction: Vector3, speed: number = 10, lifetime: number = 5) {
        // Boule electrique 
        const electricBall = MeshBuilder.CreateSphere("electricBall", { diameter: 0.5 }, this.scene);
        electricBall.position = startPosition;

        // Dans createElectricBall():
        const mat = new StandardMaterial("glowMat", this.scene);
        mat.diffuseColor = new Color3(0.2, 0.4, 1);
        mat.emissiveColor = new Color3(0.5, 0.7, 1);
        mat.alpha = 0.8;

        // Ajoutez un effet de glow
        const glowLayer = new GlowLayer("glowLayer", this.scene);
        glowLayer.addIncludedOnlyMesh(electricBall);
        glowLayer.intensity = 2;

        electricBall.material = mat;

        // Activer les collisions
        electricBall.ellipsoid = new Vector3(0.10, 0.10, 0.10); // sphère de collision plus petite
        electricBall.ellipsoidOffset = new Vector3(0, 0, 0); // centré
        electricBall.checkCollisions = true;

        // Mouvement du projectile
        const moveProjectile = () => {
            electricBall.moveWithCollisions(direction.scale(speed * this.scene.getAnimationRatio() / 60)); // Mouvement linéaire
        }

        // Disparition après un certain temps
        setTimeout(() => {
            electricBall.dispose();
        }, lifetime * 1000); // lifetime en secondes


        // Détection de collision
        electricBall.onCollideObservable.add((collidedMesh) => {
            // Action spécifique lors de la collision
            if(collidedMesh === this.player.mesh && !collidedMesh.name.includes("Shield") && !collidedMesh.name.includes("Sword")  ) {
                console.log("collision with player");
                if(!this.player.isDefending) {
                    this.player.takeDamage(this.attackDamage);
                }
            }
            scene.unregisterBeforeRender(moveProjectile); // Important pour éviter les fuites mémoire
            electricBall.dispose(); // Supprimer la boule
        });

        // Mettre à jour le mouvement dans la boucle de rendu
        scene.registerBeforeRender(moveProjectile);

    }
 



    public playAnimationIdle() {
        this.animationManager.play("idlebattle", true);
    }

    public playAnimationWalk() {
        this.animationManager.play("MoveFoward",true);
    }

    public playAnimationSenseSomething() {
        this.animationManager.play("SensingSomething 1",false,()=> {
            this.state = EnemyState.STATE_PATROL;
            console.log("INSIDE");
            return;
        });
    }

}