import "@babylonjs/loaders";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, CannonJSPlugin } from "@babylonjs/core";
import { HeroController } from "./entities/players/HeroController";  
import { createGround } from "./entities/players/Ground";
import * as cannon from "cannon";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 20, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

// Enable physics
scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin(true, 10, cannon));

// Add ground and hero
createGround(scene);
new HeroController(scene);

engine.runRenderLoop(() => {
  scene.render();
});
