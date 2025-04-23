import * as BABYLON from "babylonjs";
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
function createScene() {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.6, 1, 0.6);
    ground.material = groundMaterial;
    function addSkybox(scene) {
        const skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 1000 }, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyboxMat", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = new BABYLON.Color3(1, 0.7, 0.8);
        skybox.material = skyboxMaterial;
    }
    function addLake(scene) {
        const lake = BABYLON.MeshBuilder.CreateGround("lake", { width: 10, height: 10 }, scene);
        lake.position = new BABYLON.Vector3(5, 0.01, 5);
        const lakeMaterial = new BABYLON.StandardMaterial("lakeMat", scene);
        lakeMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1);
        lake.material = lakeMaterial;
    }
    function addObstacles(scene) {
        const obstacle1 = BABYLON.MeshBuilder.CreateBox("obstacle1", { size: 2 }, scene);
        obstacle1.position = new BABYLON.Vector3(-5, 1, -5);
        const obstacleMat1 = new BABYLON.StandardMaterial("obstacleMat1", scene);
        obstacleMat1.diffuseColor = new BABYLON.Color3(0.7, 1, 0.5);
        obstacle1.material = obstacleMat1;
        const obstacle2 = BABYLON.MeshBuilder.CreateBox("obstacle2", { size: 1.5 }, scene);
        obstacle2.position = new BABYLON.Vector3(0, 0.75, 10);
        const obstacleMat2 = new BABYLON.StandardMaterial("obstacleMat2", scene);
        obstacleMat2.diffuseColor = new BABYLON.Color3(0.8, 0.6, 1);
        obstacle2.material = obstacleMat2;
    }
    addSkybox(scene);
    addLake(scene);
    addObstacles(scene);
    return scene;
}
const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});
window.addEventListener("resize", () => {
    engine.resize();
});
//# sourceMappingURL=environment.js.map