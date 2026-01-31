// Gate Opening Cutscene - Detailed Sequential Mask Insertion
import { KaboomCtx, GameObj } from "kaboom";
import { MASK_SCALE_CUTSCENE } from "../mechanics/MaskManager.ts";

// Mask sprite names
const MASK_SPRITE_NAMES = ["mask-silence", "mask-ghost", "mask-frozen", "mask-shield"];
const MASK_COLORS = ["#4CAF50", "#9C27B0", "#00BCD4", "#F44336"];

export function gateOpeningScene(k: KaboomCtx): void {
  const screenW = k.width();
  const screenH = k.height();

  // ============= BACKGROUND =============
  k.add([
    k.rect(screenW, screenH),
    k.pos(0, 0),
    k.color(15, 15, 25),
    k.z(0),
    k.fixed()
  ]);

  // Flash overlay for slam effects
  const flashOverlay = k.add([
    k.rect(screenW, screenH),
    k.pos(0, 0),
    k.color(255, 255, 255),
    k.opacity(0),
    k.z(300),
    k.fixed()
  ]);

  // ============= SKIP BUTTON =============
  const skipBtnBg = k.add([
    k.rect(100, 35, { radius: 15 }),
    k.pos(screenW - 120, 20),
    k.color(60, 30, 30),
    k.outline(2, k.rgb(150, 80, 80)),
    k.opacity(0.8),
    k.area(),
    k.z(500),
    k.fixed(),
    "skip-btn"
  ]);

  k.add([
    k.text("SKIP ⏭", { size: 12 }),
    k.pos(screenW - 70, 38),
    k.anchor("center"),
    k.color(200, 150, 150),
    k.z(501),
    k.fixed()
  ]);

  skipBtnBg.onHover(() => { skipBtnBg.color = k.rgb(100, 50, 50); });
  skipBtnBg.onHoverEnd(() => { skipBtnBg.color = k.rgb(60, 30, 30); });
  skipBtnBg.onClick(() => { k.go("level5"); });

  // ============= THE GIANT DOUBLE DOORS =============
  const doorWidth = Math.min(180, screenW * 0.25);
  const doorHeight = Math.min(400, screenH * 0.7);
  const doorCenterX = screenW / 2;
  const doorCenterY = screenH / 2 + 20;
  const doorGap = 4; // Initial gap between doors

  // Door frame (dark metallic)
  k.add([
    k.rect(doorWidth * 2 + 40, doorHeight + 30, { radius: 6 }),
    k.pos(doorCenterX, doorCenterY),
    k.anchor("center"),
    k.color(25, 25, 35),
    k.outline(4, k.rgb(60, 50, 45)),
    k.z(1),
    k.fixed()
  ]);

  // Left door
  const leftDoor = k.add([
    k.rect(doorWidth, doorHeight, { radius: 3 }),
    k.pos(doorCenterX - doorWidth / 2 - doorGap / 2, doorCenterY),
    k.anchor("center"),
    k.color(50, 45, 60),
    k.outline(2, k.rgb(80, 70, 65)),
    k.z(2),
    k.fixed()
  ]);

  // Right door
  const rightDoor = k.add([
    k.rect(doorWidth, doorHeight, { radius: 3 }),
    k.pos(doorCenterX + doorWidth / 2 + doorGap / 2, doorCenterY),
    k.anchor("center"),
    k.color(50, 45, 60),
    k.outline(2, k.rgb(80, 70, 65)),
    k.z(2),
    k.fixed()
  ]);

  // Door center seam line
  k.add([
    k.rect(2, doorHeight - 20),
    k.pos(doorCenterX, doorCenterY),
    k.anchor("center"),
    k.color(30, 30, 40),
    k.z(3),
    k.fixed()
  ]);

  // Title above door
  k.add([
    k.text("SUPREME GATE", { size: 18 }),
    k.pos(doorCenterX, doorCenterY - doorHeight / 2 - 35),
    k.anchor("center"),
    k.color(160, 140, 100),
    k.z(10),
    k.fixed()
  ]);

  // ============= 4 MASK SLOTS (2 on each door) =============
  const slotSize = 45;
  const slotOffsetX = 55; // Distance from door center
  const slotOffsetY = 60; // Vertical spacing

  interface MaskSlot {
    x: number;
    y: number;
    frame: GameObj<any>;
    glow: GameObj<any>;
    filled: boolean;
  }

  const slots: MaskSlot[] = [];
  const slotPositions = [
    { x: doorCenterX - slotOffsetX, y: doorCenterY - slotOffsetY }, // Top left
    { x: doorCenterX + slotOffsetX, y: doorCenterY - slotOffsetY }, // Top right
    { x: doorCenterX - slotOffsetX, y: doorCenterY + slotOffsetY }, // Bottom left
    { x: doorCenterX + slotOffsetX, y: doorCenterY + slotOffsetY }  // Bottom right
  ];

  slotPositions.forEach((pos) => {
    // Slot frame
    const frame = k.add([
      k.rect(slotSize + 8, slotSize + 8, { radius: 6 }),
      k.pos(pos.x, pos.y),
      k.anchor("center"),
      k.color(35, 30, 40),
      k.outline(2, k.rgb(70, 60, 55)),
      k.z(4),
      k.fixed()
    ]);

    // Slot glow (initially dim)
    const glow = k.add([
      k.rect(slotSize, slotSize, { radius: 4 }),
      k.pos(pos.x, pos.y),
      k.anchor("center"),
      k.color(25, 25, 30),
      k.opacity(0.5),
      k.z(5),
      k.fixed()
    ]);

    slots.push({ x: pos.x, y: pos.y, frame, glow, filled: false });
  });

  // ============= MASKS (start off-screen) =============
  const masks: GameObj<any>[] = [];
  
  // Masks start at different off-screen positions
  const startPositions = [
    { x: -80, y: screenH * 0.3 },  // Left
    { x: screenW + 80, y: screenH * 0.4 }, // Right
    { x: -80, y: screenH * 0.6 },  // Left
    { x: screenW + 80, y: screenH * 0.7 }  // Right
  ];

  for (let i = 0; i < 4; i++) {
    const mask = k.add([
      k.sprite(MASK_SPRITE_NAMES[i]),
      k.pos(startPositions[i].x, startPositions[i].y),
      k.anchor("center"),
      k.scale(MASK_SCALE_CUTSCENE),
      k.opacity(0),
      k.z(20),
      k.fixed()
    ]);
    masks.push(mask);
  }

  // ============= LIGHT SPILL (hidden until doors open) =============
  const lightSpill = k.add([
    k.rect(20, doorHeight - 40),
    k.pos(doorCenterX, doorCenterY),
    k.anchor("center"),
    k.color(255, 250, 220),
    k.opacity(0),
    k.z(1),
    k.fixed()
  ]);

  // ============= DUST PARTICLES CONTAINER =============
  const dustParticles: GameObj<any>[] = [];

  function spawnDustParticles(): void {
    for (let i = 0; i < 15; i++) {
      const x = doorCenterX + k.rand(-doorWidth, doorWidth);
      const y = doorCenterY + doorHeight / 2 - 10;
      const particle = k.add([
        k.circle(k.rand(2, 4)),
        k.pos(x, y),
        k.anchor("center"),
        k.color(180, 170, 150),
        k.opacity(k.rand(0.4, 0.7)),
        k.z(50),
        k.fixed(),
        { vel: k.vec2(k.rand(-30, 30), k.rand(-60, -20)), life: k.rand(1.5, 2.5) }
      ]);
      dustParticles.push(particle);
    }
  }

  // ============= ANIMATION SEQUENCE =============
  let currentSlotIndex = 0;

  function highlightSlot(index: number): void {
    const slot = slots[index];
    // Pulsing glow effect
    k.tween(0.5, 1, 0.3, (val) => {
      slot.glow.opacity = val;
      slot.glow.color = k.rgb(255, 220, 100);
    }, k.easings.easeOutQuad);
  }

  function flyMaskToSlot(maskIndex: number, slotIndex: number, delay: number): void {
    const mask = masks[maskIndex];
    const slot = slots[slotIndex];

    k.wait(delay, () => {
      // Fade in mask
      mask.opacity = 1;
      
      // Fly to slot with easing
      k.tween(
        mask.pos,
        k.vec2(slot.x, slot.y),
        0.5,
        (val) => { mask.pos = val; },
        k.easings.easeInQuad
      ).onEnd(() => {
        // SLAM! Screen shake + flash
        k.shake(4);
        flashOverlay.opacity = 0.6;
        k.tween(0.6, 0, 0.2, (val) => { flashOverlay.opacity = val; }, k.easings.easeOutQuad);
        
        // Update slot visual
        slot.filled = true;
        slot.glow.color = k.Color.fromHex(MASK_COLORS[maskIndex]);
        slot.glow.opacity = 0.9;
        
        // Scale punch effect
        k.tween(1.3, 1, 0.15, (val) => {
          mask.scale = k.vec2(MASK_SCALE_CUTSCENE * val);
        }, k.easings.easeOutQuad);
        
        // Trigger next phase
        currentSlotIndex++;
        if (currentSlotIndex < 4) {
          highlightSlot(currentSlotIndex);
        }
      });
    });
  }

  function allSlotsGlow(): void {
    // All 4 slots pulse together
    slots.forEach((slot) => {
      k.tween(0.9, 1, 0.3, (val) => {
        slot.glow.opacity = val;
      }, k.easings.easeInOutQuad);
    });
    
    // Mechanical unlock effect
    k.shake(6);
    flashOverlay.opacity = 0.4;
    k.tween(0.4, 0, 0.5, (val) => { flashOverlay.opacity = val; }, k.easings.easeOutQuad);
  }

  function openDoors(): void {
    // Light spill appears
    k.tween(0, 1, 0.5, (val) => {
      lightSpill.opacity = val;
    }, k.easings.easeOutQuad);
    
    // Spawn dust particles
    spawnDustParticles();
    
    // Left door slides left
    const leftTarget = doorCenterX - doorWidth - 50;
    k.tween(
      leftDoor.pos.x,
      leftTarget,
      2,
      (val) => { leftDoor.pos.x = val; },
      k.easings.easeInOutQuad
    );
    
    // Right door slides right
    const rightTarget = doorCenterX + doorWidth + 50;
    k.tween(
      rightDoor.pos.x,
      rightTarget,
      2,
      (val) => { rightDoor.pos.x = val; },
      k.easings.easeInOutQuad
    );
    
    // Light spill expands
    k.tween(20, 300, 2, (val) => {
      lightSpill.width = val;
    }, k.easings.easeInOutQuad);
    
    // Final white fade
    k.wait(2.5, () => {
      k.tween(0, 1, 1, (val) => {
        flashOverlay.opacity = val;
      }, k.easings.easeInQuad).onEnd(() => {
        k.go("level5");
      });
    });
  }

  // ============= UPDATE LOOP =============
  k.onUpdate(() => {
    // Update dust particles
    for (let i = dustParticles.length - 1; i >= 0; i--) {
      const p = dustParticles[i];
      if (!p.exists()) {
        dustParticles.splice(i, 1);
        continue;
      }
      p.pos = p.pos.add(p.vel.scale(k.dt()));
      p.vel.y += 20 * k.dt(); // Slight gravity
      p.opacity -= k.dt() * 0.3;
      p.life -= k.dt();
      if (p.life <= 0 || p.opacity <= 0) {
        p.destroy();
        dustParticles.splice(i, 1);
      }
    }
  });

  // ============= SEQUENCE TIMING =============
  // Phase 1: Initial pause, then highlight slot 1
  k.wait(0.5, () => {
    highlightSlot(0);
  });

  // Phase 2-5: Masks fly in one by one
  flyMaskToSlot(0, 0, 1.0);  // Mask 1 at 1.0s
  flyMaskToSlot(1, 1, 2.0);  // Mask 2 at 2.0s
  flyMaskToSlot(2, 2, 3.0);  // Mask 3 at 3.0s
  flyMaskToSlot(3, 3, 4.0);  // Mask 4 at 4.0s

  // Phase 6: All slots glow, mechanical unlock
  k.wait(5.0, () => {
    allSlotsGlow();
  });

  // Phase 7: Doors open
  k.wait(5.8, () => {
    openDoors();
  });

  // Instruction text
  k.add([
    k.text("The 4 Masks awaken the Supreme Gate...", { size: 12 }),
    k.pos(doorCenterX, screenH - 30),
    k.anchor("center"),
    k.color(120, 110, 100),
    k.opacity(0.7),
    k.z(10),
    k.fixed()
  ]);
}
