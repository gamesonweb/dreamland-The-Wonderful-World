import { AnimationManager } from './../utils/AnimationManager';
import { HeroController } from "../entities/players/HeroController"
import { Knight } from "../entities/players/Knight"
import { Enemy } from "../entities/enemies/Enemy"
import { BasicAiEnemy } from "../entities/enemies/BasicAiEnemy"
import { EnemyState } from "../enum/EnemyState"
import { Mesh } from "@babylonjs/core"
import { Scene } from "@babylonjs/core";


export class CollisionsManager {
    private scene: Scene;
    private enemies : Enemy[] = []; 


    public constructor(hero: HeroController, enemies: Enemy[] ) {

        this.scene = hero.mesh.getScene();

        // Ajout des enemy du level dans la liste
        enemies.forEach(enemy => {
            this.addEnemy(enemy);
        })

    }

    public update(hero : HeroController) {
        this.scene.registerBeforeRender(() => {
            this.checkHeroEnemyCollisions(hero);

            if ( hero instanceof Knight) {
                this.checkKnightEnemyCollisions(hero as Knight);
            }
        })
    }

    // Collisions généralisées à tout type de hero
    private checkHeroEnemyCollisions(hero: HeroController) {
        this.enemies.forEach((enemy) => {
            if(this.enemyHasCollidedWithHeroBody(hero, enemy)) {
                if(enemy.isAttacking ) {
                    hero.isGettingHit = true;
                    if (!hero.isDefending) {
                        hero.takeDamage(enemy.attackDamage);
                    }
                } else {
                    hero.isGettingHit = false;
                }
            }
        })
    }

    // Collisions spécifique au hero chevalier 
    private checkKnightEnemyCollisions(hero: Knight): void {
        this.enemies.forEach(enemy => {
            if (hero.swordMesh.intersectsMesh(enemy.mesh, false) && hero.isAttacking) {
                if (enemy instanceof BasicAiEnemy){
                    enemy.state = EnemyState.STATE_GETHIT;
                    enemy.takeDamage(hero.currentAttackDamage);
                }
            } 
        })
    }


    // helper functions 
    private addEnemy(enemy: Enemy): void {
        this.enemies.push(enemy);
    }

    private removeEnemy(enemy: Enemy): void {
        this.enemies = this.enemies.filter(e => e !== enemy);
    }

    private enemyHasCollidedWithHeroBody(hero: HeroController, enemy: Enemy): boolean {
        let hasCollided = false;

        // 1. Récupérer uniquement les Mesh (avec un type guard)
        const allMeshes = hero.mesh.getChildMeshes()
            .filter((child): child is Mesh => child instanceof Mesh);

        allMeshes.forEach((mesh) => {
            if ( !mesh.name.includes("Sword") && !mesh.name.includes("Shield")) {
                if (mesh.intersectsMesh(enemy.mesh)) {
                    hasCollided = true;
                }
            }
        })

        return hasCollided;

    }


}