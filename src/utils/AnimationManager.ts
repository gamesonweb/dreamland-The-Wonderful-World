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
    if (this.currentAnimation === anim) return;

    if (this.currentAnimation) {
      this.crossFade(this.currentAnimation, anim, 0.3);
    } else {
      anim.reset();
      anim.loopAnimation = loop;
      anim.play(true);
    }

    if (onEnd && !loop) {
      const observer = anim.onAnimationGroupEndObservable.addOnce(() => {
        onEnd();
      });
      // Clean up observer if animation is stopped prematurely
      anim.onAnimationGroupPlayObservable.addOnce(() => {
        anim.onAnimationGroupEndObservable.remove(observer);
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
  crossFade(from: AnimationGroup, to: AnimationGroup, duration: number) {
    to.reset();
    to.loopAnimation = true;
    to.play(true);

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
