// Mask Manager - Handles mask abilities and cooldowns
import { KaboomCtx, GameObj } from "kaboom";
import { MaskData } from "../types";
import { gameState } from "../state";
import { MASKS } from "../constants";

export class MaskManager {
  private k: KaboomCtx;
  private cooldowns: Map<string, number> = new Map();
  private activeEffects: Map<string, boolean> = new Map();

  constructor(k: KaboomCtx) {
    this.k = k;
    
    // Initialize cooldowns for all masks
    Object.keys(MASKS).forEach(maskId => {
      this.cooldowns.set(maskId, 0);
      this.activeEffects.set(maskId, false);
    });
  }

  // Get current cooldown remaining for a mask
  getCooldown(maskId: string): number {
    return this.cooldowns.get(maskId) || 0;
  }

  // Check if mask ability can be used
  canUseAbility(maskId: string): boolean {
    return (this.cooldowns.get(maskId) || 0) <= 0;
  }

  // Check if effect is currently active
  isEffectActive(maskId: string): boolean {
    return this.activeEffects.get(maskId) || false;
  }

  // Update cooldowns (call every frame)
  update(dt: number): void {
    this.cooldowns.forEach((cooldown, maskId) => {
      if (cooldown > 0) {
        this.cooldowns.set(maskId, Math.max(0, cooldown - dt));
      }
    });
  }

  // Activate mask ability
  activateAbility(player: GameObj<any>): void {
    const mask = gameState.getPlayerState().currentMask;
    if (!mask) return;
    if (!this.canUseAbility(mask.id)) return;

    // Set cooldown
    this.cooldowns.set(mask.id, mask.cooldown);
    this.activeEffects.set(mask.id, true);

    // Apply effect based on mask type
    switch (mask.id) {
      case "silence":
        this.activateSilence(player, mask);
        break;
      case "ghost":
        this.activateGhost(player, mask);
        break;
      case "frozen":
        this.activateFrozen(mask);
        break;
      case "shield":
        this.activateShield(player, mask);
        break;
    }
  }

  // Mask of Silence - Invisibility
  private activateSilence(player: GameObj<any>, mask: MaskData): void {
    gameState.setInvisible(true);
    
    // Visual feedback
    if (player.opacity !== undefined) {
      player.opacity = 0.3;
    }

    // Play activation sound/effect
    this.showAbilityText("INVISIBLE!");

    // End effect after duration
    this.k.wait(mask.duration, () => {
      gameState.setInvisible(false);
      if (player.opacity !== undefined) {
        player.opacity = 1;
      }
      this.activeEffects.set(mask.id, false);
    });
  }

  // Ghost Mask - Ethereal Form
  private activateGhost(player: GameObj<any>, mask: MaskData): void {
    gameState.setEthereal(true);
    
    // Visual feedback - blue tint
    if (player.color) {
      player.color = this.k.rgb(129, 212, 250);
    }

    this.showAbilityText("ETHEREAL!");

    // End effect after duration
    this.k.wait(mask.duration, () => {
      gameState.setEthereal(false);
      if (player.color) {
        player.color = this.k.rgb(79, 195, 247);
      }
      this.activeEffects.set(mask.id, false);
    });
  }

  // Frozen Mask - Time Freeze
  private activateFrozen(mask: MaskData): void {
    gameState.setTimeFrozen(true);

    this.showAbilityText("TIME FREEZE!");

    // End effect after duration
    this.k.wait(mask.duration, () => {
      gameState.setTimeFrozen(false);
      this.activeEffects.set(mask.id, false);
    });
  }

  // Shield Mask - Reflection
  private activateShield(_player: GameObj<any>, mask: MaskData): void {
    gameState.setShielding(true);

    this.showAbilityText("SHIELD!");

    // End effect after duration
    this.k.wait(mask.duration, () => {
      gameState.setShielding(false);
      this.activeEffects.set(mask.id, false);
    });
  }

  // Show ability activation text
  private showAbilityText(text: string): void {
    const textObj = this.k.add([
      this.k.text(text, { size: 32 }),
      this.k.pos(this.k.width() / 2, this.k.height() / 2 - 50),
      this.k.anchor("center"),
      this.k.color(255, 255, 100),
      this.k.opacity(1),
      this.k.z(100),
      "ability-text"
    ]);

    // Fade out animation
    this.k.tween(
      1,
      0,
      0.5,
      (val) => { textObj.opacity = val; },
      this.k.easings.easeOutQuad
    ).onEnd(() => {
      textObj.destroy();
    });

    // Move up animation
    this.k.tween(
      textObj.pos.y,
      textObj.pos.y - 50,
      0.5,
      (val) => { textObj.pos.y = val; },
      this.k.easings.easeOutQuad
    );
  }

  // Switch to next collected mask (for boss level)
  switchToNextMask(): void {
    const masks = gameState.getCollectedMasks();
    if (masks.length === 0) return;

    const currentMask = gameState.getPlayerState().currentMask;
    if (!currentMask) {
      gameState.setCurrentMask(masks[0]);
      return;
    }

    const currentIndex = masks.findIndex(m => m.id === currentMask.id);
    const nextIndex = (currentIndex + 1) % masks.length;
    gameState.setCurrentMask(masks[nextIndex]);
  }

  // Switch to specific mask by index
  switchToMaskByIndex(index: number): void {
    const masks = gameState.getCollectedMasks();
    if (index >= 0 && index < masks.length) {
      gameState.setCurrentMask(masks[index]);
    }
  }

  // Set mask by index (alias for switchToMaskByIndex)
  setMask(index: number): void {
    this.switchToMaskByIndex(index);
  }

  // Cycle to next mask
  cycleMask(): void {
    const masks = gameState.getCollectedMasks();
    if (masks.length === 0) return;
    
    const currentMask = gameState.getPlayerState().currentMask;
    let currentIndex = currentMask ? masks.findIndex(m => m.id === currentMask.id) : -1;
    const nextIndex = (currentIndex + 1) % masks.length;
    gameState.setCurrentMask(masks[nextIndex]);
  }

  // Get cooldown percentage (0-1) for UI
  getCooldownPercent(maskId: string): number {
    const mask = MASKS[maskId];
    if (!mask) return 0;
    
    const remaining = this.cooldowns.get(maskId) || 0;
    return remaining / mask.cooldown;
  }

  // Reset all cooldowns
  reset(): void {
    this.cooldowns.forEach((_, maskId) => {
      this.cooldowns.set(maskId, 0);
      this.activeEffects.set(maskId, false);
    });
    
    gameState.setInvisible(false);
    gameState.setEthereal(false);
    gameState.setShielding(false);
    gameState.setTimeFrozen(false);
  }
}
