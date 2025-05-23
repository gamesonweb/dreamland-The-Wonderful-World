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
    private camera: FreeCamera | null = null;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error("Canvas not found");
        }

        this.engine = new Engine(this.canvas, true);
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
            this.camera = new FreeCamera("camera", new Vector3(0, 2, -5), this.scene);
            this.camera.minZ = 0.1;
            this.camera.speed = 0;
            this.camera.attachControl(this.canvas, true); // Enable camera controls immediately
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
            const knight = new Knight(heroMesh, heroAnimationGroups, this.canvas);
            console.log(`Knight Initial Health: ${knight.currentHealth}/${knight.maxHealth}, Power: ${knight.currentPower}/${knight.maxPower}, Mana: ${knight.currentMana}/${knight.maxMana}`);

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
            console.log(`Beholder Initial Health: ${chestMonster.currentHealth}/${chestMonster.maxHealth}`);

            this.ui = new GameUI(this.scene);
            const collisionManager = new CollisionsManager(knight, [chestMonster]);
            collisionManager.update(knight);

            this.engine.runRenderLoop(() => {
                this.scene!.render();
                const dt = this.engine!.getDeltaTime() / 1000;
                knight.update(dt);
                chestMonster.update(dt);
                console.log(`Knight Health in Loop: ${knight.currentHealth}/${knight.maxHealth}, Power: ${knight.currentPower}/${knight.maxPower}, Mana: ${knight.currentMana}/${knight.maxMana}`);
                this.ui!.updatePlayerHealth(knight.currentHealth, knight.maxHealth);
                this.ui!.updatePlayerPower(knight.currentPower, knight.maxPower);
                this.ui!.updateEnemyHealth(chestMonster.currentHealth, chestMonster.maxHealth);
                // this.ui!.updateEnemyPower(chestMonster.currentPower, chestMonster.maxPower); // Commented out as per user
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