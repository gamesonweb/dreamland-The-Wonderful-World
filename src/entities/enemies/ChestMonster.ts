import { AbstractMesh } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { RecastJSPlugin } from "@babylonjs/core/Navigation";
import { Character } from "../Character";
import { HeroController } from "../players/HeroController";
import { BasicAiEnemy } from "./BasicAiEnemy";
import { Scene } from "@babylonjs/core/scene";
import { AnimationGroup } from "@babylonjs/core";
import { MovementUtils } from "../../utils/MovementUtils";
import { EnemyState } from "../../enum/EnemyState";

export class ChestMonster extends BasicAiEnemy {
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
        this.maxHealth = 50; // Points de vie maximum
        this.currentHealth = this.maxHealth; // Points de vie actuel
        this.attackDamage = 3;
    }

    public attackPlayer(player: Character): void {
        // Rotate enemy toward player 
        MovementUtils.applyLookAtSmooth(this.mesh, player.mesh.position.clone() , 0.02);

        // Check if player is in attack range 
        if(!this.isPlayerInAttackRange()) {
            this.state = EnemyState.STATE_PATROL; 
            return;
        }

        // Check if the enemy is attacking 
        if (this.isAttacking){
                return;
        }

        if (this.attackCooldown) {
            this.playAnimationIdle();
            return; // Ne pas attaquer si le cooldown est actif
        }
        
        // Attack the player
        this.isAttacking = true; 
        this.attackCooldown = true; // Démarrer le cooldown
        
        this.animationManager.play("Attack 2", false , () => {
            this.isAttacking = false; 
            this.state = EnemyState.STATE_PATROL; // Revenir à l'état de patrouille après l'attaque
            console.log("ATTACK");

            // Cooldown avant prochaine attaque
            setTimeout(() => {
            this.attackCooldown = false;
        }, 1000); // 1 secondes de cooldown
        })

        return;
            
    
    }

    
    public playAnimationIdle() {
        this.animationManager.play("idle", true);
    }

    public playAnimationWalk() {
        this.animationManager.play("walkfoward", true);
    }

    public playAnimationSenseSomething() {
        this.animationManager.play("SenseSomething1",false,()=> {
            this.state = EnemyState.STATE_PATROL;
            console.log("INSIDE");
            return;
        });
    }

   

}