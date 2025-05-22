import { Character } from "../Character"

export abstract class Enemy extends Character {
    // Attribut pour attaque et Dommage
    public attackRange : number ; // Portée d'attaque de l'ennemi
    public isAttacking : boolean;
    public attackCooldown : boolean; // Cooldown d'attaque de l'ennemi

    public attackDamage: number; 

}