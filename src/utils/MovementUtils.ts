import { Vector3 } from "@babylonjs/core";
import { AbstractMesh } from "@babylonjs/core";
import { Quaternion } from "@babylonjs/core";

export class MovementUtils {

    
    /**
     * Applique une rotation douce (slerp) pour orienter un mesh vers une position cible.
     * @param mesh - Le mesh à orienter.
     * @param targetPosition - La position vers laquelle regarder.
     * @param slerpFactor - Vitesse d'interpolation (entre 0 et 1), 0.1 = fluide.
     */
    public static applyLookAtSmooth(mesh: AbstractMesh, targetPosition: Vector3, slerpFactor: number = 0.1): void {
      // Calculer la direction vers la cible, projetée sur le plan XZ (ignorer Y)
      const direction = new Vector3(targetPosition.x - mesh.position.x, 0, targetPosition.z - mesh.position.z);
      
      // Normaliser la direction (éviter une division par zéro)
      if (direction.lengthSquared() < 0.0001) {
        return; // Pas de rotation si la cible est trop proche
      }
      direction.normalize();
  
      // Calculer l'angle yaw (rotation autour de Y)
      const forward = new Vector3(0, 0, -1); // Direction "avant" du mesh
      const dot = Vector3.Dot(forward, direction);
      const angle = Math.acos(Math.min(Math.max(dot, -1), 1)); // Angle entre forward et direction
      const cross = Vector3.Cross(forward, direction).y; // Signe de la rotation (positif = horaire)
      const yaw = cross >= 0 ? angle : -angle; // Ajuster le signe
  
      // Créer le quaternion pour la rotation autour de Y
      const desiredRotation = Quaternion.RotationAxis(Vector3.Up(), yaw);
  
      // Obtenir la rotation actuelle
      const currentRotation = mesh.rotationQuaternion ?? Quaternion.FromEulerVector(mesh.rotation);
  
      // Interpoler vers la rotation désirée
      mesh.rotationQuaternion = Quaternion.Slerp(currentRotation, desiredRotation, slerpFactor);
    }


     
      
      
}