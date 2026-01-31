// UI System - Health, Mask, Cooldown display
import { KaboomCtx, GameObj } from "kaboom";
import { gameState } from "../state";
import { MaskManager } from "../mechanics/MaskManager";
import { GAME_WIDTH, COLORS } from "../constants";

export interface UIElements {
  healthHearts: GameObj<any>[];
  maskIcon: GameObj<any>;
  maskName: GameObj<any>;
  cooldownBar: GameObj<any>;
  cooldownBarBg: GameObj<any>;
  levelText: GameObj<any>;
  objectiveText: GameObj<any>;
}

export function createUI(k: KaboomCtx, _maskManager: MaskManager): UIElements {
  const ui: UIElements = {
    healthHearts: [],
    maskIcon: null as any,
    maskName: null as any,
    cooldownBar: null as any,
    cooldownBarBg: null as any,
    levelText: null as any,
    objectiveText: null as any
  };

  // Level indicator
  ui.levelText = k.add([
    k.text(`Floor ${gameState.getCurrentLevel()}`, { size: 20 }),
    k.pos(GAME_WIDTH / 2, 15),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.z(100),
    "ui"
  ]);

  // Health hearts
  for (let i = 0; i < 3; i++) {
    const heart = k.add([
      k.text("❤️", { size: 24 }),
      k.pos(20 + i * 30, 20),
      k.z(100),
      "ui",
      "health-heart"
    ]);
    ui.healthHearts.push(heart);
  }

  // Mask icon background
  k.add([
    k.rect(50, 50, { radius: 8 }),
    k.pos(20, 60),
    k.color(30, 30, 40),
    k.outline(2, k.rgb(100, 100, 120)),
    k.z(100),
    "ui"
  ]);

  // Mask icon (colored square)
  ui.maskIcon = k.add([
    k.rect(40, 40, { radius: 6 }),
    k.pos(25, 65),
    k.color(100, 100, 100),
    k.z(101),
    "ui"
  ]);

  // Mask name
  ui.maskName = k.add([
    k.text("No Mask", { size: 12 }),
    k.pos(75, 75),
    k.color(200, 200, 200),
    k.z(100),
    "ui"
  ]);

  // Cooldown bar background
  ui.cooldownBarBg = k.add([
    k.rect(100, 8, { radius: 4 }),
    k.pos(75, 95),
    k.color(k.Color.fromHex(COLORS.ui.cooldownBg)),
    k.z(100),
    "ui"
  ]);

  // Cooldown bar
  ui.cooldownBar = k.add([
    k.rect(100, 8, { radius: 4 }),
    k.pos(75, 95),
    k.color(k.Color.fromHex(COLORS.ui.cooldown)),
    k.z(101),
    "ui"
  ]);

  // Objective text
  const objectives: Record<number, string> = {
    1: "Reach the elevator without being seen",
    2: "Survive for 15 seconds!",
    3: "Dodge enemies and reach the elevator",
    4: "Avoid projectiles and reach the elevator",
    5: "Defeat the Boss!"
  };

  ui.objectiveText = k.add([
    k.text(objectives[gameState.getCurrentLevel()] || "", { size: 14 }),
    k.pos(GAME_WIDTH - 20, 20),
    k.anchor("topright"),
    k.color(200, 200, 150),
    k.z(100),
    "ui"
  ]);

  return ui;
}

export function updateUI(k: KaboomCtx, ui: UIElements, maskManager: MaskManager): void {
  const playerState = gameState.getPlayerState();
  
  // Update health hearts
  ui.healthHearts.forEach((heart, index) => {
    if (index < playerState.health) {
      heart.text = "❤️";
      heart.opacity = 1;
    } else {
      heart.text = "🖤";
      heart.opacity = 0.5;
    }
  });

  // Hide hearts for survival level
  if (gameState.getCurrentLevel() === 2) {
    ui.healthHearts.forEach(heart => {
      heart.hidden = true;
    });
  }

  // Update mask display
  const currentMask = playerState.currentMask;
  if (currentMask) {
    ui.maskIcon.color = k.Color.fromHex(currentMask.color);
    ui.maskName.text = currentMask.nameVi;

    // Update cooldown bar
    const cooldownPercent = 1 - maskManager.getCooldownPercent(currentMask.id);
    ui.cooldownBar.width = 100 * cooldownPercent;

    // Color based on availability
    if (maskManager.canUseAbility(currentMask.id)) {
      ui.cooldownBar.color = k.rgb(100, 255, 100); // Green when ready
    } else {
      ui.cooldownBar.color = k.Color.fromHex(COLORS.ui.cooldown);
    }
  } else {
    ui.maskIcon.color = k.rgb(100, 100, 100);
    ui.maskName.text = "No Mask";
    ui.cooldownBar.width = 0;
  }

  // Update level text
  ui.levelText.text = `Floor ${gameState.getCurrentLevel()}`;

  // Boss level mask indicator
  if (gameState.getCurrentLevel() === 5 && playerState.collectedMasks.length > 0) {
    const maskNames = playerState.collectedMasks.map((m, i) => {
      const isActive = currentMask?.id === m.id;
      return isActive ? `[${i + 1}]` : `${i + 1}`;
    }).join(" ");
    ui.maskName.text = `${currentMask?.nameVi || ""}\n${maskNames}`;
  }
}
