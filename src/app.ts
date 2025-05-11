import { AnimationManager } from './utils/AnimationManager';
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder , Color3, GlowLayer, Texture, Color4 } from "@babylonjs/core";
import Recast from "recast-detour";
import { RecastJSPlugin } from "@babylonjs/core/Navigation";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { AssetsLoader } from "./utils/AssetsLoader";
import { ChestMonster } from "./entities/enemies/ChestMonster";
import { Player } from "./entities/Player";
import { BeholderMonster } from "./entities/enemies/BeholderMonster";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Knight } from "./entities/players/Knight";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";


class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Canvas not found");
        }

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        // Debug layer
        scene.debugLayer.show({
            embedMode: true,
            handleResize: true,
            overlay: true,
            showExplorer: true,
            showInspector: true,
        });

        // Assets loader
        const assetsManager = new AssetsLoader(scene);
        assetsManager.loadAllAssets(async () => {

            // Creation de la scene
            // Remplacez la création de la caméra ArcRotateCamera par :
            var camera = new FreeCamera("camera", new Vector3(0, 2, -5), scene);
            camera.attachControl(canvas, true);
            camera.minZ = 0.1;
            camera.speed = 0;
            camera.attachControl(canvas, true);
            var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);


            // creation du sol 
            const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
            const groundMaterial = new StandardMaterial("groundMaterial", scene);
            groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
            ground.material = groundMaterial;
            ground.checkCollisions = true; // Activer les collisions pour le sol


            // Création du héros
            const heroAsset = assetsManager.getHeroClone("boyHero");
            const heroMesh = heroAsset.mesh;
            heroMesh.position.y = 0.5; // Position initiale légèrement au-dessus du sol
            heroMesh.checkCollisions = true;

            const heroAnimationGroups = heroAsset.animationGroups;
            const knight = new Knight(heroMesh, heroAnimationGroups, canvas);

            
;
            // run the main render loop
            engine.runRenderLoop(() => {
                scene.render();
                knight.update(engine.getDeltaTime()/1000); // Mettre à jour le héros à chaque frame
            });

            
        }); 
    }  
    
    
   

    

    

    
}


new App();