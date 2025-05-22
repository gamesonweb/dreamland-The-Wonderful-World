import { AbstractMesh } from "@babylonjs/core";
import { Mesh, Quaternion, Vector3 } from "@babylonjs/core";

export abstract class Character {
    public name :string; 
    public mesh : AbstractMesh; 

    // Propriétés metadonnées du personnage
    public currentlife: number; // Points de vie
    public maxLife: number; // Points de vie maximum
    public currentHealth: number; // Points de vie actuel
    public maxHealth: number; // Points de vie maximum
    public currentMana: number = 50;
    public maxMana: number = 50;

    public speed: number; // Vitesse de déplacement
    public runSpeed: number; // Vitesse de course
    public accelaration: number; // Accélération
   

    constructor(
        name: string,
        mesh: AbstractMesh,
        speed: number,
        runSpeed: number,
        accelaration: number,     
    ) {
        this.name = name;
        this.mesh = mesh;
        this.speed = speed;
        this.runSpeed = runSpeed;
        this.accelaration = accelaration; 
    }

    /** Note :  Pouvoir froler les mur plus tard et ne pas rester bloqué */

    // Creer un elipsoide autour du CHARACTER pour la gestion de la collision
    public createElipsoidCollision() : void {
      this.mesh.ellipsoid = new Vector3(1, 1, 1); // Crée un ellipsoïde de collision autour de l'ennemi
      const offsetY = 0.0;
      this.mesh.ellipsoidOffset = new Vector3(0, offsetY, 0); // Décalage de l'ellipsoïde 
  }

    

    






}