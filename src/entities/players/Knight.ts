import { HeroController } from "./HeroController";
import { AnimationGroup, AbstractMesh } from "@babylonjs/core";

export class Knight extends HeroController {
    
    public constructor( mesh: AbstractMesh,animationGroups: AnimationGroup[], canvas: HTMLCanvasElement){
        super('Knight', mesh, animationGroups, canvas); 
    }


}