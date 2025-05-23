import { AnimationManager } from './utils/AnimationManager';
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder, Color3, StandardMaterial } from "@babylonjs/core";
import Recast from "recast-detour";
import { RecastJSPlugin } from "@babylonjs/core/Navigation";
import { AssetsLoader } from "./utils/AssetsLoader";
import { BeholderMonster } from "./entities/enemies/BeholderMonster";
import { Knight } from "./entities/players/Knight";
import { CollisionsManager } from './game/CollisionsManager';
import { GameUI } from "./ui/GameUI";

class App {
    private ui: GameUI | null = null;
    private engine: Engine | null = null;
    private scene: Scene | null = null;

    constructor() {
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Canvas not found");
        }

        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);

        this.scene.debugLayer.show({
            embedMode: true,
            handleResize: true,
            overlay: true,
            showExplorer: true,
            showInspector: true,
        });

        const assetsManager = new AssetsLoader(this.scene);
        assetsManager.loadAllAssets(async () => {
            var camera = new FreeCamera("camera", new Vector3(0, 2, -5), this.scene);
            camera.attachControl(canvas, true);
            camera.minZ = 0.1;
            camera.speed = 0;
            camera.attachControl(canvas, true);
            var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);

            const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this.scene);
            const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
            groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
            ground.material = groundMaterial;
            ground.checkCollisions = true;

            const heroAsset = assetsManager.getHeroClone("boy_hero");
            const heroMesh = heroAsset.mesh;
            heroMesh.position.y = 0.5;
            heroMesh.checkCollisions = true;
            const heroAnimationGroups = heroAsset.animationGroups;
            const knight = new Knight(heroMesh, heroAnimationGroups, canvas);
            console.log(`Knight Initial Health: ${knight.currentHealth}/${knight.maxHealth}`); // Debug log

            const recast = await Recast();
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
            navPlugin.createNavMesh([ground], navParams);

            const chestMonsterAsset = assetsManager.getEnemyClone("beholder_monster");
            const chestMonsterMesh = chestMonsterAsset.mesh;
            const chestMonsterAnimationGroups = chestMonsterAsset.animationGroups;
            const chestMonster = new BeholderMonster("chestMonster", chestMonsterMesh, chestMonsterAnimationGroups, new Vector3(0, 0, 0), knight, navPlugin, 8, [new Vector3(5, 0, 0), new Vector3(0, 0, 5), new Vector3(-5, 0, 0), new Vector3(0, 0, -5)], 10, this.scene);
            chestMonster.mesh.position = new Vector3(0, 0.1, 0);
            chestMonster.mesh.rotation.y = Math.PI;
            console.log(`Beholder Initial Health: ${chestMonster.currentHealth}/${chestMonster.maxHealth}`); // Debug log

            this.ui = new GameUI(this.scene);
            const collisionManager = new CollisionsManager(knight, [chestMonster]);
            collisionManager.update(knight);

            this.engine.runRenderLoop(() => {
                this.scene!.render();
                const dt = this.engine!.getDeltaTime() / 1000;
                knight.update(dt);
                chestMonster.update(dt);
                this.ui!.updatePlayerHealth(knight.currentHealth, knight.maxHealth);
                //this.ui!.setPlayerState(knight.isGettingHit ? "Getting Hit" : knight.isDefending ? "Defending" : knight.isAttacking ? "Attacking" : "Idle");
                this.ui!.updateEnemyHealth(chestMonster.currentHealth, chestMonster.maxHealth);
                //this.ui!.setEnemyState(chestMonster.state?.toString() || "Idle");
            });
        });
    }

    public dispose(): void {
        if (this.ui) {
            this.ui.dispose();
            this.ui = null;
        }
        if (this.scene) {
            this.scene.dispose();
            this.scene = null;
        }
        if (this.engine) {
            this.engine.dispose();
            this.engine = null;
        }
    }
}

new App();