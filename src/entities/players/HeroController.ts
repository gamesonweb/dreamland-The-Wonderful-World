import * as BABYLON from '@babylonjs/core';
import * as GUI from "@babylonjs/gui";
import { AnimationManager } from "../../utils/AnimationManager";
import { EnemyTest } from "./EnemyTest";


enum HeroState {
  IDLE = "idle",
  RUNNING = "running",
  JUMPING = "jumping",
  ATTACKING = "attacking",
  DEFENDING = "defending",
}

const HERO_CONFIG = {
  MOVE_SPEED: 0.1,
  JUMP_IMPULSE: 5,
  ATTACK_COOLDOWN_MS: 1500,
  PARTICLE_EMIT_RATE: 300,
};

export class HeroController {
  private enemy: EnemyTest;
  private heroMesh: BABYLON.AbstractMesh | null = null;
  private inputMap: Record<string, boolean> = {};
  private keyPressed: Record<string, boolean> = {};
  private animationManager: AnimationManager | null = null;
  private currentState: HeroState = HeroState.IDLE;
  private attackCooldown = false;
  private isJumping = false;
  private isActionLocked = false;
  private particleSystem: BABYLON.ParticleSystem | null = null;
  private scene: BABYLON.Scene;
  private camera: BABYLON.FreeCamera | null = null;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
    this.loadHero();
    // TEMP ENEMY
    this.enemy = new EnemyTest(scene, new BABYLON.Vector3(0, 1, 5));

  }

  private async loadHero() {
    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "assets/models/hero/",
        "boy_hero_knight.glb",
        this.scene
      );

      this.heroMesh = result.meshes[0];
      this.heroMesh.position = new BABYLON.Vector3(0, 2, 0);

      this.heroMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        this.heroMesh,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 1, restitution: 0, friction: 0.5 },
        this.scene
      );

      const ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 50, height: 1, depth: 50 }, this.scene);
      ground.position.y = -0.5;
      ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0, friction: 0.5 },
        this.scene
      );

      this.animationManager = new AnimationManager(result.animationGroups, this.scene);
      this.transitionToState(HeroState.IDLE);
      this.createAttackParticles();
      this.setupCamera();
      this.setupInput();
      this.scene.onBeforeRenderObservable.add(() => this.update());
    } catch (error) {
      console.error("Failed to load hero mesh:", error);
    }
  }

  private setupCamera() {
    this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), this.scene);
    this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
    this.camera.lockedTarget = this.heroMesh;
    this.scene.activeCamera = this.camera;
  }

  private setupInput() {
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);

    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
        const rawKey = evt.sourceEvent.key;
        let key = rawKey.toLowerCase().trim();
        if (key === "arrowup") key = "w";
        if (key === "arrowdown") key = "s";
        if (key === "arrowleft") key = "a";
        if (key === "arrowright") key = "d";
        this.inputMap[key] = true;

        if (!this.keyPressed[key] && !this.isActionLocked) {
          this.keyPressed[key] = true;
          if (this.currentState === HeroState.IDLE || this.currentState === HeroState.RUNNING) {
            if (key === " " && !this.isJumping) {
              const velocityY = this.heroMesh?.physicsImpostor?.getLinearVelocity()?.y ?? 0;
              if (Math.abs(velocityY) < 2.0) {
                this.isJumping = true;
                this.isActionLocked = true;
                this.transitionToState(HeroState.JUMPING);
              }
            } else if (key === "f" && !this.attackCooldown) {
              this.isActionLocked = true;
              this.transitionToState(HeroState.ATTACKING);
            } else if (key === "g") {
              this.isActionLocked = true;
              this.transitionToState(HeroState.DEFENDING);
            }
          }
        }
      })
    );

    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
        let key = evt.sourceEvent.key.toLowerCase().trim();
        if (key === "arrowup") key = "w";
        if (key === "arrowdown") key = "s";
        if (key === "arrowleft") key = "a";
        if (key === "arrowright") key = "d";
        this.inputMap[key] = false;
        this.keyPressed[key] = false;
      })
    );
  }

  private createAttackParticles() {
    const particleSystem = new BABYLON.ParticleSystem("attackParticles", 200, this.scene);
    particleSystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png", this.scene);
    particleSystem.emitter = this.heroMesh;
    particleSystem.minEmitBox = new BABYLON.Vector3(0, 1, 0.5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0, 1, 0.5);
    particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 1, 0, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.1;
    particleSystem.maxLifeTime = 0.3;
    particleSystem.emitRate = HERO_CONFIG.PARTICLE_EMIT_RATE;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-1, 0, 1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 0, -1);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.01;
    this.particleSystem = particleSystem;
  }

  private update() {
    if (!this.heroMesh || !this.animationManager || !this.heroMesh.physicsImpostor) return;

    const moveDirection = new BABYLON.Vector3(0, 0, 0);
    let moving = false;

    if (!this.isActionLocked) {
      if (this.inputMap["w"]) {
        moveDirection.z += 1;
        moving = true;
      }
      if (this.inputMap["s"]) {
        moveDirection.z -= 1;
        moving = true;
      }
      if (this.inputMap["a"]) {
        moveDirection.x -= 1;
        moving = true;
      }
      if (this.inputMap["d"]) {
        moveDirection.x += 1;
        moving = true;
      }
    }

    if (moving) {
      moveDirection.normalize().scaleInPlace(HERO_CONFIG.MOVE_SPEED);
      this.heroMesh.moveWithCollisions(moveDirection);
      this.heroMesh.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
      if (this.currentState !== HeroState.JUMPING) {
        this.transitionToState(HeroState.RUNNING);
      }
    } else if (!this.isActionLocked && this.currentState !== HeroState.JUMPING) {
      this.transitionToState(HeroState.IDLE);
    }

    if (this.isJumping) {
      const velocityY = this.heroMesh.physicsImpostor.getLinearVelocity()!.y;
      if (Math.abs(velocityY) > 2.0) {
        this.animationManager.play("jumpairnormal", false);
      } else if (Math.abs(velocityY) <= 2.0 && this.currentState === HeroState.JUMPING) {
        this.isJumping = false;
        this.isActionLocked = false;
        this.animationManager.play("jumpendnormal", false, () => {
          this.transitionToState(HeroState.IDLE);
        });
      }
    }
  }

  private transitionToState(newState: HeroState) {
    if (this.currentState === newState || !this.animationManager) return;

    this.currentState = newState;
    switch (newState) {
      case HeroState.IDLE:
        this.isActionLocked = false;
        this.isJumping = false;
        this.animationManager.play("idlenormal");
        break;
      case HeroState.RUNNING:
        if (this.inputMap["w"]) this.animationManager.play("runfowardbattle");
        else if (this.inputMap["s"]) this.animationManager.play("movebackwardbattle");
        else if (this.inputMap["a"]) this.animationManager.play("moveleftbattle");
        else if (this.inputMap["d"]) this.animationManager.play("moverightbattle");
        break;
      case HeroState.JUMPING:
        const jumpAnim = this.animationManager.getAvailableAnimations().includes("jumpstartnormal")
          ? "jumpstartnormal"
          : "jumpfullnormal";
        this.animationManager.play(jumpAnim, false, () => {
          if (this.isJumping) {
            this.animationManager.play("jumpairnormal", false);
          }
        });
        this.heroMesh!.physicsImpostor!.applyImpulse(
          new BABYLON.Vector3(0, HERO_CONFIG.JUMP_IMPULSE, 0),
          this.heroMesh!.getAbsolutePosition()
        );
        break;
      case HeroState.ATTACKING:
        this.attackCooldown = true;
        const attacks = ["attack 1", "attack 2", "attack 3", "attack 4"];
        const randomAttack = attacks[Math.floor(Math.random() * attacks.length)];
        this.animationManager.play(randomAttack, false, () => {
          this.isActionLocked = false;
          this.transitionToState(HeroState.IDLE);
        });
        this.particleSystem?.start();
        setTimeout(() => {
          this.particleSystem?.stop();
          this.attackCooldown = false;
        }, HERO_CONFIG.ATTACK_COOLDOWN_MS);
        break;
      case HeroState.DEFENDING:
        this.animationManager.play("defend", false, () => {
          this.isActionLocked = false;
          this.transitionToState(HeroState.IDLE);
        });
        break;
    }
  }
}