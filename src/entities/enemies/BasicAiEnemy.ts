import { Character } from "../Character";
import { HeroController } from "../players/HeroController";
import { Enemy } from "../enemies/Enemy";
import { AbstractMesh, Mesh, RecastJSPlugin } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AnimationManager } from "../../utils/AnimationManager";
import { Scene } from "@babylonjs/core/scene";
import { AnimationGroup } from "@babylonjs/core";
import { MovementUtils } from "../../utils/MovementUtils";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { EnemyState } from "../../enum/EnemyState" ;



export abstract class BasicAiEnemy extends Enemy {
    initialPosition: Vector3; // Position initiale de l'ennemi

    player: HeroController ; // Référence au joueur

    // Attributs pour la navigation
    navPlugin: RecastJSPlugin; 
    patrolPoints : Vector3[]; // Points de patrouille de l'ennemi
    currentPatrolPointsIndex : number ; // Index du point de patrouille actuel
    path : Vector3[] // Chemin de patrouille de l'ennemi
    currentPathIndex : number ; // Index du point de patrouille actuel
    lastUpdate : number ; // Dernière mise à jour du chemin de patrouille pour éviter de recalculer le chemin trop souvent
    state : EnemyState ; // Etat de l'ennemi

    

    // Atribut pour Animation 
    animationManager: AnimationManager; // Gestionnaire d'animation de l'ennemi

    sight : Mesh 



    // Constructeur 
    constructor(name : string, mesh: AbstractMesh,animationGroups: AnimationGroup[], initialPosition: Vector3, player: HeroController,navPlugin: RecastJSPlugin, patrolAreaRadius: number,patrolPoints: Vector3[], sightRange: number,scene: Scene) {
        super(name, mesh, 2, 3, 0.1); // Appel du constructeur de la classe parente
        this.initialPosition = initialPosition; 
        this.player = player; // Référence au joueur

        this.maxLife = 1; // Points de vie maximum
        this.currentlife = this.maxLife; // Points de vie actuel
        

        this.navPlugin = navPlugin; // Initialise le plugin de navigation
        this.patrolPoints = patrolPoints; // Initialise les points de patrouille
        this.currentPatrolPointsIndex = 0; // Initialise l'index du point de patrouille actuel
        this.path = []; // Initialise le tableau de points de patrouille
        this.currentPathIndex = 0;
        this.state = EnemyState.STATE_PATROL;

        this.attackRange = 3; 
        this.isAttacking = false;
        this.attackCooldown = false; // Initialise le cooldown d'attaque


        
        this.animationManager = new AnimationManager(animationGroups, scene); // Initialise le gestionnaire d'animation


        // DEBUG 
       /*  const debugRange = MeshBuilder.CreateSphere(
            "patrolRange_" + this.name,
            {
              diameter: this.patrolAreaRadius * 2,
              segments: 16,       // plus c’est grand, plus c’est rond
              slice: 0.5          // 0.5 = hémisphère (la moitié haute uniquement)
            },
            scene
          );
          
          // Positionner le demi‑sphere à la bonne hauteur
          debugRange.position = this.initialPosition.clone();
          debugRange.position.y = 0; // centrer la demi‑sphere
          
          // Matériau semi‑transparent
          const mat = new StandardMaterial(`rangeMat_${this.name}`, scene);
          mat.diffuseColor = new Color3(0, 1, 0);
          mat.alpha = 0.2;
          mat.backFaceCulling = false; // pour voir la face interne aussi
          debugRange.material = mat; */


          this.sight = MeshBuilder.CreateSphere(
            "patrolRange_" + this.name,
            {
              diameter: this.attackRange * 2,
              segments: 16,       // plus c’est grand, plus c’est rond
              slice: 0.5          // 0.5 = hémisphère (la moitié haute uniquement)
            },
            scene
          );

          // Positionner le demi‑sphere à la bonne hauteur
          this.sight.position = this.mesh.position.clone();
          this.sight.position.y = 0; // centrer la demi‑sphere
          
          // Matériau semi‑transparent
          const mat2 = new StandardMaterial(`rangeMat_${this.name}`, scene);
          mat2.diffuseColor = new Color3(1, 0, 0);
          mat2.alpha = 0.2;
          mat2.backFaceCulling = false; // pour voir la face interne aussi
          this.sight.material = mat2;

          this.sight.parent = this.mesh;
        
              
    }

    


    // GENERAL BEHAVIOUR 
    public update(deltaTime: number): void {
        switch (this.state) {
            case EnemyState.STATE_PATROL:
                this.patrol(deltaTime);
                break;
            case EnemyState.STATE_SENSE:
                this.playAnimationSenseSomething();
                break;
            case EnemyState.STATE_ATTACK:
                this.attackPlayer(this.player);
                break;
            case EnemyState.STATE_DEAD:
                this.die();
                this.state = null;
                break;
            case EnemyState.STATE_RESPAWN:
                this.respawn();
                break; 
            case null : 
                this.animationManager.stopAll();
            default:
                console.debug("[Enemy] " + this.name + " is in the following state: " + this.state);
                break;
        }

    }

    public patrol(deltaTime : number): void {
        // Check if path is empty 
        if (this.path.length == 0) {
            this.path = this.navPlugin.computePath(this.navPlugin.getClosestPoint(this.mesh.position), this.navPlugin.getClosestPoint(this.patrolPoints[this.currentPatrolPointsIndex])); // Compute a new path to the next patrol point
            this.currentPathIndex = 0; // Reset path index
        }

        // Check if player is in attack range 
        if( this.isPlayerInAttackRange() ) {
            this.state = EnemyState.STATE_ATTACK;
            this.path = [];
            this.currentPathIndex = 0;
            return;

        }

        const currentPos = this.mesh.position.clone(); // Clone current position to avoid modifying original
        const target = this.path[this.currentPathIndex];
        const direction = target.subtract(this.mesh.position).normalize(); // Calculate direction to target



        // If the enemy is close to the target, move to the next point in the path
        const distanceToTarget = Vector3.Distance(this.mesh.position, target);
        if (distanceToTarget < 0.1) {
            this.currentPathIndex++; // Move to next point in path
            if (this.currentPathIndex >= this.path.length) {
                console.debug("[Enemy] " + this.name + " has reached the patrol point.");

                // Compute a new path if the enemy has reached the last point of the current path
                this.currentPatrolPointsIndex = (this.currentPatrolPointsIndex + 1) % this.patrolPoints.length; // Compute a path to the next patrol point
                this.currentPatrolPointsIndex = Math.floor(Math.random() * this.patrolPoints.length);
                this.path = this.navPlugin.computePath(this.navPlugin.getClosestPoint(this.mesh.position), this.navPlugin.getClosestPoint(this.patrolPoints[this.currentPatrolPointsIndex])); // Compute a new path to the next patrol point
                this.currentPathIndex = 0; // Reset path index
                // Play animation when reaching the patrol point
                this.state = EnemyState.STATE_SENSE;
                
            }
            return;
        }

        // Enemy Rotation 
        MovementUtils.applyLookAtSmooth(this.mesh, target, 0.02); // Smoothly rotate the enemy to face the target point

        // Move towards the target point
        const step = direction.scale(this.speed * deltaTime);
        const newPosition = this.navPlugin.moveAlong(currentPos, currentPos.add(step));
        this.mesh.position.copyFrom(newPosition);
        this.playAnimationWalk(); // Play walk animation

             
    }



   /*  public chasePlayer(player: Character, deltaTime: number): void {
        // ReCompute the path to the player if the path is empty or if the player has moved significantly	
        if (!this.player) return;


        // Check if the player is in attack range 
        if(this.isPlayerInAttackRange()) {
            this.state = EnemyState.STATE_ATTACK; // Change state to attack
            console.debug("[Enemy] " + this.name + " is attacking the player.");
            return;
        }

        // Check if the player is out of detection range
        if(!this.isPlayerInDetectionRange()) {
            this.state = EnemyState.STATE_PATROL; // Change state to patrol
            console.debug("[Enemy] " + this.name + " has lost sight of the player and is now patrolling.");
            return;
        }

        const currentPos = this.mesh.position.clone(); // Clone current position to avoid modifying original
        const target = this.player.mesh.position; // Target is the player position
        const direction = target.subtract(this.mesh.position).normalize(); // Calculate direction to target


        // Move towards the player
        const step = direction.scale(this.runSpeed * deltaTime);
        const newPosition = this.navPlugin.moveAlong(currentPos, currentPos.add(step));
        this.mesh.position.copyFrom(newPosition);
        this.mesh.lookAt(target); // Rotate the enemy to face the target point
        // TODO : Play run animation

    } */


    

    public takeDamage(amount: number): void {
        this.currentHealth = Math.max(this.currentHealth - amount, 0); // Reduce current life by the damage amount

        this.animationManager.play("GetHit", false, () => {
            // check current life 
            if (this.currentHealth <= 0) {
                this.currentlife = Math.max(this.currentlife - 1, 0); // Reduce current life 

                if (this.currentlife <= 0) {
                    this.state = EnemyState.STATE_DEAD; // Change state to dead
                    console.debug("[Enemy] " + this.name + " is dead.");
                    return;
                } 
                else {   
                    this.state = EnemyState.STATE_RESPAWN; // Change state to respawn
                    console.debug("[Enemy] " + this.name + " is respawning.");
                    return;
                }
            }

            this.state = EnemyState.STATE_PATROL; // Change state to patrol after taking damage
        });
        
    }


    public die(): void {
        this.animationManager.play("Die", false, () => {
            this.state = null; 
            setTimeout(() => {
                this.mesh.dispose(); // Dispose the enemy mesh
                console.debug("[Enemy] " + this.name + " has been disposed.");
            }
            , 2000); // Wait for 1 second before disposing the mesh
        });
    }

    public respawn() {
        this.currentHealth = this.maxHealth; // Reset current health to max health
        this.mesh.position.copyFrom(this.initialPosition); // Reset position to initial position
        this.isAttacking = false; // Reset attacking state
        this.attackCooldown = false; // Reset attack cooldown

        this.animationManager.play("dizzy", true);   

        setTimeout(() => {
            this.state = EnemyState.STATE_PATROL; // Change state to patrol after respawn
            console.debug("[Enemy] " + this.name + " has respawned and is now patrolling.");
            
        }, 1000); // Wait for 1 second before playing the animation again

    }


    public isPlayerInAttackRange(): boolean {
        const distance = this.mesh.position.subtract(this.player.mesh.position).length(); // Calculate distance to player  
        return distance <= this.attackRange;
    }


    public pathNeedsUpdate(target: Vector3): boolean {
        return Vector3.Distance(this.mesh.position, target) > 1 || Date.now() - this.lastUpdate > 500; 
    }



    public abstract playAnimationIdle();

    public abstract attackPlayer(player: Character): void ;

    public abstract playAnimationSenseSomething() ;

    public abstract playAnimationWalk() ;

    public playAnimationGetHit() : void {}



}


/* 
     // Wait for Recast to be ready
            const recast = await  Recast(); // Recast est une promesse, donc on attend qu'elle soit résolue avant de continuer

            // utilisation de navMesh pour la navigation
            const navPlugin = new RecastJSPlugin(recast);

            const navParams = {
                cs: 0.2,
                ch: 0.2,
                walkableSlopeAngle: 35,
                walkableHeight: 1,
                walkableClimb: 1,
                walkableRadius: 1,
                maxEdgeLen: 12,
                maxSimplificationError: 1.3,
                minRegionArea: 8,
                mergeRegionArea: 20,
                maxVertsPerPoly: 6,
                detailSampleDist: 6,
                detailSampleMaxError: 1,
            };

            // creation de la zone "walkable" ici la zone "walkable" est le sol
            navPlugin.createNavMesh([ground], navParams, );

            // DEBUG de nav mesh
            const debugMesh = navPlugin.createDebugNavMesh(scene);
            debugMesh.material = new StandardMaterial("debugMat", scene);
            debugMesh.material.alpha = 0.2;

            // creation du personnage SHERE
            const playerMesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
            const player = new Player("player", playerMesh);
            player.mesh.position = new Vector3(0, 0.5, -5); // Positionner le joueur dans la scène
            player.mesh.ellipsoid = new Vector3(0.75, 0.75, 0.75); // sphère de collision plus petite
            player.mesh.ellipsoidOffset = new Vector3(0, 0, 0); // centré
            player.mesh.checkCollisions = true; // Activer les collisions pour le joueur
            
            // Creation du monstre 
            const chestMonsterAsset = assetsManager.getEnemyClone("beholder_monster");
            const chestMonsterMesh = chestMonsterAsset.mesh;
            const chestMonsterAnimationGroups = chestMonsterAsset.animationGroups;
            const chestMonster = new BeholderMonster("chestMonster", chestMonsterMesh,chestMonsterAnimationGroups, new Vector3(0, 0, 0), player, navPlugin, 8, [new Vector3(5,0,0),new Vector3(0,0,5), new Vector3(-5,0,0), new Vector3(0,0,-5) ], 10, scene);
            chestMonster.mesh.position = new Vector3(0, 0.1, 0); // Positionner le monstre dans la scène
            chestMonster.mesh.rotation.y = Math.PI; // rotation de 180° autour de Y a cause de blender 


            // run the main render loop
            engine.runRenderLoop(() => {
                scene.render();
                chestMonster.update(engine.getDeltaTime() / 1000); // Mettre à jour le monstre
            });

*/