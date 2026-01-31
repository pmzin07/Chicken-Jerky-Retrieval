// Gate Opening Cutscene - Anime-style Mask Assembly Sequence
import { KaboomCtx, GameObj } from "kaboom";
import { MASKS } from "../constants.ts";
import { MASK_SCALE_CUTSCENE } from "../mechanics/MaskManager.ts";

// Mask sprite names for the 4 masks
const MASK_SPRITE_NAMES = ["mask-silence", "mask-ghost", "mask-frozen", "mask-shield"];

export function gateOpeningScene(k: KaboomCtx): void {
  const screenW = k.width();
  const screenH = k.height();

  // ============= PHASE 1: BLACKOUT =============
  const blackout = k.add([
    k.rect(screenW, screenH),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(1),
    k.z(0),
    k.fixed()
  ]);

  // Flash overlay for slam effects
  const flashOverlay = k.add([
    k.rect(screenW, screenH),
    k.pos(0, 0),
    k.color(255, 255, 255),
    k.opacity(0),
    k.z(200),
    k.fixed()
  ]);

  // ============= SKIP BUTTON (Distinct Style) =============
  const skipBtnBg = k.add([
    k.rect(120, 40, { radius: 20 }),
    k.pos(screenW - 140, 25),
    k.color(80, 40, 40),
    k.outline(3, k.rgb(200, 100, 100)),
    k.opacity(0.9),
    k.area(),
    k.z(500),
    k.fixed(),
    "skip-btn"
  ]);

  k.add([
    k.text("⏭ SKIP", { size: 14 }),
    k.pos(screenW - 80, 45),
    k.anchor("center"),
    k.color(255, 200, 200),
    k.z(501),
    k.fixed()
  ]);

  skipBtnBg.onHover(() => {
    skipBtnBg.color = k.rgb(120, 60, 60);
  });

  skipBtnBg.onHoverEnd(() => {
    skipBtnBg.color = k.rgb(80, 40, 40);
  });

  skipBtnBg.onClick(() => {
    k.go("level5");
  });

  // ============= THE GIANT DOOR =============
  const doorWidth = Math.min(400, screenW * 0.6);
  const doorHeight = Math.min(500, screenH * 0.8);
  const doorX = screenW / 2;
  const doorY = screenH / 2;

  // Door frame (dark metallic)
  k.add([
    k.rect(doorWidth + 20, doorHeight + 20, { radius: 8 }),
    k.pos(doorX, doorY),
    k.anchor("center"),
    k.color(30, 30, 40),
    k.outline(6, k.rgb(80, 70, 60)),
    k.z(1),
    k.fixed()
  ]);

  // Door surface (imposing metallic)
  const door = k.add([
    k.rect(doorWidth, doorHeight, { radius: 4 }),
    k.pos(doorX, doorY),
    k.anchor("center"),
    k.color(60, 55, 70),
    k.outline(3, k.rgb(100, 90, 80)),
    k.z(2),
    k.fixed()
  ]);

  // Metallic texture lines on door
  for (let i = 0; i < 8; i++) {
    k.add([
      k.rect(doorWidth - 40, 2),
      k.pos(doorX, doorY - doorHeight/2 + 50 + i * (doorHeight - 80) / 7),
      k.anchor("center"),
      k.color(80, 75, 90),
      k.opacity(0.5),
      k.z(3),
      k.fixed()
    ]);
  }

  // Door title
  k.add([
    k.text("SUPREME GATE", { size: 20 }),
    k.pos(doorX, doorY - doorHeight/2 - 30),
    k.anchor("center"),
    k.color(180, 150, 100),
    k.z(10),
    k.fixed()
  ]);

  // ============= 4 MASK SLOTS ON DOOR =============
  const slotSize = 50;
  const slotSpacing = 100;
  const slotY = doorY;
  const slotsStartX = doorX - (slotSpacing * 1.5);
  
  interface MaskSlot {
    x: number;
    y: number;
    mask: typeof MASKS[keyof typeof MASKS];
    filled: boolean;
    visual: GameObj<any>;
  }

  const maskOrder = [MASKS.silence, MASKS.ghost, MASKS.frozen, MASKS.shield];
  const slots: MaskSlot[] = [];

  // Create empty slots
  for (let i = 0; i < 4; i++) {
    const slotX = slotsStartX + i * slotSpacing;
    
    // Slot frame
    k.add([
      k.rect(slotSize + 10, slotSize + 10, { radius: 8 }),
      k.pos(slotX, slotY),
      k.anchor("center"),
      k.color(40, 35, 45),
      k.outline(3, k.rgb(90, 80, 70)),
      k.z(4),
      k.fixed()
    ]);

    // Empty slot glow
    const slotVisual = k.add([
      k.rect(slotSize, slotSize, { radius: 6 }),
      k.pos(slotX, slotY),
      k.anchor("center"),
      k.color(20, 20, 25),
      k.outline(2, k.rgb(60, 50, 40)),
      k.opacity(0.8),
      k.z(5),
      k.fixed()
    ]);

    slots.push({
      x: slotX,
      y: slotY,
      mask: maskOrder[i],
      filled: false,
      visual: slotVisual
    });
  }

  // ============= FLOATING MASKS (start at center, spinning in spotlight) =============
  const masksStartY = screenH / 2; // Start in center
  const floatingMasks: GameObj<any>[] = [];
  const maskIcons: GameObj<any>[] = [];

  // Spotlight effect in center
  const spotlight = k.add([
    k.circle(100),
    k.pos(screenW / 2, screenH / 2),
    k.anchor("center"),
    k.color(255, 255, 200),
    k.opacity(0),
    k.z(15),
    k.fixed()
  ]);

  for (let i = 0; i < 4; i++) {
    const mask = maskOrder[i];
    const maskSprite = k.add([
      k.sprite(MASK_SPRITE_NAMES[i]),
      k.pos(screenW / 2, masksStartY),
      k.anchor("center"),
      k.scale(MASK_SCALE_CUTSCENE),
      k.opacity(0),
      k.z(20),
      k.fixed(),
      {
        maskIndex: i,
        bobOffset: i * 0.5,
        orbitAngle: (i / 4) * Math.PI * 2,
        orbitRadius: 70
      }
    ]);

    // Mask glow effect (colored circle behind sprite)
    const glowSprite = k.add([
      k.circle(35),
      k.pos(screenW / 2, masksStartY),
      k.anchor("center"),
      k.color(k.Color.fromHex(mask.color)),
      k.opacity(0),
      k.z(19),
      k.fixed(),
      { parentMask: maskSprite }
    ]);

    floatingMasks.push(maskSprite);
    maskIcons.push(glowSprite);
    
    // Glow follows mask
    glowSprite.onUpdate(() => {
      glowSprite.pos = maskSprite.pos;
      glowSprite.opacity = maskSprite.opacity * 0.4;
    });
  }

  // ============= ANIMATION SEQUENCE =============
  let animationPhase = 0;
  let currentMaskIndex = 0;

  // Phase 0: Masks float up to view (1.5s)
  // Phase 1-4: Each mask flies to slot (1s each)
  // Phase 5: Door shakes and opens (2s)
  // Phase 6: Transition to level5

  function playClankSound(): void {
    // Visual "clank" effect - flash the slot
    if (slots[currentMaskIndex - 1]) {
      const slot = slots[currentMaskIndex - 1];
      slot.visual.color = k.rgb(255, 255, 200);
      k.wait(0.1, () => {
        slot.visual.color = k.Color.fromHex(slot.mask.color);
      });
    }
    
    // FLASH EFFECT for each mask slam
    k.tween(0.7, 0, 0.25, (val) => {
      flashOverlay.opacity = val;
    }, k.easings.easeOutQuad);
    
    // Screen shake for impact (shake(2) as requested)
    k.shake(2);
  }

  function animateMaskToSlot(maskIndex: number): void {
    const mask = floatingMasks[maskIndex];
    const icon = maskIcons[maskIndex];
    const slot = slots[maskIndex];
    
    // Scale pulse before flying
    k.tween(1.2, 1.5, 0.15, (val) => {
      mask.scale = k.vec2(val, val);
    }, k.easings.easeOutQuad);

    k.wait(0.15, () => {
      // Fly to slot with acceleration
      k.tween(
        mask.pos,
        k.vec2(slot.x, slot.y),
        0.6,
        (val) => { mask.pos = val; },
        k.easings.easeInCubic
      ).onEnd(() => {
        // Slam effect - shrink to slot size
        k.tween(1.5, 1, 0.1, (val) => {
          mask.scale = k.vec2(val, val);
        }, k.easings.easeOutQuad);

        slot.filled = true;
        slot.visual.color = k.Color.fromHex(slot.mask.color);
        slot.visual.opacity = 1;
        
        // Hide the floating mask icon
        icon.opacity = 0;
        mask.opacity = 0;
        
        playClankSound();
        currentMaskIndex++;
        animationPhase++;
      });
    });
  }

  function shakeAndOpenDoor(): void {
    // Shake effect
    let shakeTimer = 0;
    const shakeInterval = k.onUpdate(() => {
      shakeTimer += k.dt();
      door.pos.x = doorX + Math.sin(shakeTimer * 30) * 3;
      
      if (shakeTimer > 1.5) {
        shakeInterval.cancel();
        door.pos.x = doorX;
        openDoor();
      }
    });
  }

  function openDoor(): void {
    // Light beams from door
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI - Math.PI / 2;
      const beam = k.add([
        k.rect(8, 0),
        k.pos(doorX, doorY),
        k.anchor("bot"),
        k.rotate(angle * (180 / Math.PI)),
        k.color(255, 240, 180),
        k.opacity(0.8),
        k.z(50),
        k.fixed()
      ]);
      
      k.tween(0, 500, 1, (val) => {
        beam.height = val;
        beam.opacity = 0.8 - val / 800;
      }, k.easings.easeOutQuad);
    }

    // Door opens (fade to white then transition)
    const whiteFade = k.add([
      k.rect(screenW, screenH),
      k.pos(0, 0),
      k.color(255, 255, 255),
      k.opacity(0),
      k.z(100),
      k.fixed()
    ]);

    k.tween(0, 1, 1.5, (val) => {
      whiteFade.opacity = val;
    }, k.easings.easeInQuad).onEnd(() => {
      k.go("level5");
    });
  }

  // Initial delay then start animation
  k.wait(0.3, () => {
    // Blackout effect first
    k.tween(0, 0.9, 0.5, (val) => {
      blackout.opacity = val;
    }, k.easings.easeInQuad);

    // Spotlight fades in
    k.tween(0, 0.4, 0.8, (val) => {
      spotlight.opacity = val;
    }, k.easings.easeOutQuad);

    // Phase 0: Masks fade in at center, then orbit
    k.wait(0.5, () => {
      floatingMasks.forEach((mask, i) => {
        // Fade in masks
        k.tween(0, 0.9, 0.5, (val) => {
          mask.opacity = val;
          maskIcons[i].opacity = val;
        }, k.easings.easeOutQuad);

        // Scale up with bounce
        k.tween(0.5, 1.2, 0.4, (val) => {
          mask.scale = k.vec2(val, val);
        }, k.easings.easeOutBack);
      });
    });

    // After masks appear, fade blackout slightly for orbiting phase
    k.wait(1.5, () => {
      k.tween(0.9, 0.6, 0.5, (val) => {
        blackout.opacity = val;
      }, k.easings.easeOutQuad);
      animationPhase = 1;
    });
  });

  // Orbiting animation variables
  let orbitSpeed = 1.5; // rad/s

  // Main animation loop
  k.onUpdate(() => {
    // Phase 0: Masks orbit in spotlight with spinning effect
    if (animationPhase === 0 || animationPhase === 1) {
      floatingMasks.forEach((mask) => {
        if (mask.opacity < 0.1) return;
        
        // Update orbit angle
        mask.orbitAngle += orbitSpeed * k.dt();
        
        // Calculate orbit position
        const centerX = screenW / 2;
        const centerY = screenH / 2;
        mask.pos.x = centerX + Math.cos(mask.orbitAngle) * mask.orbitRadius;
        mask.pos.y = centerY + Math.sin(mask.orbitAngle) * mask.orbitRadius + Math.sin(k.time() * 3 + mask.bobOffset) * 5;
      });
    }

    // Animation phases - masks fly to slots one by one
    if (animationPhase >= 2 && animationPhase <= 5) {
      if (currentMaskIndex === animationPhase - 2) {
        // Increase orbit speed briefly before mask breaks away
        orbitSpeed = 0;
        animateMaskToSlot(currentMaskIndex);
      }
    }

    if (animationPhase === 6) {
      animationPhase = 7; // Prevent re-triggering
      k.wait(0.5, () => {
        shakeAndOpenDoor();
      });
    }
  });

  // Start mask flying sequence after orbiting
  k.wait(3.5, () => {
    animationPhase = 2;
  });

  // Text instruction
  k.add([
    k.text("4 Masks activate the Supreme Gate...", { size: 14 }),
    k.pos(screenW / 2, screenH - 40),
    k.anchor("center"),
    k.color(150, 140, 120),
    k.opacity(0.8),
    k.z(10),
    k.fixed()
  ]);
}
