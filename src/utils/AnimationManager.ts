import { AnimationGroup, Scene } from "@babylonjs/core";

export class AnimationManager {
  private animations: Record<string, AnimationGroup> = {};
  private currentAnimation: AnimationGroup | null = null;
  private scene: Scene;

  constructor(animationGroups: AnimationGroup[], scene: Scene) {
    this.scene = scene;
    animationGroups.forEach((anim) => {
      this.animations[anim.name.toLowerCase()] = anim;
    });
    console.log("Available animations:", this.getAvailableAnimations());
  }

  /**
   * Plays an animation with optional looping and end callback
   * @param name Animation name
   * @param loop Whether to loop the animation
   * @param onEnd Callback to execute when animation ends
   */
  play(name: string, loop: boolean = true, onEnd?: () => void) {
    const anim = this.animations[name.toLowerCase()];
    if (!anim) {
        console.warn(`Animation "${name}" not found`);
        return;
    }

    // Si la même animation est déjà en cours, ne rien faire
    if (this.currentAnimation === anim && anim.isPlaying) {
        return;
    }

    // Arrêter l'animation précédente si elle existe
    if (this.currentAnimation && this.currentAnimation !== anim) {
        this.currentAnimation.stop();
    }

    // Configurer et jouer la nouvelle animation
    anim.reset();
    anim.loopAnimation = loop;
    anim.play(loop);

    // Gestion du callback de fin
    if (onEnd && !loop) {
        const endObserver = anim.onAnimationGroupEndObservable.addOnce(() => {
            onEnd();
            if (this.currentAnimation === anim) {
                this.currentAnimation = null;
            }
        });
        
        // Nettoyage si l'animation est interrompue
        anim.onAnimationGroupPlayObservable.addOnce(() => {
            anim.onAnimationGroupEndObservable.remove(endObserver);
        });
    }

    this.currentAnimation = anim;
  }

  /**
   * Cross-fades between two animations
   * @param from Current animation
   * @param to Target animation
   * @param duration Fade duration in seconds
   */
  crossFade(from: AnimationGroup, to: AnimationGroup, duration: number, loop) {
    to.reset();
    to.loopAnimation = loop;
    to.play(loop);

    let progress = 0;
    const step = 1 / (duration * 60); // Approximate 60 FPS

    const fadeObservable = this.scene.onBeforeRenderObservable.add(() => {
      progress += step;
      from.setWeightForAllAnimatables(1 - progress);
      to.setWeightForAllAnimatables(progress);

      if (progress >= 1) {
        from.stop();
        to.setWeightForAllAnimatables(1);
        this.scene.onBeforeRenderObservable.remove(fadeObservable);
      }
    });
  }

  /**
   * Stops all animations
   */
  stopAll() {
    Object.values(this.animations).forEach((anim) => anim.stop());
    this.currentAnimation = null;
  }

  /**
   * Returns available animation names
   */
  getAvailableAnimations(): string[] {
    return Object.keys(this.animations);
  }
}
