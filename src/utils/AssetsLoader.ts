import { Scene, AssetsManager, MeshAssetTask, TextureAssetTask } from "@babylonjs/core";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { TransformNode } from "@babylonjs/core";

type LoadedAsset = {
    mesh: AbstractMesh;
    animationGroups: AnimationGroup[];
}


export class AssetsLoader {
    private assetsManager: AssetsManager;
    private scene: Scene;

    // Dictionnaires pour stocker les assets chargés
    private heroContainers: { [key: string]: AssetContainer } = {};
    private enemyContainers: { [key: string]: AssetContainer } = {};
    private texturesAssets: { [key: string]: TextureAssetTask } = {};


    constructor(scene: Scene) {
        this.scene = scene;
        this.assetsManager = new AssetsManager(scene);
    }

    

    // Telechargement général
    public loadAllAssets(onFinish?: () => void): void {
        this.loadHeroesAssets();
        this.loadEnemiesAssets();

        // Callback quand tous les assets sont chargés
        this.assetsManager.onFinish = (tasks) => {
            console.log("All assets loaded successfully!");
            onFinish?.(); // Appeler la fonction de rappel si fournie
        };

        //Callback pour chaque erreurs
        this.assetsManager.onTaskError = (task) => {
            console.error(`Error loading ${task.name}: ${task.errorObject.message}`);
        };

        // Callback pour chaque tâche de chargement
        this.assetsManager.onProgress = (remainingCount, totalCount) => {
            console.log(`Remaining tasks: ${totalCount - remainingCount} / ${totalCount}`);
        }

        // Démarrer le chargement
        this.assetsManager.load();
    }



    // Ajouter les assets des ennemis
    public loadEnemiesAssets(): void {
        const enemies = ["beholder_monster", "chest_monster",];
    
        enemies.forEach((enemy) => {
            const task = this.assetsManager.addMeshTask(
                `${enemy}_task`, "", "assets/models/enemy/", `${enemy}.glb`
            );
            
            task.onSuccess = (task) => {
                const container = new AssetContainer(this.scene);
                
                // Add all transform nodes first
                task.loadedTransformNodes?.forEach(transformNode => {
                    container.transformNodes.push(transformNode);
                });
    
                // Then add meshes
                task.loadedMeshes.forEach(mesh => {
                    container.meshes.push(mesh);
                    
                    // Ensure all parents are transform nodes in the container
                    let parent = mesh.parent;
                    while (parent) {
                        if (parent instanceof TransformNode && 
                            !container.transformNodes.includes(parent)) {
                            container.transformNodes.push(parent);
                        }
                        parent = parent.parent;
                    }
                });
    
                // Add Animation
                task.loadedAnimationGroups.forEach(anim => 
                    container.animationGroups.push(anim));

                // Add skeleton
                task.loadedSkeletons?.forEach(skeleton => 
                    container.skeletons.push(skeleton));
                
                // Remove Asset from 
                container.removeAllFromScene();
                this.enemyContainers[enemy] = container;
            };
        });
    }


    public loadHeroesAssets(): void {
        const heroes = ["boy_hero_knight","boyHero"];
    
        heroes.forEach((hero) => {
            const task = this.assetsManager.addMeshTask(
                `${hero}_task`, "", "assets/models/hero/", `${hero}.glb`
            );
            
            task.onSuccess = (task) => {
                const container = new AssetContainer(this.scene);
                
                // Add all transform nodes first
                task.loadedTransformNodes?.forEach(transformNode => {
                    container.transformNodes.push(transformNode);
                });
    
                // Then add meshes
                task.loadedMeshes.forEach(mesh => {
                    container.meshes.push(mesh);
                    
                    // Ensure all parents are transform nodes in the container
                    let parent = mesh.parent;
                    while (parent) {
                        if (parent instanceof TransformNode && 
                            !container.transformNodes.includes(parent)) {
                            container.transformNodes.push(parent);
                        }
                        parent = parent.parent;
                    }
                });
    
                // Add Animation
                task.loadedAnimationGroups.forEach(anim => 
                    container.animationGroups.push(anim));

                // Add skeleton
                task.loadedSkeletons?.forEach(skeleton => 
                    container.skeletons.push(skeleton));
                
                // Remove Asset from 
                container.removeAllFromScene();
                this.heroContainers[hero] = container;
            };
        });
    }

    


    
    
    // TODO : Ajouter un parametre pour indiquer le type de l'asset au lieu de repliquer la meme fonction
    public getEnemyClone(name: string): LoadedAsset | null {
        const container = this.enemyContainers[name];
        if (!container) return null;
    
        const entries = container.instantiateModelsToScene(
            (sourceName) => `${sourceName}`,
            false
        );
    
        // Find the main mesh (first root node that's a mesh)
        const mainMesh = entries.rootNodes.find(node => node instanceof AbstractMesh) as AbstractMesh;
        
        if (!mainMesh) {
            console.error("No mesh found in cloned assets");
            return null;
        }
    
        return {
            mesh: mainMesh,
            animationGroups: entries.animationGroups
        };
    }


    public getHeroClone(name: string): LoadedAsset | null {
        const container = this.heroContainers[name];
        if (!container) return null;
    
        const entries = container.instantiateModelsToScene(
            (sourceName) => `${sourceName}`,
            false
        );
    
        // Find the main mesh (first root node that's a mesh)
        const mainMesh = entries.rootNodes.find(node => node instanceof AbstractMesh) as AbstractMesh;
        
        if (!mainMesh) {
            console.error("No mesh found in cloned assets");
            return null;
        }
    
        return {
            mesh: mainMesh,
            animationGroups: entries.animationGroups
        };
    }



    
}