import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Character } from "./Character";
import { Scene } from "@babylonjs/core/scene";

export class Player extends Character {
    public scene: Scene; // Référence à la scène Babylon.js


    constructor( name: string, mesh: AbstractMesh) {
        super(name, mesh, 2, 5, 0); // Appel du constructeur de la classe parente
        this.scene  = this.mesh.getScene(); // Récupération de la scène à partir du mesh
    }
}